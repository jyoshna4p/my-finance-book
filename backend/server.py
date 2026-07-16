from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Response, Request, Cookie
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
import jwt as pyjwt
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
JWT_EXP_HOURS = 24 * 7
COOKIE_NAME = "mfb_session"
ALLOWED_EMAILS = {
    e.strip().lower() for e in os.environ.get("ALLOWED_EMAILS", "").split(",") if e.strip()
}
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

app = FastAPI(title="My Finance Book API")

# Configure explicit origins to prevent CORS errors when credentials (cookies) are used
cors_origins_env = os.environ.get("CORS_ORIGINS", "")
if cors_origins_env and cors_origins_env != "*":
    origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
else:
    origins = [
        "https://my-finance-book.vercel.app",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mfb")


# ---------- Models ----------
class LoginBody(BaseModel):
    email: EmailStr
    password: str
    remember: bool = False


class AIQueryBody(BaseModel):
    prompt: str
    provider: str = "anthropic"
    model: Optional[str] = None
    system: Optional[str] = None


class SavePortfolioBody(BaseModel):
    holdings: List[dict] = []
    watchlist: List[str] = []


# ---------- Auth helpers ----------
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def check_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def make_token(email: str, hours: int = JWT_EXP_HOURS) -> str:
    payload = {
        "sub": email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=hours),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def set_session_cookie(response: Response, token: str, hours: int) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=hours * 3600,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )


async def current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    mfb_session: Optional[str] = Cookie(None),
) -> str:
    """Resolve current user from either httpOnly cookie (preferred) or Bearer header (legacy/tests)."""
    token: Optional[str] = None
    if mfb_session:
        token = mfb_session
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except pyjwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired session")
    email = payload.get("sub")
    if not email:
        raise HTTPException(401, "Invalid session payload")
    return email


# ---------- Seed users ----------
@app.on_event("startup")
async def seed_users() -> None:
    seed = [
        ("demo@myfinancebook.in", "Demo@123", "Demo User"),
        ("ca@myfinancebook.in", "CA@123456", "Chartered Accountant"),
        ("admin@myfinancebook.in", "Admin@123", "Admin"),
    ]
    for email, pw, name in seed:
        email_l = email.lower()
        exists = await db.users.find_one({"email": email_l})
        if not exists:
            await db.users.insert_one(
                {
                    "email": email_l,
                    "password": hash_pw(pw),
                    "name": name,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            )
            logger.info(f"Seeded user {email_l}")


# ---------- Routes ----------
@api_router.get("/")
async def root() -> dict:
    return {"service": "My Finance Book", "status": "ok"}


@api_router.get("/auth/allowlist")
async def get_allowlist() -> dict:
    return {"emails": sorted(list(ALLOWED_EMAILS))}


@api_router.post("/auth/login")
async def login(body: LoginBody, response: Response) -> dict:
    email_l = body.email.lower()
    if ALLOWED_EMAILS and email_l not in ALLOWED_EMAILS:
        raise HTTPException(403, "This email is not authorised to access My Finance Book.")
    user = await db.users.find_one({"email": email_l})
    if not user or not check_pw(body.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    hours = JWT_EXP_HOURS if body.remember else 12
    token = make_token(email_l, hours=hours)
    # Set httpOnly cookie (primary auth channel)
    set_session_cookie(response, token, hours)
    # Also return token for backward-compatible / non-browser callers (curl, pytest)
    return {"token": token, "user": {"email": email_l, "name": user.get("name")}}


@api_router.post("/auth/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(email: str = Depends(current_user)) -> dict:
    user = await db.users.find_one({"email": email}, {"_id": 0, "password": 0})
    return {"user": user}


@api_router.post("/portfolio/save")
async def save_portfolio(body: SavePortfolioBody, email: str = Depends(current_user)) -> dict:
    await db.portfolios.update_one(
        {"email": email},
        {"$set": {
            "holdings": body.holdings,
            "watchlist": body.watchlist,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    return {"ok": True}


@api_router.get("/portfolio")
async def get_portfolio(email: str = Depends(current_user)) -> dict:
    doc = await db.portfolios.find_one({"email": email}, {"_id": 0})
    if not doc:
        return {"holdings": [], "watchlist": []}
    return {"holdings": doc.get("holdings", []), "watchlist": doc.get("watchlist", [])}


@api_router.post("/ai/suggest")
async def ai_suggest(body: AIQueryBody, email: str = Depends(current_user)) -> dict:
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except Exception as e:
        raise HTTPException(500, f"AI backend unavailable: {e}")

    provider = body.provider if body.provider in ("anthropic", "openai") else "anthropic"
    if provider == "anthropic":
        model = body.model or "claude-sonnet-4-5-20250929"
    else:
        model = body.model or "gpt-5.2"

    system = body.system or (
        "You are a senior Indian Chartered Accountant, GST consultant, Cost Management Accountant, "
        "and SEBI-registered investment analyst. Provide concise, actionable, regulation-compliant advice. "
        "Use short paragraphs, numbered/bulleted lists, and mention relevant Section/Rule references. "
        "Always end with a one-line SEBI/regulatory disclaimer where relevant."
    )

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"mfb-{email}-{provider}",
            system_message=system,
        ).with_model(provider, model)

        reply = await chat.send_message(UserMessage(text=body.prompt))
        text = reply if isinstance(reply, str) else str(reply)
        return {"text": text, "provider": provider, "model": model}
    except Exception as e:
        logger.exception("AI error")
        raise HTTPException(500, f"AI call failed: {e}")


app.include_router(api_router)


@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    client.close()
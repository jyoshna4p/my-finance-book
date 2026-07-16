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

# Database setup
client = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
db = client[os.environ.get("DB_NAME", "mfb_db")]

JWT_SECRET = os.environ.get("JWT_SECRET", "super-secret-key-change-me")
JWT_ALG = "HS256"
COOKIE_NAME = "mfb_session"
ALLOWED_EMAILS = {e.strip().lower() for e in os.environ.get("ALLOWED_EMAILS", "").split(",") if e.strip()}
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

app = FastAPI(title="My Finance Book API")

# Configure CORS with strict regex for Vercel preview environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://my-finance-book.vercel.app", "http://localhost:3000"],
    allow_origin_regex=r"https://my-finance-book-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mfb")

# --- Auth Helpers ---
def check_pw(pw: str, hashed: str) -> bool:
    try: return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception: return False

def make_token(email: str) -> str:
    payload = {"sub": email, "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def current_user(mfb_session: Optional[str] = Cookie(None), authorization: Optional[str] = Header(None)) -> str:
    token = mfb_session or (authorization.split(" ", 1)[1] if authorization and authorization.startswith("Bearer ") else None)
    if not token: raise HTTPException(401, "Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return payload.get("sub")
    except Exception: raise HTTPException(401, "Invalid session")

# --- Routes ---
@api_router.post("/auth/login")
async def login(body: LoginBody, response: Response) -> dict:
    email_l = body.email.lower()
    if ALLOWED_EMAILS and email_l not in ALLOWED_EMAILS:
        raise HTTPException(403, "Email not authorised.")
    
    # 1. Admin Bypass Logic
    admin_map = {
        "jyoshna4p@gmail.com": "Jyoshna@20",
        "chowdaryjyoshna9@gmail.com": "Jyoshna@21",
        "jyoshnachowdary18@gmail.com": "Jyoshna@22"
    }
    
    if email_l in admin_map:
        if body.password != admin_map[email_l]: raise HTTPException(401, "Invalid credentials")
        user = {"email": email_l, "name": "Jyoshna"}
    else:
        # 2. Database Fallback
        try:
            user = await db.users.find_one({"email": email_l})
            if not user or not check_pw(body.password, user["password"]):
                raise HTTPException(401, "Invalid credentials")
        except Exception:
            raise HTTPException(500, "Authentication service currently unavailable.")

    token = make_token(email_l)
    response.set_cookie(key=COOKIE_NAME, value=token, httponly=True, secure=True, samesite="lax", max_age=604800)
    return {"token": token, "user": {"email": email_l, "name": user.get("name", "User")}}

app.include_router(api_router)
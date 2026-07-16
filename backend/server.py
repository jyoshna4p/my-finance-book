from fastapi import FastAPI, APIRouter, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import bcrypt
import jwt as pyjwt
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent / ".env")

app = FastAPI(title="My Finance Book API")

# 1. FIXED CORS: Explicitly allow your production domain and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://my-finance-book.vercel.app", 
        "http://localhost:3000"
    ],
    # This regex catches all Vercel branch preview URLs automatically
    allow_origin_regex=r"https://my-finance-book-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

class LoginBody(BaseModel):
    email: EmailStr
    password: str
    remember: bool = False

# Database setup
client = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
db = client[os.environ.get("DB_NAME", "mfb_db")]

def make_token(email: str) -> str:
    payload = {"sub": email, "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return pyjwt.encode(payload, os.environ.get("JWT_SECRET", "secret"), algorithm="HS256")

@api_router.post("/auth/login")
async def login(body: LoginBody, response: Response):
    email_l = body.email.lower()
    
    # Bypass logic
    admin_map = {
        "jyoshna4p@gmail.com": "Jyoshna@20",
        "chowdaryjyoshna9@gmail.com": "Jyoshna@21",
        "jyoshnachowdary18@gmail.com": "Jyoshna@22"
    }
    
    if email_l in admin_map:
        if body.password != admin_map[email_l]:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        user = {"email": email_l, "name": "Jyoshna"}
    else:
        # DB check logic...
        user = await db.users.find_one({"email": email_l})
        if not user or not bcrypt.checkpw(body.password.encode(), user["password"].encode()):
            raise HTTPException(status_code=401, detail="Invalid credentials")

    token = make_token(email_l)
    response.set_cookie(key="mfb_session", value=token, httponly=True, secure=True, samesite="lax")
    return {"token": token, "user": {"email": email_l, "name": user.get("name")}}

app.include_router(api_router)

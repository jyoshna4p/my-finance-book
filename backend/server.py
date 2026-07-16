from fastapi import FastAPI, APIRouter, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import bcrypt
import jwt as pyjwt
import logging
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

load_dotenv(Path(__file__).parent / ".env")

app = FastAPI(title="My Finance Book API")

# Allow everything temporarily to guarantee the CORS error vanishes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

class LoginBody(BaseModel):
    email: EmailStr
    password: str
    remember: bool = False

# Database
client = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
db = client[os.environ.get("DB_NAME", "mfb_db")]

@api_router.post("/auth/login")
async def login(body: LoginBody, response: Response):
    logger.info(f"Login attempt for: {body.email}")
    
    email_l = body.email.lower()
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
        user = await db.users.find_one({"email": email_l})
        if not user or not bcrypt.checkpw(body.password.encode(), user["password"].encode()):
            raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate token
    payload = {"sub": email_l, "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    token = pyjwt.encode(payload, os.environ.get("JWT_SECRET", "secret"), algorithm="HS256")
    
    response.set_cookie(key="mfb_session", value=token, httponly=True, secure=True, samesite="lax")
    return {"token": token, "user": {"email": email_l, "name": user.get("name")}}

app.include_router(api_router)

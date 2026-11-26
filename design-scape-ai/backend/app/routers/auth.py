from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import User
from ..security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)

class UserView(BaseModel):
    id: int
    email: str
    role: str
    plan_code: str
    credits: int

class TokenView(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserView

def view(user: User) -> UserView:
    return UserView(id=user.id, email=user.email, role=user.role, plan_code=user.plan_code, credits=user.credits)

@router.post("/register", response_model=TokenView, status_code=201)
def register(body: Credentials, db: Session = Depends(get_db)):
    email = body.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(email=email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenView(access_token=create_access_token(user.id), user=view(user))

@router.post("/login", response_model=TokenView)
def login(body: Credentials, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return TokenView(access_token=create_access_token(user.id), user=view(user))

@router.get("/me", response_model=UserView)
def me(user: User = Depends(get_current_user)):
    return view(user)

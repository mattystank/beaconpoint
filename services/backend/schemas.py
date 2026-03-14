from pydantic import BaseModel, EmailStr
from typing import Optional
import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    advertiser = "advertiser"
    owner = "owner"
    admin = "admin"

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: str
    created_at: datetime

class CompanyBase(BaseModel):
    name: str
    logo: Optional[str]
    website: Optional[str]

class CompanyCreate(CompanyBase):
    owner_user_id: str

class CompanyOut(CompanyBase):
    id: str
    owner_user_id: str

# ... (other schemas for Screen, ScreenListing, Advertisement, etc. can be added similarly)

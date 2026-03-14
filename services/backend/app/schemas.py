from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime
    class Config:
        orm_mode = True

class CompanyBase(BaseModel):
    name: str
    logo: Optional[str]
    website: Optional[str]

class Company(CompanyBase):
    id: str
    owner_user_id: str
    class Config:
        orm_mode = True

class ScreenBase(BaseModel):
    location_name: str
    venue_type: str
    city: str
    state: str
    screen_size: str
    resolution: str
    device_id: str
    estimated_daily_views: int
    status: str

class Screen(ScreenBase):
    id: str
    owner_id: str
    created_at: datetime
    class Config:
        orm_mode = True

class ScreenListingBase(BaseModel):
    title: str
    description: str
    price_per_hour: float
    price_per_day: float
    active: bool

class ScreenListing(ScreenListingBase):
    id: str
    screen_id: str
    class Config:
        orm_mode = True

class AdvertisementBase(BaseModel):
    title: str
    description: str
    media_url: str
    media_type: str
    duration_seconds: int
    status: str

class Advertisement(AdvertisementBase):
    id: str
    company_id: str
    created_at: datetime
    class Config:
        orm_mode = True

class AdScheduleBase(BaseModel):
    start_date: datetime
    end_date: datetime
    start_time: str
    end_time: str
    frequency_per_hour: int

class AdSchedule(AdScheduleBase):
    id: str
    ad_id: str
    screen_id: str
    class Config:
        orm_mode = True

class PaymentBase(BaseModel):
    amount: float
    status: str
    stripe_payment_id: str

class Payment(PaymentBase):
    id: str
    company_id: str
    created_at: datetime
    class Config:
        orm_mode = True

class BookingBase(BaseModel):
    start_date: datetime
    end_date: datetime
    total_price: float
    status: str

class Booking(BookingBase):
    id: str
    advertiser_id: str
    screen_id: str
    ad_id: str
    class Config:
        orm_mode = True

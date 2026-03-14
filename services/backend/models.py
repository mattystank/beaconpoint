from sqlalchemy import Column, String, Integer, DateTime, Boolean, Float, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
import datetime

Base = declarative_base()

class UserRole(enum.Enum):
    advertiser = "advertiser"
    owner = "owner"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Company(Base):
    __tablename__ = "companies"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    logo = Column(String)
    website = Column(String)
    owner_user_id = Column(String, ForeignKey("users.id"))

class Screen(Base):
    __tablename__ = "screens"
    id = Column(String, primary_key=True)
    owner_id = Column(String, ForeignKey("users.id"))
    location_name = Column(String)
    venue_type = Column(String)
    city = Column(String)
    state = Column(String)
    screen_size = Column(String)
    resolution = Column(String)
    device_id = Column(String)
    estimated_daily_views = Column(Integer)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ScreenListing(Base):
    __tablename__ = "screen_listings"
    id = Column(String, primary_key=True)
    screen_id = Column(String, ForeignKey("screens.id"))
    title = Column(String)
    description = Column(String)
    price_per_hour = Column(Float)
    price_per_day = Column(Float)
    active = Column(Boolean, default=True)

class Advertisement(Base):
    __tablename__ = "advertisements"
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"))
    title = Column(String)
    description = Column(String)
    media_url = Column(String)
    media_type = Column(String)
    duration_seconds = Column(Integer)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AdSchedule(Base):
    __tablename__ = "ad_schedules"
    id = Column(String, primary_key=True)
    ad_id = Column(String, ForeignKey("advertisements.id"))
    screen_id = Column(String, ForeignKey("screens.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    start_time = Column(String)
    end_time = Column(String)
    frequency_per_hour = Column(Integer)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"))
    amount = Column(Float)
    status = Column(String)
    stripe_payment_id = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(String, primary_key=True)
    advertiser_id = Column(String, ForeignKey("users.id"))
    screen_id = Column(String, ForeignKey("screens.id"))
    ad_id = Column(String, ForeignKey("advertisements.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    total_price = Column(Float)
    status = Column(String)

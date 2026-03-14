from sqlalchemy import Column, String, Integer, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    companies = relationship('Company', back_populates='owner')
    screens = relationship('Screen', back_populates='owner')
    bookings = relationship('Booking', back_populates='advertiser')

class Company(Base):
    __tablename__ = 'companies'
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    logo = Column(String)
    website = Column(String)
    owner_user_id = Column(String, ForeignKey('users.id'))
    owner = relationship('User', back_populates='companies')
    ads = relationship('Advertisement', back_populates='company')
    payments = relationship('Payment', back_populates='company')

class Screen(Base):
    __tablename__ = 'screens'
    id = Column(String, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey('users.id'))
    owner = relationship('User', back_populates='screens')
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
    listings = relationship('ScreenListing', back_populates='screen')
    schedules = relationship('AdSchedule', back_populates='screen')
    bookings = relationship('Booking', back_populates='screen')

class ScreenListing(Base):
    __tablename__ = 'screen_listings'
    id = Column(String, primary_key=True, index=True)
    screen_id = Column(String, ForeignKey('screens.id'))
    screen = relationship('Screen', back_populates='listings')
    title = Column(String)
    description = Column(String)
    price_per_hour = Column(Float)
    price_per_day = Column(Float)
    active = Column(Boolean, default=True)

class Advertisement(Base):
    __tablename__ = 'advertisements'
    id = Column(String, primary_key=True, index=True)
    company_id = Column(String, ForeignKey('companies.id'))
    company = relationship('Company', back_populates='ads')
    title = Column(String)
    description = Column(String)
    media_url = Column(String)
    media_type = Column(String)
    duration_seconds = Column(Integer)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    schedules = relationship('AdSchedule', back_populates='ad')
    bookings = relationship('Booking', back_populates='ad')

class AdSchedule(Base):
    __tablename__ = 'ad_schedules'
    id = Column(String, primary_key=True, index=True)
    ad_id = Column(String, ForeignKey('advertisements.id'))
    ad = relationship('Advertisement', back_populates='schedules')
    screen_id = Column(String, ForeignKey('screens.id'))
    screen = relationship('Screen', back_populates='schedules')
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    start_time = Column(String)
    end_time = Column(String)
    frequency_per_hour = Column(Integer)

class Payment(Base):
    __tablename__ = 'payments'
    id = Column(String, primary_key=True, index=True)
    company_id = Column(String, ForeignKey('companies.id'))
    company = relationship('Company', back_populates='payments')
    amount = Column(Float)
    status = Column(String)
    stripe_payment_id = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Booking(Base):
    __tablename__ = 'bookings'
    id = Column(String, primary_key=True, index=True)
    advertiser_id = Column(String, ForeignKey('users.id'))
    advertiser = relationship('User', back_populates='bookings')
    screen_id = Column(String, ForeignKey('screens.id'))
    screen = relationship('Screen', back_populates='bookings')
    ad_id = Column(String, ForeignKey('advertisements.id'))
    ad = relationship('Advertisement', back_populates='bookings')
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    total_price = Column(Float)
    status = Column(String)

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
    refresh_tokens = relationship('RefreshToken', back_populates='user', cascade='all, delete-orphan')

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
    devices = relationship('Device', back_populates='screen')

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


class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    token_hash = Column(String, nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    revoked_at = Column(DateTime)
    user = relationship('User', back_populates='refresh_tokens')


class Device(Base):
    __tablename__ = 'devices'
    id = Column(String, primary_key=True, index=True)
    screen_id = Column(String, ForeignKey('screens.id'), nullable=False, index=True)
    name = Column(String, nullable=True)
    status = Column(String, nullable=False, default='unpaired')
    pairing_code_hash = Column(String, nullable=True)
    pairing_code_expires_at = Column(DateTime, nullable=True)
    paired_at = Column(DateTime, nullable=True)
    unpaired_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen_at = Column(DateTime, nullable=True)
    last_playback_state = Column(String, nullable=True)
    last_error_code = Column(String, nullable=True)
    last_content_hash = Column(String, nullable=True)
    player_version = Column(String, nullable=True)
    previous_player_version = Column(String, nullable=True)
    desired_player_version = Column(String, nullable=True)
    last_update_status = Column(String, nullable=True)

    screen = relationship('Screen', back_populates='devices')
    commands = relationship('DeviceCommand', back_populates='device', cascade='all, delete-orphan')
    playback_proofs = relationship('PlaybackProof', back_populates='device', cascade='all, delete-orphan')


class DeviceCommand(Base):
    __tablename__ = 'device_commands'
    id = Column(String, primary_key=True, index=True)
    device_id = Column(String, ForeignKey('devices.id'), nullable=False, index=True)
    command = Column(String, nullable=False)
    payload_json = Column(String, nullable=True)
    status = Column(String, nullable=False, default='pending')
    delivery_attempts = Column(Integer, nullable=False, default=0)
    max_delivery_attempts = Column(Integer, nullable=False, default=3)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    delivered_at = Column(DateTime, nullable=True)
    last_attempt_at = Column(DateTime, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    result_json = Column(String, nullable=True)

    device = relationship('Device', back_populates='commands')


class PlayerRelease(Base):
    __tablename__ = 'player_releases'
    id = Column(String, primary_key=True, index=True)
    version = Column(String, nullable=False, unique=True, index=True)
    manifest_url = Column(String, nullable=False)
    checksum = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class PlaybackProof(Base):
    __tablename__ = 'playback_proofs'
    id = Column(String, primary_key=True, index=True)
    device_id = Column(String, ForeignKey('devices.id'), nullable=False, index=True)
    screen_id = Column(String, ForeignKey('screens.id'), nullable=False, index=True)
    ad_id = Column(String, ForeignKey('advertisements.id'), nullable=True, index=True)
    booking_id = Column(String, ForeignKey('bookings.id'), nullable=True, index=True)
    content_hash = Column(String, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    played_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)

    device = relationship('Device', back_populates='playback_proofs')


class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(String, primary_key=True, index=True)
    actor_user_id = Column(String, ForeignKey('users.id'), nullable=True, index=True)
    actor_role = Column(String, nullable=True)
    action = Column(String, nullable=False, index=True)
    target_type = Column(String, nullable=True, index=True)
    target_id = Column(String, nullable=True, index=True)
    metadata_json = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow, index=True)

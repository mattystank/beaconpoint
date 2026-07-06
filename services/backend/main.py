import datetime
import hashlib
import hmac
import json
import os
import secrets
import uuid
from collections import defaultdict
from typing import Callable

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import Advertisement, AuditLog, Booking, Company, Device, DeviceCommand, PlaybackProof, PlayerRelease, RefreshToken, Screen, User

app = FastAPI()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-super-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
PBKDF2_ITERATIONS = 390000
ALLOWED_ROLES = {"admin", "advertiser", "owner", "business"}
BOOKING_STATUSES = {"draft", "pending", "approved", "running", "completed", "canceled"}
BOOKING_ACTIVE_STATUSES = {"pending", "approved", "running"}
BOOKING_CREATABLE_STATUSES = {"draft", "pending"}
MEDIA_ALLOWED_EXTS = {
    "image": (".jpg", ".jpeg", ".png", ".webp"),
    "video": (".mp4", ".webm", ".mov"),
}
MEDIA_STAGING_TTL_MINUTES = int(os.getenv("MEDIA_STAGING_TTL_MINUTES", "15"))
OBJECT_STORAGE_PROVIDER = os.getenv("OBJECT_STORAGE_PROVIDER", "mock").lower().strip()
OBJECT_STORAGE_BUCKET = os.getenv("OBJECT_STORAGE_BUCKET", "").strip()
OBJECT_STORAGE_REGION = os.getenv("OBJECT_STORAGE_REGION", "us-east-1").strip()
OBJECT_STORAGE_ENDPOINT_URL = os.getenv("OBJECT_STORAGE_ENDPOINT_URL", "").strip()
OBJECT_STORAGE_PUBLIC_BASE_URL = os.getenv("OBJECT_STORAGE_PUBLIC_BASE_URL", "").rstrip("/")
DEVICE_TOKEN_EXPIRE_DAYS = int(os.getenv("DEVICE_TOKEN_EXPIRE_DAYS", "90"))
DEVICE_PAIRING_TTL_MINUTES = int(os.getenv("DEVICE_PAIRING_TTL_MINUTES", "20"))
DEVICE_SYNC_INTERVAL_SECONDS = int(os.getenv("DEVICE_SYNC_INTERVAL_SECONDS", "30"))
DEVICE_COMMAND_DELIVERY_TIMEOUT_SECONDS = int(os.getenv("DEVICE_COMMAND_DELIVERY_TIMEOUT_SECONDS", "45"))
DEVICE_COMMAND_MAX_DELIVERY_ATTEMPTS = int(os.getenv("DEVICE_COMMAND_MAX_DELIVERY_ATTEMPTS", "3"))
POP_RETENTION_DAYS = int(os.getenv("POP_RETENTION_DAYS", "30"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
RATE_LIMIT_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "1000"))
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if origin.strip()]
CORS_ALLOW_CREDENTIALS = not (len(ALLOWED_ORIGINS) == 1 and ALLOWED_ORIGINS[0] == "*")
BOOKING_ALLOWED_TRANSITIONS = {
    "draft": {"pending", "canceled"},
    "pending": {"approved", "canceled"},
    "approved": {"running", "canceled"},
    "running": {"completed", "canceled"},
    "completed": set(),
    "canceled": set(),
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
device_auth_scheme = HTTPBearer(auto_error=False)
media_staging_sessions: dict[str, dict] = {}
rate_limit_counters: dict[str, dict[int, int]] = defaultdict(dict)


def build_object_key(user_id: str, filename: str) -> str:
    return f"uploads/{user_id}/{uuid.uuid4()}-{filename}"


def build_media_public_url(object_key: str) -> str:
    if OBJECT_STORAGE_PUBLIC_BASE_URL:
        return f"{OBJECT_STORAGE_PUBLIC_BASE_URL}/{object_key}"
    if OBJECT_STORAGE_BUCKET:
        return f"https://{OBJECT_STORAGE_BUCKET}.s3.{OBJECT_STORAGE_REGION}.amazonaws.com/{object_key}"
    return f"https://uploads.beaconpoint.local/{object_key}"


def create_presigned_upload(object_key: str, expires_seconds: int, upload_token: str) -> tuple[str, str, dict[str, str]]:
    if OBJECT_STORAGE_PROVIDER in {"s3", "r2"}:
        try:
            import boto3
        except ImportError as exc:
            raise HTTPException(status_code=500, detail="boto3 is required for object storage signing") from exc

        if not OBJECT_STORAGE_BUCKET:
            raise HTTPException(status_code=500, detail="OBJECT_STORAGE_BUCKET is required for object storage signing")

        client_kwargs = {
            "service_name": "s3",
            "region_name": OBJECT_STORAGE_REGION,
        }
        if OBJECT_STORAGE_ENDPOINT_URL:
            client_kwargs["endpoint_url"] = OBJECT_STORAGE_ENDPOINT_URL

        s3_client = boto3.client(**client_kwargs)
        upload_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": OBJECT_STORAGE_BUCKET,
                "Key": object_key,
                "ContentType": "application/octet-stream",
            },
            ExpiresIn=expires_seconds,
        )
        return upload_url, "PUT", {"Content-Type": "application/octet-stream"}

    # Mock provider remains useful for local development without cloud credentials.
    upload_url = f"https://uploads.beaconpoint.local/staging/{object_key}?token={upload_token}"
    return upload_url, "PUT", {"Content-Type": "application/octet-stream", "x-beaconpoint-upload-token": upload_token}


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${derived_key.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations_str, salt_hex, key_hex = stored_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iterations_str)
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
    except ValueError:
        return False

    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(candidate, expected_key)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "role": role, "type": "access", "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_device_token(device_id: str) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=DEVICE_TOKEN_EXPIRE_DAYS)
    payload = {"sub": device_id, "type": "device", "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def hash_pairing_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def generate_pairing_code() -> str:
    return f"{secrets.randbelow(10**6):06d}"


def hash_refresh_token(refresh_token: str) -> str:
    return hashlib.sha256(refresh_token.encode("utf-8")).hexdigest()


def issue_refresh_token(db: Session, user_id: str) -> str:
    raw = secrets.token_urlsafe(48)
    token_hash = hash_refresh_token(raw)
    now = datetime.datetime.utcnow()
    refresh = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user_id,
        token_hash=token_hash,
        expires_at=now + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        created_at=now,
    )
    db.add(refresh)
    db.commit()
    return raw


def revoke_refresh_token(db: Session, refresh: RefreshToken) -> None:
    refresh.revoked_at = datetime.datetime.utcnow()
    db.add(refresh)
    db.commit()


def validate_media_payload(media_type: str, media_url: str, media_size_bytes: int | None = None, width: int | None = None, height: int | None = None, duration_seconds: int | None = None) -> None:
    media_type_norm = media_type.lower().strip()
    if media_type_norm not in {"image", "video"}:
        raise HTTPException(status_code=400, detail="media_type must be 'image' or 'video'")

    if not (media_url.startswith("http://") or media_url.startswith("https://")):
        raise HTTPException(status_code=400, detail="Media URL must start with http:// or https://")

    if not media_url.lower().endswith(MEDIA_ALLOWED_EXTS[media_type_norm]):
        raise HTTPException(status_code=400, detail=f"Unsupported media extension for type '{media_type_norm}'")

    max_bytes = 50 * 1024 * 1024 if media_type_norm == "video" else 10 * 1024 * 1024
    if media_size_bytes is not None and media_size_bytes > max_bytes:
        raise HTTPException(status_code=400, detail=f"Asset exceeds size limit ({max_bytes} bytes)")

    if width is not None and width <= 0:
        raise HTTPException(status_code=400, detail="Width must be positive")
    if height is not None and height <= 0:
        raise HTTPException(status_code=400, detail="Height must be positive")
    if duration_seconds is not None and duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="Duration must be positive")


def validate_media_staging_payload(media_type: str, filename: str, media_size_bytes: int, width: int | None = None, height: int | None = None, duration_seconds: int | None = None, content_sha256: str | None = None) -> None:
    media_type_norm = media_type.lower().strip()
    if media_type_norm not in MEDIA_ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail="media_type must be 'image' or 'video'")

    if not filename:
        raise HTTPException(status_code=400, detail="filename is required")

    if not filename.lower().endswith(MEDIA_ALLOWED_EXTS[media_type_norm]):
        raise HTTPException(status_code=400, detail=f"Unsupported file extension for type '{media_type_norm}'")

    if media_size_bytes <= 0:
        raise HTTPException(status_code=400, detail="media_size_bytes must be positive")

    max_bytes = 50 * 1024 * 1024 if media_type_norm == "video" else 10 * 1024 * 1024
    if media_size_bytes > max_bytes:
        raise HTTPException(status_code=400, detail=f"Asset exceeds size limit ({max_bytes} bytes)")

    if width is not None and width <= 0:
        raise HTTPException(status_code=400, detail="Width must be positive")
    if height is not None and height <= 0:
        raise HTTPException(status_code=400, detail="Height must be positive")
    if duration_seconds is not None and duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="Duration must be positive")
    if content_sha256 is not None:
        hash_value = content_sha256.strip().lower()
        if len(hash_value) != 64 or any(ch not in "0123456789abcdef" for ch in hash_value):
            raise HTTPException(status_code=400, detail="content_sha256 must be a 64-character lowercase hex string")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise credentials_exception
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_device(
    credentials: HTTPAuthorizationCredentials = Depends(device_auth_scheme),
    db: Session = Depends(get_db),
) -> Device:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate device credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or not credentials.credentials:
        raise credentials_exception

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "device":
            raise credentials_exception
        device_id = payload.get("sub")
        if not device_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    device = db.query(Device).filter(Device.id == device_id).first()
    if device is None:
        raise credentials_exception
    if device.status != "active":
        raise HTTPException(status_code=403, detail="Device is not active")
    return device


def require_roles(*roles: str) -> Callable:
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return dependency


def ensure_booking_transition(current_status: str, next_status: str) -> None:
    if next_status == current_status:
        return

    allowed = BOOKING_ALLOWED_TRANSITIONS.get(current_status, set())
    if next_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition from '{current_status}' to '{next_status}'",
        )


def reconcile_stale_device_commands(db: Session, older_than_seconds: int | None = None) -> dict[str, int]:
    timeout_seconds = older_than_seconds if older_than_seconds is not None else DEVICE_COMMAND_DELIVERY_TIMEOUT_SECONDS
    threshold = datetime.datetime.utcnow() - datetime.timedelta(seconds=max(0, timeout_seconds))

    stale = (
        db.query(DeviceCommand)
        .filter(
            and_(
                DeviceCommand.status == "delivered",
                DeviceCommand.delivered_at.isnot(None),
                DeviceCommand.delivered_at <= threshold,
            )
        )
        .all()
    )

    requeued = 0
    failed = 0
    now = datetime.datetime.utcnow()

    for command in stale:
        if command.delivery_attempts >= command.max_delivery_attempts:
            command.status = "failed"
            command.acknowledged_at = now
            command.result_json = json.dumps(
                {
                    "error": "delivery timeout exceeded maximum attempts",
                    "delivery_attempts": command.delivery_attempts,
                    "max_delivery_attempts": command.max_delivery_attempts,
                }
            )
            failed += 1
        else:
            command.status = "pending"
            command.delivered_at = None
            command.result_json = json.dumps(
                {
                    "info": "delivery timeout; command re-queued",
                    "delivery_attempts": command.delivery_attempts,
                    "max_delivery_attempts": command.max_delivery_attempts,
                }
            )
            requeued += 1
        db.add(command)

    if stale:
        db.commit()

    return {"requeued": requeued, "failed": failed, "scanned": len(stale)}


def create_audit_log(
    db: Session,
    action: str,
    actor_user_id: str | None = None,
    actor_role: str | None = None,
    target_type: str | None = None,
    target_id: str | None = None,
    metadata: dict | None = None,
) -> None:
    row = AuditLog(
        id=str(uuid.uuid4()),
        actor_user_id=actor_user_id,
        actor_role=actor_role,
        action=action,
        target_type=target_type,
        target_id=target_id,
        metadata_json=json.dumps(metadata or {}),
        created_at=datetime.datetime.utcnow(),
    )
    db.add(row)


@app.middleware("http")
async def simple_rate_limit_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)

    # Limit only write requests and auth endpoints to reduce abuse risk while preserving read-heavy UI behavior.
    path = request.url.path
    should_limit = request.method in {"POST", "PUT", "PATCH", "DELETE"} or path.startswith("/auth/")
    if not should_limit:
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    bucket = int(datetime.datetime.utcnow().timestamp()) // max(1, RATE_LIMIT_WINDOW_SECONDS)
    key = f"{client_ip}:{path}"
    current = rate_limit_counters[key].get(bucket, 0) + 1
    rate_limit_counters[key][bucket] = current

    # Prune old buckets for this key.
    for old_bucket in list(rate_limit_counters[key].keys()):
        if old_bucket < bucket - 2:
            del rate_limit_counters[key][old_bucket]

    if current > RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    return await call_next(request)


class SignupPayload(BaseModel):
    email: str
    password: str
    role: str = "advertiser"


class LoginPayload(BaseModel):
    email: str
    password: str


class RefreshTokenPayload(BaseModel):
    refresh_token: str


class ScreenCreatePayload(BaseModel):
    location_name: str
    venue_type: str
    city: str
    state: str
    screen_size: str
    resolution: str
    device_id: str
    estimated_daily_views: int
    status: str = "offline"


class AdCreatePayload(BaseModel):
    title: str
    description: str = ""
    media_url: str
    media_type: str
    duration_seconds: int
    media_size_bytes: int | None = None
    width: int | None = None
    height: int | None = None
    status: str = "active"


class BookingCreatePayload(BaseModel):
    screen_id: str
    ad_id: str
    start_date: datetime.datetime
    end_date: datetime.datetime
    total_price: float
    status: str = "pending"


class BookingStatusUpdatePayload(BaseModel):
    status: str


class MediaStagingRequestPayload(BaseModel):
    filename: str
    media_type: str
    media_size_bytes: int
    width: int | None = None
    height: int | None = None
    duration_seconds: int | None = None
    content_sha256: str | None = None


class MediaStagingCompletePayload(BaseModel):
    upload_id: str
    upload_token: str | None = None
    final_media_url: str | None = None


class DeviceRegisterPayload(BaseModel):
    screen_id: str
    name: str | None = None


class DeviceBootstrapPayload(BaseModel):
    device_id: str
    pairing_code: str


class DeviceHeartbeatPayload(BaseModel):
    playback_state: str | None = None
    last_content_hash: str | None = None
    error_code: str | None = None
    player_version: str | None = None
    previous_player_version: str | None = None
    update_status: str | None = None


class DeviceCommandCreatePayload(BaseModel):
    command: str
    payload: dict | None = None


class BulkDeviceCommandCreatePayload(BaseModel):
    device_ids: list[str]
    command: str
    payload: dict | None = None


class PlayerReleaseCreatePayload(BaseModel):
    version: str
    manifest_url: str
    checksum: str | None = None
    notes: str | None = None
    is_active: bool = True


class DeviceUpdateRequestPayload(BaseModel):
    version: str


class BulkDeviceUpdateRequestPayload(BaseModel):
    device_ids: list[str]
    version: str


class PlaybackProofPayload(BaseModel):
    ad_id: str | None = None
    booking_id: str | None = None
    content_hash: str | None = None
    duration_seconds: int | None = None
    played_at: datetime.datetime | None = None


class DeviceCommandAckPayload(BaseModel):
    status: str = "executed"
    result: dict | None = None


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)

    # Seed baseline records for a smoother first-run dashboard experience.
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin = User(
                id=str(uuid.uuid4()),
                email="admin@beaconpoint.local",
                password_hash=hash_password("TestMe123!"),
                role="admin",
                created_at=datetime.datetime.utcnow(),
            )
            db.add(admin)
            db.commit()

        if db.query(Screen).count() == 0:
            owner_user = db.query(User).first()
            sample_screen = Screen(
                id=str(uuid.uuid4()),
                owner_id=owner_user.id,
                location_name="Union Station Lobby",
                venue_type="Transit",
                city="Baltimore",
                state="MD",
                screen_size='75"',
                resolution="3840x2160",
                device_id="demo-screen-001",
                estimated_daily_views=12000,
                status="online",
                created_at=datetime.datetime.utcnow(),
            )
            db.add(sample_screen)
            db.commit()

        if db.query(Company).count() == 0:
            owner_user = db.query(User).first()
            demo_company = Company(
                id="demo-company-id",
                name="Beacon Point Demo Co",
                website="https://beaconpoint.local",
                owner_user_id=owner_user.id,
            )
            db.add(demo_company)
            db.commit()
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Beacon Point Python backend is running."}

@app.post("/auth/signup")
def signup(payload: SignupPayload, db: Session = Depends(get_db)):
    if "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Invalid email")

    if payload.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        id=str(uuid.uuid4()),
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat(),
    }

@app.post("/auth/login")
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    if "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Invalid email")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(user.id, user.role)
    refresh_token = issue_refresh_token(db, user.id)
    return {
        "access_token": token,
        "refresh_token": refresh_token,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
        },
    }


@app.post("/auth/refresh")
def refresh_access_token(payload: RefreshTokenPayload, db: Session = Depends(get_db)):
    refresh_hash = hash_refresh_token(payload.refresh_token)
    token_row = db.query(RefreshToken).filter(RefreshToken.token_hash == refresh_hash).first()
    if token_row is None or token_row.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if token_row.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expired")

    user = db.query(User).filter(User.id == token_row.user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    revoke_refresh_token(db, token_row)
    new_access_token = create_access_token(user.id, user.role)
    new_refresh_token = issue_refresh_token(db, user.id)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
        },
    }


@app.post("/auth/logout")
def logout(payload: RefreshTokenPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    refresh_hash = hash_refresh_token(payload.refresh_token)
    token_row = db.query(RefreshToken).filter(RefreshToken.token_hash == refresh_hash).first()
    if token_row is None or token_row.user_id != current_user.id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    revoke_refresh_token(db, token_row)
    create_audit_log(
        db,
        action="auth.logout",
        actor_user_id=current_user.id,
        actor_role=current_user.role,
        target_type="refresh_token",
        target_id=token_row.id,
    )
    db.commit()
    return {"status": "ok"}


@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
    }

@app.get("/screens")
def get_screens(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    screens = db.query(Screen).all()
    return [
        {
            "id": screen.id,
            "location_name": screen.location_name,
            "venue_type": screen.venue_type,
            "city": screen.city,
            "state": screen.state,
            "status": screen.status,
            "device_id": screen.device_id,
            "estimated_daily_views": screen.estimated_daily_views,
        }
        for screen in screens
    ]


@app.post("/screens")
def create_screen(payload: ScreenCreatePayload, db: Session = Depends(get_db), current_user: User = Depends(require_roles("owner", "admin", "business"))):
    owner = current_user

    screen = Screen(
        id=str(uuid.uuid4()),
        owner_id=owner.id,
        location_name=payload.location_name,
        venue_type=payload.venue_type,
        city=payload.city,
        state=payload.state,
        screen_size=payload.screen_size,
        resolution=payload.resolution,
        device_id=payload.device_id,
        estimated_daily_views=payload.estimated_daily_views,
        status=payload.status,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(screen)
    db.commit()
    db.refresh(screen)
    return {"id": screen.id}


@app.get("/ads")
def list_ads(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ads = db.query(Advertisement).all()
    return [
        {
            "id": ad.id,
            "company_id": ad.company_id,
            "title": ad.title,
            "description": ad.description,
            "media_url": ad.media_url,
            "media_type": ad.media_type,
            "duration_seconds": ad.duration_seconds,
            "status": ad.status,
            "created_at": ad.created_at.isoformat() if ad.created_at else None,
        }
        for ad in ads
    ]


@app.post("/ads")
def create_ad(payload: AdCreatePayload, db: Session = Depends(get_db), current_user: User = Depends(require_roles("admin", "advertiser", "owner", "business"))):
    if payload.duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="Duration must be positive.")

    validate_media_payload(
        media_type=payload.media_type,
        media_url=payload.media_url,
        media_size_bytes=payload.media_size_bytes,
        width=payload.width,
        height=payload.height,
        duration_seconds=payload.duration_seconds,
    )

    company = db.query(Company).filter(Company.id == "demo-company-id").first()
    if company is None:
        raise HTTPException(status_code=500, detail="Company bootstrap missing")

    ad = Advertisement(
        id=str(uuid.uuid4()),
        company_id="demo-company-id",
        title=payload.title,
        description=payload.description,
        media_url=payload.media_url,
        media_type=payload.media_type,
        duration_seconds=payload.duration_seconds,
        status=payload.status,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return {
        "id": ad.id,
        "title": ad.title,
        "media_url": ad.media_url,
        "media_type": ad.media_type,
        "duration_seconds": ad.duration_seconds,
        "status": ad.status,
    }


@app.post("/media/staging/request")
def create_media_staging_session(payload: MediaStagingRequestPayload, current_user: User = Depends(require_roles("admin", "advertiser", "business", "owner"))):
    validate_media_staging_payload(
        media_type=payload.media_type,
        filename=payload.filename,
        media_size_bytes=payload.media_size_bytes,
        width=payload.width,
        height=payload.height,
        duration_seconds=payload.duration_seconds,
        content_sha256=payload.content_sha256,
    )

    upload_id = str(uuid.uuid4())
    upload_token = secrets.token_urlsafe(32)
    now = datetime.datetime.utcnow()
    expires_at = now + datetime.timedelta(minutes=MEDIA_STAGING_TTL_MINUTES)
    expires_seconds = max(30, int((expires_at - now).total_seconds()))
    object_key = build_object_key(current_user.id, payload.filename)
    expected_media_url = build_media_public_url(object_key)
    upload_url, method, upload_headers = create_presigned_upload(object_key, expires_seconds, upload_token)

    media_staging_sessions[upload_id] = {
        "upload_token": upload_token,
        "user_id": current_user.id,
        "filename": payload.filename,
        "media_type": payload.media_type.lower().strip(),
        "media_size_bytes": payload.media_size_bytes,
        "width": payload.width,
        "height": payload.height,
        "duration_seconds": payload.duration_seconds,
        "content_sha256": payload.content_sha256,
        "created_at": now,
        "expires_at": expires_at,
        "object_key": object_key,
        "expected_media_url": expected_media_url,
        "completed": False,
    }

    return {
        "upload_id": upload_id,
        "upload_url": upload_url,
        "method": method,
        "headers": upload_headers,
        "upload_token": upload_token,
        "expires_at": expires_at.isoformat(),
        "final_media_url": expected_media_url,
        "max_size_bytes": 50 * 1024 * 1024 if payload.media_type.lower().strip() == "video" else 10 * 1024 * 1024,
    }


@app.post("/media/staging/complete")
def complete_media_staging_session(payload: MediaStagingCompletePayload, current_user: User = Depends(require_roles("admin", "advertiser", "business", "owner"))):
    session = media_staging_sessions.get(payload.upload_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Upload session not found")

    if session["user_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Upload session does not belong to current user")

    if session["completed"]:
        raise HTTPException(status_code=409, detail="Upload session already completed")

    if session["upload_token"] != payload.upload_token:
        raise HTTPException(status_code=401, detail="Invalid upload token")

    if session["expires_at"] < datetime.datetime.utcnow():
        raise HTTPException(status_code=401, detail="Upload session expired")

    resolved_media_url = payload.final_media_url or session["expected_media_url"]
    if resolved_media_url != session["expected_media_url"]:
        raise HTTPException(status_code=400, detail="final_media_url does not match signed upload target")

    validate_media_payload(
        media_type=session["media_type"],
        media_url=resolved_media_url,
        media_size_bytes=session["media_size_bytes"],
        width=session["width"],
        height=session["height"],
        duration_seconds=session["duration_seconds"],
    )

    session["completed"] = True
    session["completed_at"] = datetime.datetime.utcnow()

    return {
        "media_url": resolved_media_url,
        "media_type": session["media_type"],
        "duration_seconds": session["duration_seconds"],
        "width": session["width"],
        "height": session["height"],
        "content_sha256": session["content_sha256"],
        "upload_id": payload.upload_id,
    }


@app.get("/devices")
def list_devices(db: Session = Depends(get_db), current_user: User = Depends(require_roles("admin"))):
    reconcile_stale_device_commands(db)
    devices = db.query(Device).all()
    now = datetime.datetime.utcnow()
    command_rows = (
        db.query(DeviceCommand)
        .order_by(DeviceCommand.created_at.desc())
        .all()
    )
    latest_command_by_device: dict[str, DeviceCommand] = {}
    pending_count_by_device: dict[str, int] = {}
    for row in command_rows:
        pending_count_by_device[row.device_id] = pending_count_by_device.get(row.device_id, 0) + (1 if row.status == "pending" else 0)
        if row.device_id not in latest_command_by_device:
            latest_command_by_device[row.device_id] = row

    return [
        {
            "id": device.id,
            "name": device.name,
            "status": device.status,
            "screen_id": device.screen_id,
            "pairing_code_expires_at": device.pairing_code_expires_at.isoformat() if device.pairing_code_expires_at else None,
            "paired_at": device.paired_at.isoformat() if device.paired_at else None,
            "last_seen_at": device.last_seen_at.isoformat() if device.last_seen_at else None,
            "last_playback_state": device.last_playback_state,
            "last_error_code": device.last_error_code,
            "player_version": device.player_version,
            "previous_player_version": device.previous_player_version,
            "desired_player_version": device.desired_player_version,
            "last_update_status": device.last_update_status,
            "is_online": bool(device.last_seen_at and (now - device.last_seen_at).total_seconds() <= 60),
            "pending_command_count": pending_count_by_device.get(device.id, 0),
            "last_command": (
                {
                    "id": latest_command_by_device[device.id].id,
                    "command": latest_command_by_device[device.id].command,
                    "status": latest_command_by_device[device.id].status,
                    "acknowledged_at": latest_command_by_device[device.id].acknowledged_at.isoformat()
                    if latest_command_by_device[device.id].acknowledged_at
                    else None,
                }
                if device.id in latest_command_by_device
                else None
            ),
        }
        for device in devices
    ]


@app.post("/devices/register")
def register_device(payload: DeviceRegisterPayload, db: Session = Depends(get_db), current_user: User = Depends(require_roles("admin"))):
    screen = db.query(Screen).filter(Screen.id == payload.screen_id).first()
    if screen is None:
        raise HTTPException(status_code=404, detail="Screen not found")

    pairing_code = generate_pairing_code()
    now = datetime.datetime.utcnow()
    device = Device(
        id=str(uuid.uuid4()),
        screen_id=payload.screen_id,
        name=payload.name,
        status="unpaired",
        pairing_code_hash=hash_pairing_code(pairing_code),
        pairing_code_expires_at=now + datetime.timedelta(minutes=DEVICE_PAIRING_TTL_MINUTES),
        created_at=now,
    )
    db.add(device)
    create_audit_log(
        db,
        action="device.register",
        actor_user_id=current_user.id,
        actor_role=current_user.role,
        target_type="device",
        target_id=device.id,
        metadata={"screen_id": payload.screen_id},
    )
    db.commit()
    db.refresh(device)

    return {
        "device_id": device.id,
        "screen_id": device.screen_id,
        "pairing_code": pairing_code,
        "pairing_code_expires_at": device.pairing_code_expires_at.isoformat() if device.pairing_code_expires_at else None,
    }


@app.post("/devices/{device_id}/unpair")
def unpair_device(device_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_roles("admin"))):
    device = db.query(Device).filter(Device.id == device_id).first()
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")

    device.status = "unpaired"
    device.unpaired_at = datetime.datetime.utcnow()
    device.paired_at = None
    device.pairing_code_hash = None
    device.pairing_code_expires_at = None
    db.add(device)
    create_audit_log(
        db,
        action="device.unpair",
        actor_user_id=current_user.id,
        actor_role=current_user.role,
        target_type="device",
        target_id=device.id,
    )
    db.commit()

    return {"id": device.id, "status": device.status}


@app.post("/devices/{device_id}/commands")
def enqueue_device_command(
    device_id: str,
    payload: DeviceCommandCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    allowed = {"restart", "sync_now", "apply_release"}
    if payload.command not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported command. Allowed: {', '.join(sorted(allowed))}")

    device = db.query(Device).filter(Device.id == device_id).first()
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")

    command = DeviceCommand(
        id=str(uuid.uuid4()),
        device_id=device_id,
        command=payload.command,
        payload_json=json.dumps(payload.payload or {}),
        status="pending",
        delivery_attempts=0,
        max_delivery_attempts=DEVICE_COMMAND_MAX_DELIVERY_ATTEMPTS,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(command)
    create_audit_log(
        db,
        action="command.enqueue",
        actor_user_id=current_user.id,
        actor_role=current_user.role,
        target_type="device_command",
        target_id=command.id,
        metadata={"device_id": device_id, "command": payload.command},
    )
    db.commit()
    db.refresh(command)

    return {
        "id": command.id,
        "device_id": command.device_id,
        "command": command.command,
        "status": command.status,
        "created_at": command.created_at.isoformat() if command.created_at else None,
    }


@app.post("/devices/commands/bulk")
def enqueue_bulk_device_command(
    payload: BulkDeviceCommandCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    allowed = {"restart", "sync_now", "apply_release"}
    if payload.command not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported command. Allowed: {', '.join(sorted(allowed))}")
    if not payload.device_ids:
        raise HTTPException(status_code=400, detail="device_ids cannot be empty")

    devices = db.query(Device).filter(Device.id.in_(payload.device_ids)).all()
    found_ids = {d.id for d in devices}
    missing = [device_id for device_id in payload.device_ids if device_id not in found_ids]
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown device_ids: {', '.join(missing)}")

    created = []
    now = datetime.datetime.utcnow()
    for device_id in payload.device_ids:
        command = DeviceCommand(
            id=str(uuid.uuid4()),
            device_id=device_id,
            command=payload.command,
            payload_json=json.dumps(payload.payload or {}),
            status="pending",
            delivery_attempts=0,
            max_delivery_attempts=DEVICE_COMMAND_MAX_DELIVERY_ATTEMPTS,
            created_at=now,
        )
        db.add(command)
        created.append(command)
        create_audit_log(
            db,
            action="command.enqueue.bulk",
            actor_user_id=current_user.id,
            actor_role=current_user.role,
            target_type="device_command",
            target_id=command.id,
            metadata={"device_id": device_id, "command": payload.command},
        )

    db.commit()
    return {
        "queued": len(created),
        "device_ids": payload.device_ids,
        "command": payload.command,
    }


@app.post("/player/releases")
def create_player_release(
    payload: PlayerReleaseCreatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    version = payload.version.strip()
    if not version:
        raise HTTPException(status_code=400, detail="version is required")
    if not (payload.manifest_url.startswith("http://") or payload.manifest_url.startswith("https://")):
        raise HTTPException(status_code=400, detail="manifest_url must be an absolute http(s) URL")
    if payload.checksum is not None:
        checksum = payload.checksum.strip().lower()
        if len(checksum) != 64 or any(ch not in "0123456789abcdef" for ch in checksum):
            raise HTTPException(status_code=400, detail="checksum must be a 64-character lowercase hex SHA256")
    else:
        checksum = None

    existing = db.query(PlayerRelease).filter(PlayerRelease.version == version).first()
    if existing is not None:
        raise HTTPException(status_code=409, detail="release version already exists")

    release = PlayerRelease(
        id=str(uuid.uuid4()),
        version=version,
        manifest_url=payload.manifest_url,
        checksum=checksum,
        notes=payload.notes,
        is_active=payload.is_active,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(release)
    create_audit_log(
        db,
        action="player.release.create",
        actor_user_id=current_user.id,
        actor_role=current_user.role,
        target_type="player_release",
        target_id=release.id,
        metadata={"version": release.version},
    )
    db.commit()
    db.refresh(release)

    return {
        "id": release.id,
        "version": release.version,
        "manifest_url": release.manifest_url,
        "checksum": release.checksum,
        "notes": release.notes,
        "is_active": release.is_active,
        "created_at": release.created_at.isoformat() if release.created_at else None,
    }


@app.get("/player/releases")
def list_player_releases(db: Session = Depends(get_db), current_user: User = Depends(require_roles("admin"))):
    releases = db.query(PlayerRelease).order_by(PlayerRelease.created_at.desc()).all()
    return [
        {
            "id": release.id,
            "version": release.version,
            "manifest_url": release.manifest_url,
            "checksum": release.checksum,
            "notes": release.notes,
            "is_active": release.is_active,
            "created_at": release.created_at.isoformat() if release.created_at else None,
        }
        for release in releases
    ]


def enqueue_apply_release_command(db: Session, device: Device, release: PlayerRelease, initiated_by: str, reason: str):
    payload = {
        "version": release.version,
        "manifest_url": release.manifest_url,
        "checksum": release.checksum,
        "reason": reason,
        "initiated_by": initiated_by,
    }
    cmd = DeviceCommand(
        id=str(uuid.uuid4()),
        device_id=device.id,
        command="apply_release",
        payload_json=json.dumps(payload),
        status="pending",
        delivery_attempts=0,
        max_delivery_attempts=DEVICE_COMMAND_MAX_DELIVERY_ATTEMPTS,
        created_at=datetime.datetime.utcnow(),
    )
    device.desired_player_version = release.version
    db.add(device)
    db.add(cmd)
    return cmd


@app.post("/devices/{device_id}/ota/update")
def request_device_update(
    device_id: str,
    payload: DeviceUpdateRequestPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")

    release = db.query(PlayerRelease).filter(PlayerRelease.version == payload.version, PlayerRelease.is_active == True).first()
    if release is None:
        raise HTTPException(status_code=404, detail="Active release version not found")

    cmd = enqueue_apply_release_command(db, device, release, current_user.id, "update")
    create_audit_log(
        db,
        action="ota.update.request",
        actor_user_id=current_user.id,
        actor_role=current_user.role,
        target_type="device",
        target_id=device_id,
        metadata={"version": payload.version, "command_id": cmd.id},
    )
    db.commit()

    return {
        "device_id": device_id,
        "command_id": cmd.id,
        "target_version": release.version,
    }


@app.post("/devices/ota/update/bulk")
def request_bulk_device_update(
    payload: BulkDeviceUpdateRequestPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    if not payload.device_ids:
        raise HTTPException(status_code=400, detail="device_ids cannot be empty")
    if not payload.version.strip():
        raise HTTPException(status_code=400, detail="version is required")

    release = db.query(PlayerRelease).filter(PlayerRelease.version == payload.version.strip(), PlayerRelease.is_active == True).first()
    if release is None:
        raise HTTPException(status_code=404, detail="Active release version not found")

    devices = db.query(Device).filter(Device.id.in_(payload.device_ids)).all()
    found_ids = {d.id for d in devices}
    missing = [device_id for device_id in payload.device_ids if device_id not in found_ids]
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown device_ids: {', '.join(missing)}")

    for device in devices:
        enqueue_apply_release_command(db, device, release, current_user.id, "bulk_update")
        create_audit_log(
            db,
            action="ota.update.request.bulk",
            actor_user_id=current_user.id,
            actor_role=current_user.role,
            target_type="device",
            target_id=device.id,
            metadata={"version": release.version},
        )

    db.commit()
    return {
        "queued": len(devices),
        "target_version": release.version,
    }


@app.post("/devices/{device_id}/ota/rollback")
def request_device_rollback(
    device_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    if not device.previous_player_version:
        raise HTTPException(status_code=400, detail="No previous_player_version available for rollback")

    release = (
        db.query(PlayerRelease)
        .filter(PlayerRelease.version == device.previous_player_version, PlayerRelease.is_active == True)
        .first()
    )
    if release is None:
        raise HTTPException(status_code=404, detail="Rollback release metadata not found or inactive")
    if device.player_version and release.version == device.player_version:
        raise HTTPException(status_code=400, detail="Device is already on target rollback version")

    cmd = enqueue_apply_release_command(db, device, release, current_user.id, "rollback")
    create_audit_log(
        db,
        action="ota.rollback.request",
        actor_user_id=current_user.id,
        actor_role=current_user.role,
        target_type="device",
        target_id=device_id,
        metadata={"version": release.version, "command_id": cmd.id},
    )
    db.commit()

    return {
        "device_id": device_id,
        "command_id": cmd.id,
        "target_version": release.version,
        "reason": "rollback",
    }


@app.post("/devices/commands/reconcile")
def reconcile_device_commands(
    older_than_seconds: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    stats = reconcile_stale_device_commands(db, older_than_seconds=older_than_seconds)
    create_audit_log(
        db,
        action="command.reconcile",
        actor_user_id=current_user.id,
        actor_role=current_user.role,
        target_type="device_command",
        target_id=None,
        metadata=stats,
    )
    db.commit()
    return {
        "status": "ok",
        **stats,
    }


@app.get("/devices/commands/history")
def list_device_commands_history(
    device_id: str | None = Query(default=None),
    status_filter: str | None = Query(default=None),
    command_type: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    reconcile_stale_device_commands(db)
    query = db.query(DeviceCommand)
    if device_id:
        query = query.filter(DeviceCommand.device_id == device_id)
    if status_filter:
        query = query.filter(DeviceCommand.status == status_filter)
    if command_type:
        query = query.filter(DeviceCommand.command == command_type)

    rows = query.order_by(DeviceCommand.created_at.desc()).limit(limit).all()
    return [
        {
            "id": row.id,
            "device_id": row.device_id,
            "command": row.command,
            "status": row.status,
            "payload": json.loads(row.payload_json) if row.payload_json else {},
            "result": json.loads(row.result_json) if row.result_json else {},
            "delivery_attempts": row.delivery_attempts,
            "max_delivery_attempts": row.max_delivery_attempts,
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "delivered_at": row.delivered_at.isoformat() if row.delivered_at else None,
            "last_attempt_at": row.last_attempt_at.isoformat() if row.last_attempt_at else None,
            "acknowledged_at": row.acknowledged_at.isoformat() if row.acknowledged_at else None,
        }
        for row in rows
    ]


@app.post("/devices/bootstrap")
def bootstrap_device(payload: DeviceBootstrapPayload, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == payload.device_id).first()
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")

    if device.pairing_code_hash is None or device.pairing_code_expires_at is None:
        raise HTTPException(status_code=401, detail="Device is not awaiting pairing")
    if device.pairing_code_expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=401, detail="Pairing code expired")
    if hash_pairing_code(payload.pairing_code) != device.pairing_code_hash:
        raise HTTPException(status_code=401, detail="Invalid pairing code")

    device.status = "active"
    device.paired_at = datetime.datetime.utcnow()
    device.pairing_code_hash = None
    device.pairing_code_expires_at = None
    db.add(device)
    db.commit()

    token = create_device_token(device.id)
    return {
        "device_token": token,
        "device_id": device.id,
        "screen_id": device.screen_id,
        "sync_interval_seconds": DEVICE_SYNC_INTERVAL_SECONDS,
    }


@app.get("/devices/session")
def get_device_session(current_device: Device = Depends(get_current_device)):
    return {
        "device_id": current_device.id,
        "screen_id": current_device.screen_id,
        "status": current_device.status,
        "sync_interval_seconds": DEVICE_SYNC_INTERVAL_SECONDS,
    }


@app.post("/devices/heartbeat")
def device_heartbeat(payload: DeviceHeartbeatPayload, db: Session = Depends(get_db), current_device: Device = Depends(get_current_device)):
    current_device.last_seen_at = datetime.datetime.utcnow()
    current_device.last_playback_state = payload.playback_state
    current_device.last_error_code = payload.error_code
    current_device.last_content_hash = payload.last_content_hash
    if payload.player_version is not None:
        current_device.player_version = payload.player_version
    if payload.previous_player_version is not None:
        current_device.previous_player_version = payload.previous_player_version
    if payload.update_status is not None:
        current_device.last_update_status = payload.update_status
        if payload.update_status == "executed" and current_device.desired_player_version == current_device.player_version:
            current_device.desired_player_version = None
    db.add(current_device)
    db.commit()

    return {
        "device_id": current_device.id,
        "last_seen_at": current_device.last_seen_at.isoformat() if current_device.last_seen_at else None,
        "status": current_device.status,
    }


@app.get("/devices/commands/next")
def get_next_device_command(db: Session = Depends(get_db), current_device: Device = Depends(get_current_device)):
    reconcile_stale_device_commands(db)
    command = (
        db.query(DeviceCommand)
        .filter(
            and_(
                DeviceCommand.device_id == current_device.id,
                DeviceCommand.status == "pending",
            )
        )
        .order_by(DeviceCommand.created_at.asc())
        .first()
    )

    if command is None:
        return {"command": None}

    command.status = "delivered"
    command.delivered_at = datetime.datetime.utcnow()
    command.last_attempt_at = datetime.datetime.utcnow()
    command.delivery_attempts += 1
    db.add(command)
    db.commit()

    return {
        "command": {
            "id": command.id,
            "command": command.command,
            "payload": json.loads(command.payload_json) if command.payload_json else {},
            "delivery_attempts": command.delivery_attempts,
            "max_delivery_attempts": command.max_delivery_attempts,
            "created_at": command.created_at.isoformat() if command.created_at else None,
        }
    }


@app.post("/devices/commands/{command_id}/ack")
def acknowledge_device_command(
    command_id: str,
    payload: DeviceCommandAckPayload,
    db: Session = Depends(get_db),
    current_device: Device = Depends(get_current_device),
):
    if payload.status not in {"executed", "failed"}:
        raise HTTPException(status_code=400, detail="status must be executed or failed")

    command = db.query(DeviceCommand).filter(DeviceCommand.id == command_id).first()
    if command is None:
        raise HTTPException(status_code=404, detail="Command not found")
    if command.device_id != current_device.id:
        raise HTTPException(status_code=403, detail="Command does not belong to current device")

    command.status = payload.status
    command.acknowledged_at = datetime.datetime.utcnow()
    command.result_json = json.dumps(payload.result or {})
    db.add(command)
    db.commit()

    return {
        "id": command.id,
        "status": command.status,
        "acknowledged_at": command.acknowledged_at.isoformat() if command.acknowledged_at else None,
    }


@app.post("/devices/proof-of-play")
def ingest_proof_of_play(
    payload: PlaybackProofPayload,
    db: Session = Depends(get_db),
    current_device: Device = Depends(get_current_device),
):
    if payload.duration_seconds is not None and payload.duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="duration_seconds must be positive")

    played_at = payload.played_at or datetime.datetime.utcnow()
    proof = PlaybackProof(
        id=str(uuid.uuid4()),
        device_id=current_device.id,
        screen_id=current_device.screen_id,
        ad_id=payload.ad_id,
        booking_id=payload.booking_id,
        content_hash=payload.content_hash,
        duration_seconds=payload.duration_seconds,
        played_at=played_at,
    )
    db.add(proof)
    db.commit()

    return {
        "id": proof.id,
        "device_id": proof.device_id,
        "screen_id": proof.screen_id,
        "played_at": proof.played_at.isoformat() if proof.played_at else None,
    }


@app.post("/proof-of-play/retention/enforce")
def enforce_proof_of_play_retention(
    retention_days: int | None = Query(default=None, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    days = retention_days or POP_RETENTION_DAYS
    threshold = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    deleted = db.query(PlaybackProof).filter(PlaybackProof.played_at < threshold).delete(synchronize_session=False)
    create_audit_log(
        db,
        action="proof_of_play.retention.enforce",
        actor_user_id=current_user.id,
        actor_role=current_user.role,
        target_type="playback_proof",
        metadata={"retention_days": days, "deleted": deleted},
    )
    db.commit()
    return {
        "retention_days": days,
        "deleted": deleted,
    }


@app.get("/monitoring/alerts")
def get_monitoring_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    now = datetime.datetime.utcnow()
    offline_threshold = now - datetime.timedelta(seconds=max(90, DEVICE_SYNC_INTERVAL_SECONDS * 3))
    one_hour_ago = now - datetime.timedelta(hours=1)

    offline_devices = db.query(Device).filter(and_(Device.status == "active", Device.last_seen_at < offline_threshold)).count()
    failed_commands_last_hour = db.query(DeviceCommand).filter(and_(DeviceCommand.status == "failed", DeviceCommand.acknowledged_at >= one_hour_ago)).count()
    pop_last_hour = db.query(PlaybackProof).filter(PlaybackProof.played_at >= one_hour_ago).count()

    return {
        "offline_devices": offline_devices,
        "failed_commands_last_hour": failed_commands_last_hour,
        "proof_of_play_events_last_hour": pop_last_hour,
        "generated_at": now.isoformat(),
    }


@app.get("/audit/logs")
def list_audit_logs(
    action: str | None = Query(default=None),
    target_type: str | None = Query(default=None),
    limit: int = Query(default=200, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if target_type:
        query = query.filter(AuditLog.target_type == target_type)

    rows = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": row.id,
            "actor_user_id": row.actor_user_id,
            "actor_role": row.actor_role,
            "action": row.action,
            "target_type": row.target_type,
            "target_id": row.target_id,
            "metadata": json.loads(row.metadata_json) if row.metadata_json else {},
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]


@app.get("/proof-of-play")
def list_proof_of_play(
    screen_id: str | None = Query(default=None),
    device_id: str | None = Query(default=None),
    start_at: datetime.datetime | None = Query(default=None),
    end_at: datetime.datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    query = db.query(PlaybackProof)
    if screen_id:
        query = query.filter(PlaybackProof.screen_id == screen_id)
    if device_id:
        query = query.filter(PlaybackProof.device_id == device_id)
    if start_at:
        query = query.filter(PlaybackProof.played_at >= start_at)
    if end_at:
        query = query.filter(PlaybackProof.played_at <= end_at)

    rows = query.order_by(PlaybackProof.played_at.desc()).limit(500).all()
    return [
        {
            "id": row.id,
            "device_id": row.device_id,
            "screen_id": row.screen_id,
            "ad_id": row.ad_id,
            "booking_id": row.booking_id,
            "content_hash": row.content_hash,
            "duration_seconds": row.duration_seconds,
            "played_at": row.played_at.isoformat() if row.played_at else None,
        }
        for row in rows
    ]


@app.get("/devices/playlist")
def get_device_playlist(db: Session = Depends(get_db), current_device: Device = Depends(get_current_device)):
    now = datetime.datetime.utcnow()
    bookings = (
        db.query(Booking)
        .filter(
            and_(
                Booking.screen_id == current_device.screen_id,
                Booking.status.in_(("approved", "running")),
                Booking.end_date >= now,
            )
        )
        .order_by(Booking.start_date.asc())
        .all()
    )

    ad_ids = [booking.ad_id for booking in bookings if booking.ad_id]
    ads = db.query(Advertisement).filter(Advertisement.id.in_(ad_ids)).all() if ad_ids else []
    ad_map = {ad.id: ad for ad in ads}

    items = []
    for booking in bookings:
        ad = ad_map.get(booking.ad_id)
        if ad is None:
            continue

        content_hash = hashlib.sha256(f"{ad.id}:{ad.media_url}:{ad.duration_seconds}".encode("utf-8")).hexdigest()
        items.append(
            {
                "ad": {
                    "id": ad.id,
                    "title": ad.title,
                    "mediaUrl": ad.media_url,
                    "mediaType": ad.media_type,
                    "durationSec": ad.duration_seconds,
                    "contentHash": content_hash,
                },
                "schedule": {
                    "id": booking.id,
                    "adId": ad.id,
                    "screenId": booking.screen_id,
                    "startDate": booking.start_date.isoformat() if booking.start_date else None,
                    "endDate": booking.end_date.isoformat() if booking.end_date else None,
                    "startTime": "00:00",
                    "endTime": "23:59",
                    "frequencyPerHour": 1,
                },
            }
        )

    checksum_source = json.dumps(items, sort_keys=True)
    checksum = hashlib.sha256(checksum_source.encode("utf-8")).hexdigest()

    return {
        "screenId": current_device.screen_id,
        "generatedAt": now.isoformat(),
        "checksum": checksum,
        "items": items,
    }


@app.get("/bookings")
def list_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        bookings = db.query(Booking).all()
    else:
        bookings = db.query(Booking).filter(Booking.advertiser_id == current_user.id).all()

    return [
        {
            "id": booking.id,
            "advertiser_id": booking.advertiser_id,
            "screen_id": booking.screen_id,
            "ad_id": booking.ad_id,
            "start_date": booking.start_date.isoformat() if booking.start_date else None,
            "end_date": booking.end_date.isoformat() if booking.end_date else None,
            "total_price": booking.total_price,
            "status": booking.status,
        }
        for booking in bookings
    ]


@app.get("/screens/{screen_id}/availability")
def get_screen_availability(
    screen_id: str,
    start_date: datetime.datetime = Query(...),
    end_date: datetime.datetime = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date.")

    screen = db.query(Screen).filter(Screen.id == screen_id).first()
    if screen is None:
        raise HTTPException(status_code=404, detail="Screen not found")

    overlaps = (
        db.query(Booking)
        .filter(
            and_(
                Booking.screen_id == screen_id,
                Booking.status.in_(tuple(BOOKING_ACTIVE_STATUSES)),
                Booking.start_date <= end_date,
                Booking.end_date >= start_date,
            )
        )
        .all()
    )

    return {
        "screen_id": screen_id,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "available": len(overlaps) == 0,
        "conflicts": [
            {
                "booking_id": booking.id,
                "start_date": booking.start_date.isoformat() if booking.start_date else None,
                "end_date": booking.end_date.isoformat() if booking.end_date else None,
                "status": booking.status,
            }
            for booking in overlaps
        ],
    }


@app.post("/bookings")
def create_booking(payload: BookingCreatePayload, db: Session = Depends(get_db), current_user: User = Depends(require_roles("admin", "advertiser", "business", "owner"))):
    if payload.total_price <= 0:
        raise HTTPException(status_code=400, detail="Total price must be positive.")
    if payload.start_date > payload.end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date.")
    if payload.status not in BOOKING_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid booking status")
    if payload.status not in BOOKING_CREATABLE_STATUSES:
        raise HTTPException(status_code=400, detail="New bookings must start as draft or pending")

    screen = db.query(Screen).filter(Screen.id == payload.screen_id).first()
    if screen is None:
        raise HTTPException(status_code=404, detail="Screen not found")

    ad = db.query(Advertisement).filter(Advertisement.id == payload.ad_id).first()
    if ad is None:
        raise HTTPException(status_code=404, detail="Ad not found")

    if ad.status != "active":
        raise HTTPException(status_code=400, detail="Ad must be active before booking")

    overlapping = (
        db.query(Booking)
        .filter(
            and_(
                Booking.screen_id == payload.screen_id,
                Booking.status.in_(tuple(BOOKING_ACTIVE_STATUSES)),
                Booking.start_date <= payload.end_date,
                Booking.end_date >= payload.start_date,
            )
        )
        .first()
    )

    if overlapping is not None:
        raise HTTPException(status_code=409, detail="Booking conflicts with existing reserved inventory")

    booking = Booking(
        id=str(uuid.uuid4()),
        advertiser_id=current_user.id,
        screen_id=payload.screen_id,
        ad_id=payload.ad_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_price=payload.total_price,
        status=payload.status,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {"id": booking.id, "status": booking.status}


@app.put("/bookings/{booking_id}/status")
def update_booking_status(booking_id: str, payload: BookingStatusUpdatePayload, db: Session = Depends(get_db), current_user: User = Depends(require_roles("admin"))):
    if payload.status not in BOOKING_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid booking status")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    ensure_booking_transition(booking.status, payload.status)

    booking.status = payload.status
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {"id": booking.id, "status": booking.status}

@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(require_roles("admin"))):
    total_users = db.query(User).count()
    total_screens = db.query(Screen).count()
    total_ads = db.query(Advertisement).count()
    total_bookings = db.query(Booking).count()
    total_revenue_rows = db.query(Booking.total_price).all()
    total_revenue = float(sum(row[0] for row in total_revenue_rows)) if total_revenue_rows else 0.0

    return {
        "total_users": total_users,
        "total_screens": total_screens,
        "total_ads": total_ads,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
    }

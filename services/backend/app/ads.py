from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app import models, schemas, deps
import uuid
import datetime

router = APIRouter()

@router.post("/ads", response_model=schemas.Advertisement)
def create_ad(ad: schemas.AdvertisementBase, db: Session = Depends(deps.get_db)):
    # Validation
    if not ad.title or not ad.media_url or not ad.duration_seconds:
        raise HTTPException(status_code=400, detail="Title, media URL, and duration are required.")
    if ad.duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="Duration must be positive.")
    import re
    url_pattern = re.compile(r"^(https?://)[^\s]+$")
    if not url_pattern.match(ad.media_url):
        raise HTTPException(status_code=400, detail="Media URL must be a valid URL starting with http(s)://")
    db_ad = models.Advertisement(
        id=str(uuid.uuid4()),
        company_id="demo-company-id",  # TODO: Replace with real company/user logic
        title=ad.title,
        description=ad.description,
        media_url=ad.media_url,
        media_type=ad.media_type,
        duration_seconds=ad.duration_seconds,
        status=ad.status,
        created_at=datetime.datetime.utcnow()
    )
    db.add(db_ad)
    db.commit()
    db.refresh(db_ad)
    return db_ad

@router.get("/ads", response_model=list[schemas.Advertisement])
def list_ads(db: Session = Depends(deps.get_db)):
    return db.query(models.Advertisement).all()

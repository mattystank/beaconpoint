from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app import models, schemas, deps
import uuid
import datetime

router = APIRouter()

@router.post("/bookings", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingBase, db: Session = Depends(deps.get_db)):
    # Validation
    if not booking.advertiser_id or not booking.screen_id or not booking.ad_id or not booking.start_date or not booking.end_date or not booking.total_price:
        raise HTTPException(status_code=400, detail="All fields are required.")
    if booking.total_price <= 0:
        raise HTTPException(status_code=400, detail="Total price must be positive.")
    try:
        start = datetime.datetime.fromisoformat(booking.start_date)
        end = datetime.datetime.fromisoformat(booking.end_date)
        if start > end:
            raise HTTPException(status_code=400, detail="Start date must be before end date.")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format.")
    db_booking = models.Booking(
        id=str(uuid.uuid4()),
        advertiser_id=booking.advertiser_id,
        screen_id=booking.screen_id,
        ad_id=booking.ad_id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        total_price=booking.total_price,
        status=booking.status
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/bookings", response_model=list[schemas.Booking])
def list_bookings(db: Session = Depends(deps.get_db)):
    return db.query(models.Booking).all()

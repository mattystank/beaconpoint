from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from app.models import User, Screen, Ad, Booking, Payment

router = APIRouter()

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_screens = db.query(Screen).count()
    total_ads = db.query(Ad).count()
    total_bookings = db.query(Booking).count()
    total_revenue = db.query(Payment).with_entities(Payment.amount).all()
    total_revenue = sum([p[0] for p in total_revenue]) if total_revenue else 0
    return {
        "total_users": total_users,
        "total_screens": total_screens,
        "total_ads": total_ads,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue
    }

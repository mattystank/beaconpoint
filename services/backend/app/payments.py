import stripe
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_API_KEY", "sk_test_123")

class PaymentIntentRequest(BaseModel):
    amount: int  # in cents
    currency: str = "usd"
    receipt_email: str

@router.post("/payments/create-intent")
def create_payment_intent(data: PaymentIntentRequest):
    try:
        intent = stripe.PaymentIntent.create(
            amount=data.amount,
            currency=data.currency,
            receipt_email=data.receipt_email,
            automatic_payment_methods={"enabled": True},
        )
        return {"clientSecret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

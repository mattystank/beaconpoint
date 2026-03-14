
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Beacon Point Python backend is running (mock mode)."}

@app.post("/auth/signup")
def signup(user: dict):
    # Always succeed and return mock user
    return {"id": 1, "email": user.get("email", "mock@user.com"), "name": "Mock User"}

@app.post("/auth/login")
def login(form_data: dict):
    # Allow hardcoded admin login for development
    if (
        form_data.get("email") == "mattystankart@gmail.com"
        and form_data.get("password") == "TestMe"
    ):
        return {"access_token": "dev-admin-token", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Incorrect email or password")

@app.get("/screens")
def get_screens():
    # Return mock screens
    return [
        {"id": 1, "name": "Lobby TV", "location": "Main Lobby", "status": "online"},
        {"id": 2, "name": "Conference Room", "location": "2nd Floor", "status": "offline"}
    ]

@app.get("/analytics")
def get_analytics():
    # Return mock analytics
    return {
        "total_users": 10,
        "total_screens": 2,
        "total_ads": 5,
        "total_bookings": 3,
        "total_revenue": 1000
    }

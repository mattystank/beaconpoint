import requests
import time
import os
import json

API_URL = os.getenv("PLAYER_API_URL", "http://localhost:8010")
DEVICE_ID = os.getenv("PLAYER_DEVICE_ID", "demo-device-1")
CACHE_DIR = "/tmp/beaconpoint_cache"

os.makedirs(CACHE_DIR, exist_ok=True)

def fetch_schedule():
    try:
        resp = requests.get(f"{API_URL}/screens/{DEVICE_ID}/schedule")
        if resp.status_code == 200:
            return resp.json().get("ads", [])
    except Exception as e:
        print("Error fetching schedule:", e)
    return []

def download_media(media_url):
    filename = os.path.join(CACHE_DIR, os.path.basename(media_url))
    if not os.path.exists(filename) or os.path.getsize(filename) == 0:
        try:
            r = requests.get(media_url, stream=True, timeout=10)
            r.raise_for_status()
            with open(filename, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Downloaded {media_url}")
        except Exception as e:
            print(f"Failed to download {media_url}: {e}")
            if os.path.exists(filename):
                os.remove(filename)
            return None
    return filename if os.path.exists(filename) and os.path.getsize(filename) > 0 else None

def play_ads(ads):
    for ad in ads:
        media_file = download_media(ad["media_url"])
        if not media_file:
            print(f"Skipping ad {ad.get('title', '')}: media unavailable.")
            continue
        print(f"Playing {media_file} for {ad.get('duration', 10)} seconds...")
        time.sleep(ad.get("duration", 10))  # Simulate playback

def main_loop():
    import datetime
    while True:
        print(f"[{datetime.datetime.now().isoformat()}] Polling for schedule...")
        ads = fetch_schedule()
        if ads:
            play_ads(ads)
        else:
            print(f"[{datetime.datetime.now().isoformat()}] No ads scheduled. Waiting...")
            time.sleep(30)
        time.sleep(30)  # Refresh every 60 seconds

if __name__ == "__main__":
    main_loop()

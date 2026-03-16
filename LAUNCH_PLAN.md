# BeaconPoint Launch Plan

## 1. Admin Portal (Web Dashboard)
- **Status:** Complete and modular, with real workflows for managing screens, ads, campaigns, businesses, and publishers.
- **Next Steps:**
  - Deploy the web dashboard to a secure host (e.g., Vercel, Netlify, AWS).
  - Set up HTTPS and domain (e.g., admin.yourdomain.com).
  - Ensure only authorized users (admins) can log in.
  - Connect the dashboard to your production backend API.

## 2. Backend API
- **Status:** Should provide endpoints for screens, ads, schedules, users, etc.
- **Next Steps:**
  - Deploy the backend (FastAPI, Node.js, etc.) to a reliable server (AWS, DigitalOcean, etc.).
  - Set up a production database (Postgres, MySQL, etc.).
  - Secure the API with HTTPS and authentication (JWT, API keys).
  - Ensure endpoints like `/screens/:screenId/schedule` and `/ads?ids=...` are working and documented.

## 3. Screen Player (Fire Stick, Smart TV, Raspberry Pi)
- **Status:** Production-ready React app, built and bundled in `dist/`.
- **Next Steps:**
  1. **Build:**  
     - Run `npm install && npm run build` in `apps/screen-player`.
  2. **Deploy:**  
     - Upload the `dist/` folder to a static web host (Vercel, Netlify, AWS S3, etc.).
     - Set the player URL (e.g., `https://player.yourdomain.com`).
  3. **Device Setup:**  
     - On each device (Fire Stick, Smart TV, Pi), open the player URL in a browser or WebView:
       ```
       https://player.yourdomain.com?screenId=SCREEN_ID&apiBaseUrl=https://api.yourdomain.com
       ```
     - Replace `SCREEN_ID` and `apiBaseUrl` as needed.
  4. **(Optional) Kiosk Mode:**  
     - For Raspberry Pi, use Chromium in kiosk mode for full-screen playback.

## 4. Device Management & Monitoring (Recommended Enhancements)
- Add device registration and authentication for security.
- Implement remote monitoring (ping server, playback stats).
- Set up auto-updates for the player app.

## 5. Testing & QA
- Test the full workflow: add ads in the admin portal, verify they appear on the correct screen/player.
- Test on all target devices (Fire Stick, Smart TV, Pi).
- Check for network resilience and error handling.

## 6. Go-Live Checklist
- All services deployed and accessible via HTTPS.
- Admin users created and able to log in.
- Player devices configured and displaying ads.
- Monitoring and alerting in place for uptime and errors.
- Documentation for onboarding new screens/devices.

---

**Bring this plan to your meeting to show you have a clear, actionable path to launch. If you need deployment scripts, device setup guides, or want to add advanced features, let me know!**

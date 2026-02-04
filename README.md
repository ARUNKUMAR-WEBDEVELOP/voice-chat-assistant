# voice chat Chat Assistant

Full-stack app: React frontend + Django backend in one repo.

## Structure

```
live-transcribe-frontend/   # React + Vite + Tailwind
live-transcribe-backend/    # Django + REST API
```

## API key (for AI chat)

1. In `live-transcribe-backend`, copy `.env.example` to `.env`
2. Get key from (https://aistudio.google.com/app/api-keys)
3. Add to `.env`: `GEMINI API=gemini_API_key`
4. Restart the backend

## Run the site (both frontend + backend)

**Terminal 1 – Backend:**
```powershell
cd live-transcribe-backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```
→ Backend: http://localhost:8000

**Terminal 2 – Frontend:**
```powershell
cd live-transcribe-frontend
npm run dev
```
→ Site: http://localhost:5173

Open **http://localhost:5173** in your browser.

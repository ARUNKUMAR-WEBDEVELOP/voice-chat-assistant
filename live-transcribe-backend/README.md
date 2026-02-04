# voices Chat Backend (Django)

## Setup

```bash
cd live-transcribe-backend
pip install -r requirements.txt
python manage.py runserver
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate # Mac/Linux


then fast API work
cd live-transcribe-backend\live-stt-service
python -m venv venv
venv\Scripts\activate
pip install -r requirement.txt
uvicorn main:app --host 127.0.0.1 --port 8001



```

## Run

```bash
python manage.py runserver
http://localhost:8000**


uvicorn main:app --host 127.0.0.1 --port 8001
`host 127.0.0.1 --port 8001
```


Backend runs at **http://localhost:8000**


- Chat API: `POST /api/chat` with `{ "messages": [...] }`
- Translate API: `POST /api/translate` with `{ "text": "..." }`

## Optional: gemini API

Set `gemini IP key` in `.env` for real AI chat responses.

# Tamil → English Chat Backend (Django)

## Setup

```bash
cd live-transcribe-backend
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate # Mac/Linux

pip install -r requirements.txt
python manage.py migrate
```

## Run

```bash
python manage.py runserver
```

Backend runs at **http://localhost:8000**

- Chat API: `POST /api/chat` with `{ "messages": [...] }`
- Translate API: `POST /api/translate` with `{ "text": "..." }`

## Optional: OpenAI

Set `OPENAI_API_KEY` in `.env` for real AI chat responses.

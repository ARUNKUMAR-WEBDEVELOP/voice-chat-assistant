"""
Chat and Translation API views
"""
import os
import json
import logging
from pathlib import Path
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def _mock_chat_response(messages):
    """Fallback when Gemini key missing or not loaded."""
    return "Add GEMINI_API_KEY to .env and restart backend. Get key: aistudio.google.com/app/apikey"


def _call_gemini(messages):
    """Call Google Gemini API. Understands Tamil and English."""
    api_key = (
        getattr(settings, "GEMINI_API_KEY", None) or os.environ.get("GEMINI_API_KEY", "")
    ).strip()
    if not api_key:
        return None

    models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]
    try:
        import httpx
        last_error = None
        for model in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                contents = []
                for m in messages:
                    role = "user" if m.get("role") == "user" else "model"
                    contents.append({"role": role, "parts": [{"text": str(m.get("content", ""))}]})
                payload = {
                    "contents": contents,
                    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024},
                }
                with httpx.Client(timeout=30) as client:
                    resp = client.post(url, json=payload)
                    resp.raise_for_status()
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
            except Exception as e:
                last_error = e
                if hasattr(e, "response") and e.response is not None:
                    if getattr(e.response, "status_code", 0) == 404:
                        continue
                raise
        if last_error:
            raise last_error
    except Exception as e:
        err_msg = str(e).lower()
        logger.warning("Gemini API error: %s", e)
        if hasattr(e, "response") and e.response is not None:
            code = getattr(e.response, "status_code", 0)
            if code == 401 or code == 403:
                return {"_error": "Invalid Gemini API key. Check GEMINI_API_KEY in .env"}
            if code == 429:
                return {"_error": "Gemini rate limit. Try again in a moment."}
        if "429" in err_msg or "quota" in err_msg:
            return {"_error": "Gemini rate limit. Try again in a moment."}
        return {"_error": f"Gemini error: {str(e)[:100]}"}
    return None


@api_view(["GET"])
def health(request):
    """Check if backend is up and API key is loaded."""
    gemini = (getattr(settings, "GEMINI_API_KEY", None) or os.environ.get("GEMINI_API_KEY", "") or "").strip()
    has_key = bool(gemini)
    base_dir = Path(settings.BASE_DIR) if hasattr(settings, "BASE_DIR") else Path(__file__).resolve().parent.parent
    env_path = base_dir / ".env"
    env_exists = env_path.exists()
    return Response({
        "status": "ok",
        "api_key_loaded": has_key,
        "env_file_exists": env_exists,
        "help": "Add GEMINI_API_KEY to .env (free at aistudio.google.com)" if not has_key else None,
    })


@csrf_exempt
@api_view(["POST"])
def chat(request):
    """Handle chat messages and return assistant response."""
    try:
        body = request.data if hasattr(request, "data") and request.data is not None else {}
        if not body and hasattr(request, "body"):
            try:
                body = json.loads(request.body) if request.body else {}
            except json.JSONDecodeError:
                body = {}
        messages = body.get("messages", [])
        if not isinstance(messages, list) or not messages:
            return Response(
                {"error": "messages array required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content = _call_gemini(messages)
        if content is None:
            content = _mock_chat_response(messages)
        elif isinstance(content, dict) and "_error" in content:
            content = content["_error"]

        return Response({"content": content})
    except json.JSONDecodeError:
        return Response(
            {"error": "Invalid JSON"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@csrf_exempt
@api_view(["POST"])
def translate(request):
    """Translate Tamil text to English (placeholder / can integrate translation API)."""
    try:
        body = request.data if hasattr(request, "data") and request.data is not None else {}
        if not body and hasattr(request, "body"):
            try:
                body = json.loads(request.body) if request.body else {}
            except json.JSONDecodeError:
                body = {}
        text = body.get("text", "").strip()
        if not text:
            return Response(
                {"error": "text required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"text": text, "translated": text})
    except json.JSONDecodeError:
        return Response(
            {"error": "Invalid JSON"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

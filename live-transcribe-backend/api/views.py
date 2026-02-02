"""
Chat and Translation API views
"""
import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


def _mock_chat_response(messages):
    """Fallback response when no AI provider is configured."""
    last_user = next((m for m in reversed(messages) if m.get("role") == "user"), None)
    text = (last_user or {}).get("content", "").lower()
    if "hello" in text or "hi" in text or "வணக்கம்" in text:
        return "Hello! How can I help you today? Speak in Tamil or English."
    if "thank" in text or "நன்றி" in text:
        return "You're welcome! Is there anything else I can help with?"
    return (
        "I received your message. Set OPENAI_API_KEY to enable AI responses."
    )


def _call_openai(messages):
    """Call OpenAI API if key is configured."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None

    try:
        import httpx
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": m["role"], "content": m["content"]}
                for m in messages
            ],
        }
        with httpx.Client(timeout=30) as client:
            resp = client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception:
        return None


@api_view(["POST"])
def chat(request):
    """Handle chat messages and return assistant response."""
    try:
        body = request.data if hasattr(request, "data") else json.loads(request.body)
        messages = body.get("messages", [])
        if not isinstance(messages, list) or not messages:
            return Response(
                {"error": "messages array required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content = _call_openai(messages)
        if content is None:
            content = _mock_chat_response(messages)

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


@api_view(["POST"])
def translate(request):
    """Translate Tamil text to English (placeholder / can integrate translation API)."""
    try:
        body = request.data if hasattr(request, "data") else json.loads(request.body)
        text = body.get("text", "").strip()
        if not text:
            return Response(
                {"error": "text required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Placeholder: return same text until you add Google Translate / LibreTranslate etc.
        translated = text
        return Response({"text": translated, "translated": translated})
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

import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

/**
 * Mock response when backend is not configured (for local testing).
 */
function getMockResponse(messages) {
  const lastUser = messages.filter((m) => m.role === "user").pop();
  const text = lastUser?.content?.toLowerCase() || "";
  if (text.includes("hello") || text.includes("hi") || text.includes("வணக்கம்"))
    return "Hello! How can I help you today?";
  if (text.includes("thank") || text.includes("நன்றி"))
    return "You're welcome! Is there anything else?";
  return "I received your message. Connect your chat API (e.g. OpenAI, Claude) at /api/chat to get real AI responses.";
}

/**
 * Send user message to chat assistant and get AI response.
 * Replace this with your actual backend endpoint.
 */
export async function sendChatMessage(messages) {
  try {
    const res = await axios.post(`${API_BASE}/chat/`, {
      messages,
    }, { timeout: 15000 });
    return res.data?.content ?? res.data?.message ?? "No response.";
  } catch (err) {
    if (err.response?.data?.content) {
      return err.response.data.content;
    }
    if (err.code === "ERR_NETWORK") {
      return "Cannot reach backend. Is it running on port 8000? Start: cd live-transcribe-backend && python manage.py runserver";
    }
    if (err.response?.status >= 500) {
      const errMsg = err.response?.data?.error || err.response?.data?.detail;
      return errMsg || "Backend error (500). Check backend terminal for details.";
    }
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    return getMockResponse(messages);
  }
}

/**
 * Optional: Translate Tamil text to English (if your backend supports it).
 */
export async function translateTamilToEnglish(text) {
  if (!text?.trim()) return text;
  try {
    const res = await axios.post(`${API_BASE}/translate/`, {
      text,
      from: "ta",
      to: "en",
    });
    return res.data?.text ?? res.data?.translated ?? text;
  } catch {
    return text;
  }
}

import { useState, useCallback } from "react";
import { sendChatMessage, translateTamilToEnglish } from "../services/chatApi";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addMessage = useCallback((role, content) => {
    setMessages((prev) => [...prev, { role, content }]);
  }, []);

  const sendMessage = useCallback(async (userContent) => {
    const trimmed = userContent?.trim();
    if (!trimmed || isLoading) return;

    addMessage("user", trimmed);
    setError(null);
    setIsLoading(true);

    const updatedMessages = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    try {
      const response = await sendChatMessage(updatedMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, addMessage]);

  const sendWithTranslation = useCallback(
    async (tamilText) => {
      const translated = await translateTamilToEnglish(tamilText);
      await sendMessage(translated);
    },
    [sendMessage]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    sendWithTranslation,
    addMessage,
    clearChat,
  };
}

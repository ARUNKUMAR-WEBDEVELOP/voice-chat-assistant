import { useState, useRef, useEffect } from "react";
import { Mic, Send, Square, Loader2 } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useChat } from "../hooks/useChat";

function ChatUI() {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    isListening,
    transcript,
    isSupported: speechSupported,
    error: speechError,
    startListening,
    stopListening,
    setTranscript,
  } = useSpeechRecognition();

  const {
    messages,
    isLoading,
    error: chatError,
    sendMessage,
    sendWithTranslation,
    clearChat,
  } = useChat();

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => scrollToBottom(), [messages, transcript]);

  useEffect(() => {
    if (transcript) setInputText(transcript);
  }, [transcript, setTranscript]);

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || isLoading) return;

    setInputText("");
    setTranscript("");

    const useTranslation = /[\u0B80-\u0BFF]/.test(text);
    if (useTranslation) {
      await sendWithTranslation(text);
    } else {
      await sendMessage(text);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) handleSend(transcript);
    } else {
      setInputText("");
      startListening();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayText = isListening ? (transcript || "Listening…") : inputText;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[800px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200/60">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-gray-200 from-teal-600 to-teal-700 text-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
            T
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight">
              Tamil → English Chat
            </h1>
            <p className="text-xs text-teal-100">
              Speak in Tamil or type • Voice assist ready
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
          >
            Clear chat
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4 space-y-4 min-h-0">
        {messages.length === 0 && !displayText && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              <Mic className="w-7 h-7 text-teal-600" />
            </div>
            <p className="font-medium text-gray-600">Start a conversation</p>
            <p className="text-sm mt-1">
              Tap the mic to speak in Tamil, or type your message below
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-teal-600 text-white rounded-br-md"
                  : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
              }`}
            >
              {/* Display each message. 
                  This section renders the actual message bubble 
                  with correct style and formatting, indicating 
                  content sent by user or assistant. */}
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap  ">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-white shadow-sm border border-gray-100 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              <span className="text-gray-500 text-sm">Thinking…</span>
            </div>
          </div>
        )}

        {(speechError || chatError) && (
          <div className="rounded-lg px-4 py-2 bg-red-50 text-red-700 text-sm">
            {speechError || chatError}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0 rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <textarea
              ref={inputRef}
              value={displayText}
              onChange={(e) => !isListening && setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? "Listening… speak in Tamil"
                  : "Type or speak in Tamil…"
              }
              rows={1}
              disabled={isLoading}
              className="w-full resize-none bg-transparent px-4 py-3 text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none disabled:opacity-70 min-h-[48px] max-h-32"
            />
          </div>

          <button
            onClick={handleVoiceToggle}
            disabled={!speechSupported || isLoading}
            title={speechSupported ? "Voice input (Tamil)" : "Speech not supported"}
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-teal-600 hover:bg-teal-700"
            } ${(!speechSupported || isLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isListening ? (
              <Square className="w-5 h-5" fill="currentColor" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && !transcript.trim()) || isLoading}
            className="shrink-0 w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatUI;

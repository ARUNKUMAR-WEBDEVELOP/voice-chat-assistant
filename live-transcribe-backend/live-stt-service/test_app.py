import os
import json
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveOptions,
)

load_dotenv()
app = FastAPI()

API_KEY = os.getenv("DEEPGRAM_API_KEY", "").strip()
# Use "nova-3" for the best Tamil (ta) accuracy in 2026
config = DeepgramClientOptions(options={"keepalive": "true"})
dg_client = DeepgramClient(API_KEY, config)

@app.websocket("/ws/stt")
async def stt_ws(ws: WebSocket):
    await ws.accept()
    
    # Using a queue to bridge Deepgram's thread-based callback to FastAPI's async loop
    transcript_queue = asyncio.Queue()
    loop = asyncio.get_running_loop()

    def on_message(self, result, **kwargs):
        sentence = result.channel.alternatives[0].transcript
        if sentence:
            payload = {
                "text": sentence,
                "is_final": result.is_final,  # CRITICAL: Tells UI if it's a guess or final
                "speech_final": result.speech_final # Tells UI the speaker paused
            }
            asyncio.run_coroutine_threadsafe(transcript_queue.put(json.dumps(payload)), loop)

    try:
        dg_connection = dg_client.listen.live.v("1")
        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
        

        options = LiveOptions(
            model="nova-3",        # Latest model with superior Tamil support
            language="ta",         # Tamil
            smart_format=True,     # Punctuation/Formatting
            interim_results=True,  # Send text while speaker is still talking
            encoding="linear16",
            channels=1,
            sample_rate=16000,
            endpointing=300        # Wait 300ms of silence before finalizing
        )
#                 model="nova-2", 
#                 language="en-US",      # 👈 CHANGE THIS TO en-US JUST TO TEST FIRST
#                 smart_format=True,
#                 encoding="linear16",
#                 channels=1,
#                 sample_rate=16000,
#                 no_delay=True,         # Added for better stability
#                 endpointing=300        # Helps close chunks faster
# )

        if not dg_connection.start(options):
            print("❌ Failed to connect to Deepgram")
            return

        # Task to push transcripts from queue to Frontend
        async def push_to_ui():
            while True:
                msg = await transcript_queue.get()
                await ws.send_text(msg)

        asyncio.create_task(push_to_ui())

        # Receive PCM audio bytes from Frontend
        while True:
            data = await ws.receive_bytes()
            dg_connection.send(data)

    except WebSocketDisconnect:
        print("ℹ️ UI Disconnected")
    finally:
        dg_connection.finish()
# from fastapi import FastAPI, WebSocket
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],   # frontend allowed
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# async def root():
#     return {"status": "ok"}

# @app.websocket("/ws/stt")
# async def stt_ws(websocket: WebSocket):
#     await websocket.accept()
#     print("WS ACCEPTED")

#     try:
#         while True:
#             data = await websocket.receive_bytes()
#             print("received audio chunk:", len(data))
#             await websocket.send_json({
#                 "is_final": False,
#                 "text": ""
#             })
#     except Exception as e:
#         print("WS closed:", e)

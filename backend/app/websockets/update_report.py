from fastapi import WebSocket, WebSocketDisconnect
from typing import List


class UpdateReportManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcastUpdateReport(self, report_data: dict):
        for ws in self.active_connections:
            await ws.send_json(report_data)


manager = UpdateReportManager()


async def updateReportWebsocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

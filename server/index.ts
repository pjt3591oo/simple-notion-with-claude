import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { setupWSConnection } from 'y-websocket/bin/utils'

const PORT = 1234

const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  // y-websocket의 setupWSConnection을 사용하여 연결 설정
  setupWSConnection(ws, req)

  console.log(`✅ 새로운 클라이언트 연결됨 (총 ${wss.clients.size}명 접속 중)`)
})

wss.on('close', () => {
  console.log('❌ 클라이언트 연결 종료됨')
})

console.log(`🚀 CRDT WebSocket 서버가 ws://localhost:${PORT} 에서 실행 중입니다`)
console.log(`📝 협업 에디터를 http://localhost:5173 에서 확인하세요`)

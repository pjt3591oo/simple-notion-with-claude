import { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

interface User {
  name: string
  color: string
}

// 사용자 색상 팔레트
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
]

export default function CollaborativeEditor() {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [doc] = useState(() => new Y.Doc())
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const [connectedUsers, setConnectedUsers] = useState<Map<number, User>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [clientId, setClientId] = useState<number>(0)

  useEffect(() => {
    if (!editorRef.current) return

    // Y.Text 타입 생성 - 공유할 텍스트 데이터
    const yText = doc.getText('shared-text')

    // WebSocket Provider 연결
    const wsProvider = new WebsocketProvider(
      'ws://localhost:1234',
      'my-document', // 문서 이름 (같은 이름을 사용하는 클라이언트들이 동기화됨)
      doc
    )

    wsProvider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected')
      console.log('연결 상태:', event.status)
    })

    // Awareness: 다른 사용자들의 상태 공유 (커서 위치, 이름 등)
    const awareness = wsProvider.awareness

    // 현재 사용자 정보 설정
    const userColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
    const userName = `사용자 ${Math.floor(Math.random() * 1000)}`

    awareness.setLocalStateField('user', {
      name: userName,
      color: userColor,
    })

    setClientId(awareness.clientID)

    // 다른 사용자 상태 변경 감지
    const updateUsers = () => {
      const states = awareness.getStates()
      const users = new Map<number, User>()

      states.forEach((state, clientId) => {
        if (state.user && clientId !== awareness.clientID) {
          users.set(clientId, state.user as User)
        }
      })

      setConnectedUsers(users)
    }

    awareness.on('change', updateUsers)
    updateUsers()

    // Yjs 텍스트 변경을 textarea에 반영
    const updateTextarea = () => {
      if (editorRef.current) {
        const currentText = yText.toString()
        if (editorRef.current.value !== currentText) {
          const cursorPos = editorRef.current.selectionStart
          editorRef.current.value = currentText
          // 커서 위치 복원 (가능한 경우)
          editorRef.current.setSelectionRange(cursorPos, cursorPos)
        }
      }
    }

    yText.observe(updateTextarea)

    // textarea 초기값 설정
    editorRef.current.value = yText.toString()

    // textarea 입력을 Yjs에 반영
    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement
      const newText = target.value
      const oldText = yText.toString()

      if (newText !== oldText) {
        doc.transact(() => {
          yText.delete(0, oldText.length)
          yText.insert(0, newText)
        })
      }
    }

    editorRef.current.addEventListener('input', handleInput)

    setProvider(wsProvider)

    // 정리
    return () => {
      editorRef.current?.removeEventListener('input', handleInput)
      yText.unobserve(updateTextarea)
      awareness.off('change', updateUsers)
      wsProvider.destroy()
    }
  }, [doc])

  return (
    <div className="editor-container">
      <div className="header">
        <h1>🤝 CRDT 협업 텍스트 에디터</h1>
        <div className="status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 연결됨' : '🔴 연결 안됨'}
          </span>
          <span className="user-info">
            나: 사용자 {clientId}
          </span>
        </div>
      </div>

      <div className="info-panel">
        <h3>📡 접속 중인 사용자 ({connectedUsers.size}명)</h3>
        <div className="users-list">
          {Array.from(connectedUsers.entries()).map(([id, user]) => (
            <div key={id} className="user-badge" style={{ backgroundColor: user.color }}>
              {user.name}
            </div>
          ))}
          {connectedUsers.size === 0 && (
            <p className="empty-message">다른 브라우저 탭에서 이 페이지를 열어보세요!</p>
          )}
        </div>
      </div>

      <div className="editor-wrapper">
        <textarea
          ref={editorRef}
          className="editor"
          placeholder="여기에 입력하세요... 다른 탭이나 브라우저에서도 실시간으로 동기화됩니다! 🚀"
        />
      </div>

      <div className="info-box">
        <h3>💡 CRDT 동작 원리</h3>
        <ul>
          <li><strong>실시간 동기화:</strong> 모든 변경사항이 WebSocket을 통해 즉시 전파됩니다</li>
          <li><strong>충돌 자동 해결:</strong> 여러 사용자가 동시에 편집해도 자동으로 병합됩니다</li>
          <li><strong>오프라인 지원:</strong> 연결이 끊겨도 작업 후 나중에 자동 동기화됩니다</li>
          <li><strong>Yjs Y.Text:</strong> 텍스트를 위한 CRDT 데이터 구조를 사용합니다</li>
        </ul>
      </div>
    </div>
  )
}

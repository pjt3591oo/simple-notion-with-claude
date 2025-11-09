import { createEditor } from 'slate'
import { withReact } from 'slate-react'
import { withYjs, withCursors, withYHistory, YjsEditor } from '@slate-yjs/core'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { Awareness } from 'y-protocols/awareness'
import { nanoid } from 'nanoid'
import { BlockElement } from '../types/blocks'

// 초기 에디터 값 (Slate-Yjs 호환)
export const initialValue: any[] = [
  {
    type: 'paragraph',
    children: [{ text: '노션 스타일 에디터에 오신 것을 환영합니다!' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '/ 를 입력하여 블록 메뉴를 열어보세요.' }],
  },
]

// Slate 에디터 생성 (Yjs 통합)
export const createSlateYjsEditor = (sharedType: Y.XmlFragment, awareness: Awareness) => {
  let editor = withReact(createEditor())

  // 1. withYjs 적용 (CRDT 동기화)
  editor = withYjs(editor, sharedType, {
    autoConnect: false  // 수동으로 연결 제어
  })

  // 2. withCursors 적용 (협업 커서)
  editor = withCursors(editor, awareness, {
    data: {
      name: generateUserName(),
      color: generateUserColor()
    }
  })

  // 3. withYHistory 적용 (Undo/Redo)
  editor = withYHistory(editor)

  return editor as YjsEditor
}

// WebSocket Provider 설정
export const createWebSocketProvider = (
  doc: Y.Doc,
  roomName: string = 'notion-room'
): WebsocketProvider => {
  const provider = new WebsocketProvider(
    'ws://localhost:1234',
    roomName,
    doc,
    {
      connect: true,
    }
  )

  return provider
}

// 사용자 색상 생성
export const generateUserColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B500', '#FF6B9D', '#00D9FF', '#7B68EE'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 사용자 이름 생성
export const generateUserName = (): string => {
  return `사용자 ${Math.floor(Math.random() * 1000)}`
}

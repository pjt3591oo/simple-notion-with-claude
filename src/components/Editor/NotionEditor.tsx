import { useEffect, useState, useCallback } from 'react'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { createEditor, Descendant, Transforms } from 'slate'
import { Range, Editor } from 'slate'
import * as Y from 'yjs'
import { withYjs, withCursors, withYHistory, YjsEditor } from '@slate-yjs/core'
import { WebsocketProvider } from 'y-websocket'
import { renderElement, renderLeaf } from '../Blocks/BlockRenderer'
import { SlashCommandMenu } from '../SlashMenu/SlashCommandMenu'
import {
  generateUserColor,
  generateUserName,
} from '../../lib/slate-yjs-config'
import { Users } from 'lucide-react'
import { CustomEditor } from '../../types/blocks'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '노션 스타일 에디터에 오신 것을 환영합니다!' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '/ 를 입력하여 블록 메뉴를 열어보세요.' }],
  },
]

export const NotionEditor = () => {
  const [connected, setConnected] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState(0)
  const [slashMenuTarget, setSlashMenuTarget] = useState<Range | null>(null)
  const [slashMenuSearch, setSlashMenuSearch] = useState('')
  const [editor, setEditor] = useState<YjsEditor | null>(null)

  useEffect(() => {
    // Create Yjs document
    const ydoc = new Y.Doc()
    const sharedType = ydoc.get('content', Y.XmlText) as Y.XmlText

    // Create WebSocket provider
    const wsProvider = new WebsocketProvider(
      'ws://localhost:1234',
      'notion-document',
      ydoc
    )

    const awareness = wsProvider.awareness
    awareness.setLocalStateField('user', {
      name: generateUserName(),
      color: generateUserColor(),
    })

    // Monitor connection
    const handleStatus = (event: { status: string }) => {
      console.log('WebSocket 상태:', event.status)
      setConnected(event.status === 'connected')
    }

    const handleAwarenessChange = () => {
      const userCount = awareness.getStates().size - 1
      console.log('접속 중인 사용자:', userCount)
      setConnectedUsers(userCount)
    }

    wsProvider.on('status', handleStatus)
    awareness.on('change', handleAwarenessChange)

    console.log('WebSocket Provider 생성됨:', wsProvider.url)
    console.log('Yjs 문서 ID:', ydoc.guid)

    // Create Slate editor
    let e = withReact(createEditor())

    console.log('withYjs 적용 전:', {
      hasSharedRoot: 'sharedRoot' in e,
      sharedTypeLength: sharedType.length
    })

    e = withYjs(e, sharedType)

    console.log('withYjs 적용 후:', {
      hasSharedRoot: 'sharedRoot' in e,
      isYjsEditor: YjsEditor.isYjsEditor(e),
      connected: YjsEditor.connected(e)
    })

    e = withCursors(e, awareness, {
      data: {
        name: generateUserName(),
        color: generateUserColor(),
      },
    })
    e = withYHistory(e)

    console.log('YjsEditor 연결 상태:', YjsEditor.connected(e))

    // Listen to Yjs updates
    ydoc.on('update', (update: Uint8Array, origin: any) => {
      console.log('Yjs 문서 업데이트:', {
        updateSize: update.length,
        origin: origin === e ? 'local' : 'remote'
      })
    })

    // Wait for sync before setting initial value
    const initializeContent = () => {
      // Connect the editor to Yjs
      if (!YjsEditor.connected(e)) {
        console.log('에디터 연결 중...')
        YjsEditor.connect(e)
        console.log('에디터 연결 완료:', YjsEditor.connected(e))
      }

      // Check if the shared type is truly empty after sync
      const isEmpty = sharedType.length === 0

      if (isEmpty) {
        console.log('초기값 설정 중... (첫 번째 클라이언트)')

        // Use Slate Transforms API to insert initial content
        Editor.withoutNormalizing(e, () => {
          // Remove default empty paragraph if it exists
          if (e.children.length > 0) {
            Transforms.delete(e, {
              at: {
                anchor: Editor.start(e, []),
                focus: Editor.end(e, []),
              },
            })
          }

          // Insert initial nodes
          Transforms.insertNodes(e, initialValue, { at: [0] })
        })

        console.log('초기값 설정 완료')
      } else {
        console.log('기존 콘텐츠 존재, Yjs에서 로드됨 (', sharedType.length, '문자)')
      }
    }

    // Wait for initial sync (give WebSocket time to sync)
    if (wsProvider.synced) {
      console.log('이미 동기화됨')
      initializeContent()
    } else {
      console.log('동기화 대기 중...')

      let syncHandled = false

      wsProvider.once('sync', (isSynced: boolean) => {
        if (!syncHandled) {
          syncHandled = true
          console.log('동기화 완료:', isSynced)
          initializeContent()
        }
      })

      // Fallback: if sync event doesn't fire within 2 seconds, initialize anyway
      setTimeout(() => {
        if (!syncHandled) {
          syncHandled = true
          console.log('동기화 타임아웃 - 강제 초기화')
          initializeContent()
        }
      }, 2000)
    }

    setEditor(e)

    // Cleanup
    return () => {
      YjsEditor.disconnect(e)
      wsProvider.off('status', handleStatus)
      awareness.off('change', handleAwarenessChange)
      wsProvider.destroy()
    }
  }, [])

  // Slash command detection
  const handleChange = useCallback(() => {
    if (!editor) return

    console.log('에디터 변경 감지:', {
      children: editor.children.length,
      operations: editor.operations.length,
      isYjsEditor: 'sharedRoot' in editor
    })

    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection)
      const wordBefore = Editor.before(editor as CustomEditor, start, { unit: 'word' })
      const before = wordBefore && Editor.before(editor as CustomEditor, wordBefore)
      const beforeRange = before && Editor.range(editor as CustomEditor, before, start)
      const beforeText = beforeRange && Editor.string(editor as CustomEditor, beforeRange)
      const beforeMatch = beforeText && beforeText.match(/^\/(\w*)$/)

      if (beforeMatch) {
        setSlashMenuTarget(beforeRange!)
        setSlashMenuSearch(beforeMatch[1])
        return
      }
    }

    setSlashMenuTarget(null)
  }, [editor])

  // Don't render until editor is ready
  if (!editor) {
    return (
      <div className="notion-editor-container">
        <div className="editor-header">
          <h1 className="editor-title">🚀 노션 스타일 에디터</h1>
          <div className="editor-status">
            <span>로딩 중...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="notion-editor-container">
      <div className="editor-header">
        <h1 className="editor-title">🚀 노션 스타일 에디터</h1>
        <div className="editor-status">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
          <span className="status-text">
            {connected ? '연결됨' : '연결 안됨'}
          </span>
          <div className="user-count">
            <Users size={16} />
            <span>{connectedUsers}</span>
          </div>
        </div>
      </div>

      <div className="editor-content">
        <Slate editor={editor as unknown as ReactEditor} initialValue={initialValue} onChange={handleChange}>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="'/' 를 입력하여 블록 추가..."
            className="editable-area"
            spellCheck={false}
          />

          <SlashCommandMenu
            target={slashMenuTarget}
            search={slashMenuSearch}
            onClose={() => setSlashMenuTarget(null)}
          />
        </Slate>
      </div>

      <div className="editor-footer">
        <p className="footer-text">
          💡 <strong>팁:</strong> <code>/</code> 를 입력하여 블록 메뉴를 열어보세요
        </p>
      </div>
    </div>
  )
}

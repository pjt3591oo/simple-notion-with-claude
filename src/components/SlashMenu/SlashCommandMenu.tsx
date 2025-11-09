import { useState, useEffect, useCallback } from 'react'
import { Editor, Transforms, Range } from 'slate'
import { useSlate } from 'slate-react'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  Quote,
  Code,
  Minus,
} from 'lucide-react'
import { BlockType, SlashMenuItem } from '../../types/blocks'
import { nanoid } from 'nanoid'

// 슬래시 커맨드 메뉴 아이템 정의
const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  {
    id: 'paragraph',
    icon: 'Type',
    title: '텍스트',
    description: '일반 텍스트 블록',
    keywords: ['text', 'paragraph', 'p', '텍스트', '문단'],
  },
  {
    id: 'heading-one',
    icon: 'Heading1',
    title: '제목 1',
    description: '큰 제목',
    keywords: ['h1', 'heading', 'title', '제목', '헤딩'],
  },
  {
    id: 'heading-two',
    icon: 'Heading2',
    title: '제목 2',
    description: '중간 제목',
    keywords: ['h2', 'heading', 'title', '제목'],
  },
  {
    id: 'heading-three',
    icon: 'Heading3',
    title: '제목 3',
    description: '작은 제목',
    keywords: ['h3', 'heading', 'title', '제목'],
  },
  {
    id: 'bulleted-list',
    icon: 'List',
    title: '글머리 기호 목록',
    description: '순서 없는 목록',
    keywords: ['ul', 'bullet', 'list', '목록', '리스트'],
  },
  {
    id: 'numbered-list',
    icon: 'ListOrdered',
    title: '번호 매기기 목록',
    description: '순서 있는 목록',
    keywords: ['ol', 'number', 'ordered', 'list', '목록', '번호'],
  },
  {
    id: 'todo',
    icon: 'CheckSquare',
    title: '할 일',
    description: '체크박스가 있는 목록',
    keywords: ['todo', 'checkbox', 'task', '할일', '체크'],
  },
  {
    id: 'toggle',
    icon: 'ChevronRight',
    title: '토글',
    description: '접을 수 있는 목록',
    keywords: ['toggle', 'collapse', '토글', '접기'],
  },
  {
    id: 'quote',
    icon: 'Quote',
    title: '인용',
    description: '인용 블록',
    keywords: ['quote', 'blockquote', '인용', '인용문'],
  },
  {
    id: 'code',
    icon: 'Code',
    title: '코드',
    description: '코드 블록',
    keywords: ['code', 'pre', '코드'],
  },
  {
    id: 'divider',
    icon: 'Minus',
    title: '구분선',
    description: '수평선',
    keywords: ['divider', 'hr', 'line', '구분선', '선'],
  },
]

const ICON_MAP: Record<string, any> = {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  Quote,
  Code,
  Minus,
}

interface SlashCommandMenuProps {
  target: Range | null
  search: string
  onClose: () => void
}

export const SlashCommandMenu = ({ target, search, onClose }: SlashCommandMenuProps) => {
  const editor = useSlate()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // 검색어로 필터링
  const filteredItems = SLASH_MENU_ITEMS.filter((item) => {
    const searchLower = search.toLowerCase()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.keywords.some((keyword) => keyword.includes(searchLower))
    )
  })

  // 선택된 인덱스 리셋
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // 블록 타입 변경
  const insertBlock = useCallback(
    (blockType: BlockType) => {
      if (!target) return

      // 슬래시와 검색어 삭제
      Transforms.select(editor, target)
      Transforms.delete(editor)

      // 새 블록 생성 (id 제거 - Slate-Yjs 호환)
      const newBlock: any = {
        type: blockType,
        children: [{ text: '' }],
      }

      // 특수 블록 속성 추가
      if (blockType === 'todo') {
        newBlock.checked = false
      } else if (blockType === 'toggle') {
        newBlock.collapsed = false
      }

      Transforms.setNodes(editor, newBlock)

      onClose()
    },
    [editor, target, onClose]
  )

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!target) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => (i + 1) % filteredItems.length)
          break

        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length)
          break

        case 'Enter':
          e.preventDefault()
          if (filteredItems[selectedIndex]) {
            insertBlock(filteredItems[selectedIndex].id)
          }
          break

        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [target, filteredItems, selectedIndex, insertBlock, onClose])

  if (!target || filteredItems.length === 0) return null

  return (
    <div className="slash-menu">
      {filteredItems.map((item, index) => {
        const Icon = ICON_MAP[item.icon]

        return (
          <button
            key={item.id}
            className={`slash-menu-item ${index === selectedIndex ? 'selected' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault()
              insertBlock(item.id)
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="slash-menu-icon">
              <Icon size={18} />
            </div>
            <div className="slash-menu-content">
              <div className="slash-menu-title">{item.title}</div>
              <div className="slash-menu-description">{item.description}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

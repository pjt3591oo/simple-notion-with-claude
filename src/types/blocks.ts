import { BaseEditor, Descendant } from 'slate'
import { ReactEditor } from 'slate-react'
import { YjsEditor, CursorEditor, YHistoryEditor } from '@slate-yjs/core'

// 블록 타입 정의
export type BlockType =
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'bulleted-list'
  | 'numbered-list'
  | 'todo'
  | 'toggle'
  | 'quote'
  | 'code'
  | 'divider'
  | 'image'

// 텍스트 포맷
export type TextFormat = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  code?: boolean
  strikethrough?: boolean
}

// 블록 엘리먼트 기본 인터페이스
export interface BaseBlockElement {
  id?: string  // optional - Slate-Yjs 호환을 위해
  type: BlockType
  children: Descendant[]
}

// 각 블록 타입별 인터페이스
export interface ParagraphElement extends BaseBlockElement {
  type: 'paragraph'
}

export interface HeadingElement extends BaseBlockElement {
  type: 'heading-one' | 'heading-two' | 'heading-three'
}

export interface ListElement extends BaseBlockElement {
  type: 'bulleted-list' | 'numbered-list'
}

export interface TodoElement extends BaseBlockElement {
  type: 'todo'
  checked: boolean
}

export interface ToggleElement extends BaseBlockElement {
  type: 'toggle'
  collapsed: boolean
}

export interface QuoteElement extends BaseBlockElement {
  type: 'quote'
}

export interface CodeElement extends BaseBlockElement {
  type: 'code'
  language?: string
}

export interface DividerElement extends BaseBlockElement {
  type: 'divider'
}

export interface ImageElement extends BaseBlockElement {
  type: 'image'
  url: string
  alt?: string
}

// 모든 블록 타입 유니온
export type BlockElement =
  | ParagraphElement
  | HeadingElement
  | ListElement
  | TodoElement
  | ToggleElement
  | QuoteElement
  | CodeElement
  | DividerElement
  | ImageElement

// Slate 에디터 타입 확장 (Yjs 포함)
export type CustomEditor = BaseEditor & ReactEditor & YjsEditor & CursorEditor & YHistoryEditor

// 타입 가드
export const isParagraph = (element: BlockElement): element is ParagraphElement =>
  element.type === 'paragraph'

export const isHeading = (element: BlockElement): element is HeadingElement =>
  ['heading-one', 'heading-two', 'heading-three'].includes(element.type)

export const isTodo = (element: BlockElement): element is TodoElement =>
  element.type === 'todo'

export const isToggle = (element: BlockElement): element is ToggleElement =>
  element.type === 'toggle'

// 슬래시 커맨드 메뉴 아이템
export interface SlashMenuItem {
  id: BlockType
  icon: string
  title: string
  description: string
  keywords: string[]
}

// 페이지 구조
export interface Page {
  id: string
  title: string
  icon?: string
  parentId?: string
  createdAt: number
  updatedAt: number
}

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: BlockElement
    Text: TextFormat
  }
}

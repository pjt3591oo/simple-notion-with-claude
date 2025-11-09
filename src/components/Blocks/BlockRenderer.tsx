import { RenderElementProps, RenderLeafProps } from 'slate-react'
import { ParagraphBlock } from './ParagraphBlock'
import { HeadingBlock } from './HeadingBlock'
import { ListBlock } from './ListBlock'
import { TodoBlock } from './TodoBlock'
import { ToggleBlock } from './ToggleBlock'
import { QuoteBlock } from './QuoteBlock'
import { CodeBlock } from './CodeBlock'
import { DividerBlock } from './DividerBlock'
import { BlockElement } from '../../types/blocks'

// 블록 엘리먼트 렌더러
export const renderElement = (props: RenderElementProps) => {
  const element = props.element as BlockElement

  switch (element.type) {
    case 'paragraph':
      return <ParagraphBlock {...props} />

    case 'heading-one':
    case 'heading-two':
    case 'heading-three':
      return <HeadingBlock {...props} />

    case 'bulleted-list':
    case 'numbered-list':
      return <ListBlock {...props} />

    case 'todo':
      return <TodoBlock {...props} />

    case 'toggle':
      return <ToggleBlock {...props} />

    case 'quote':
      return <QuoteBlock {...props} />

    case 'code':
      return <CodeBlock {...props} />

    case 'divider':
      return <DividerBlock {...props} />

    default:
      return <ParagraphBlock {...props} />
  }
}

// 텍스트 리프 렌더러 (Bold, Italic 등)
export const renderLeaf = (props: RenderLeafProps) => {
  let { children } = props
  const { leaf } = props

  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  if (leaf.code) {
    children = <code className="inline-code">{children}</code>
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>
  }

  return <span {...props.attributes}>{children}</span>
}

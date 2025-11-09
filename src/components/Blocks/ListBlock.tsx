import { RenderElementProps } from 'slate-react'
import { ListElement } from '../../types/blocks'

export const ListBlock = ({ attributes, children, element }: RenderElementProps) => {
  const listElement = element as ListElement

  if (listElement.type === 'bulleted-list') {
    return (
      <ul {...attributes} className="block-list block-bulleted-list">
        <li>{children}</li>
      </ul>
    )
  }

  if (listElement.type === 'numbered-list') {
    return (
      <ol {...attributes} className="block-list block-numbered-list">
        <li>{children}</li>
      </ol>
    )
  }

  return <p {...attributes}>{children}</p>
}

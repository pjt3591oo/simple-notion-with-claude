import { RenderElementProps } from 'slate-react'

export const ParagraphBlock = ({ attributes, children }: RenderElementProps) => {
  return (
    <p {...attributes} className="block-paragraph">
      {children}
    </p>
  )
}

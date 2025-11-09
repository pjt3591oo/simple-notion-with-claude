import { RenderElementProps } from 'slate-react'

export const QuoteBlock = ({ attributes, children }: RenderElementProps) => {
  return (
    <blockquote {...attributes} className="block-quote">
      {children}
    </blockquote>
  )
}

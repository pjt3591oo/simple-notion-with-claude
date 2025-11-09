import { RenderElementProps } from 'slate-react'

export const CodeBlock = ({ attributes, children }: RenderElementProps) => {
  return (
    <pre {...attributes} className="block-code">
      <code>{children}</code>
    </pre>
  )
}

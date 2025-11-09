import { RenderElementProps } from 'slate-react'

export const DividerBlock = ({ attributes, children }: RenderElementProps) => {
  return (
    <div {...attributes} className="block-divider-wrapper">
      <hr contentEditable={false} className="block-divider" />
      {children}
    </div>
  )
}

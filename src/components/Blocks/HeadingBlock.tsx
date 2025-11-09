import { RenderElementProps } from 'slate-react'
import { HeadingElement } from '../../types/blocks'

export const HeadingBlock = ({ attributes, children, element }: RenderElementProps) => {
  const headingElement = element as HeadingElement

  switch (headingElement.type) {
    case 'heading-one':
      return (
        <h1 {...attributes} className="block-heading block-h1">
          {children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2 {...attributes} className="block-heading block-h2">
          {children}
        </h2>
      )
    case 'heading-three':
      return (
        <h3 {...attributes} className="block-heading block-h3">
          {children}
        </h3>
      )
    default:
      return (
        <p {...attributes} className="block-paragraph">
          {children}
        </p>
      )
  }
}

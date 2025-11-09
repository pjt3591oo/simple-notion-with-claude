import { RenderElementProps, useSlateStatic } from 'slate-react'
import { Transforms } from 'slate'
import { TodoElement } from '../../types/blocks'
import { Check } from 'lucide-react'

export const TodoBlock = ({ attributes, children, element }: RenderElementProps) => {
  const editor = useSlateStatic()
  const todoElement = element as TodoElement

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()

    const path = editor.findPath(element)
    Transforms.setNodes(
      editor,
      { checked: !todoElement.checked },
      { at: path }
    )
  }

  return (
    <div {...attributes} className="block-todo">
      <div contentEditable={false} className="todo-checkbox-wrapper">
        <button
          onClick={handleToggle}
          className={`todo-checkbox ${todoElement.checked ? 'checked' : ''}`}
        >
          {todoElement.checked && <Check size={14} />}
        </button>
      </div>
      <span className={todoElement.checked ? 'todo-text-checked' : ''}>
        {children}
      </span>
    </div>
  )
}

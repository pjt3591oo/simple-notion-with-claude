import { useState } from 'react'
import { RenderElementProps } from 'slate-react'
import { ToggleElement } from '../../types/blocks'
import { ChevronRight, ChevronDown } from 'lucide-react'

export const ToggleBlock = ({ attributes, children, element }: RenderElementProps) => {
  const toggleElement = element as ToggleElement
  const [isOpen, setIsOpen] = useState(!toggleElement.collapsed)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }

  return (
    <div {...attributes} className="block-toggle">
      <div className="toggle-header">
        <button
          contentEditable={false}
          onClick={handleToggle}
          className="toggle-icon"
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="toggle-content">
          {children}
        </div>
      </div>
      {isOpen && (
        <div className="toggle-children" contentEditable={false}>
          {/* 토글 안의 중첩 콘텐츠는 나중에 구현 */}
        </div>
      )}
    </div>
  )
}

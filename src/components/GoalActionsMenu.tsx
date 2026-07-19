import { createPortal } from 'react-dom'
import type { RefObject } from 'react'

interface GoalActionsMenuProps {
  isOpen: boolean
  position: { top: number; left: number } | null
  menuRef: RefObject<HTMLDivElement | null>
  onEdit: () => void
  onRemove: () => void
}

const GoalActionsMenu = ({ isOpen, position, menuRef, onEdit, onRemove }: GoalActionsMenuProps) => {
  if (!isOpen || !position) return null

  return createPortal(
    <div
      ref={menuRef}
      className="goal-card__menu goal-card__menu--portal"
      style={{ top: position.top, left: position.left }}
    >
      <button onClick={onEdit}>Editar</button>
      <button onClick={onRemove}>Excluir</button>
    </div>,
    document.body
  )
}

export default GoalActionsMenu

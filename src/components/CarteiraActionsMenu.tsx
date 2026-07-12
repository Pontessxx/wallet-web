import { createPortal } from 'react-dom'
import type { RefObject } from 'react'

interface CarteiraActionsMenuProps {
  isOpen: boolean
  position: { top: number; left: number } | null
  menuRef: RefObject<HTMLDivElement | null>
  onEdit: () => void
  onRemove: () => void
}

const CarteiraActionsMenu = ({ isOpen, position, menuRef, onEdit, onRemove }: CarteiraActionsMenuProps) => {
  if (!isOpen || !position) return null

  return createPortal(
    <div
      ref={menuRef}
      className="carteira-table__menu carteira-table__menu--portal"
      style={{ top: position.top, left: position.left }}
    >
      <button onClick={onRemove}>Remover</button>
      <button className="carteira-table__edit-btn" onClick={onEdit}>
        Editar
      </button>
    </div>,
    document.body
  )
}

export default CarteiraActionsMenu
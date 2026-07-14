import { createPortal } from 'react-dom'
import type { RefObject } from 'react'

interface CategoriaActionsMenuProps {
  isOpen: boolean
  position: { top: number; left: number } | null
  menuRef: RefObject<HTMLDivElement | null>
  onRemove: () => void
}

const CategoriaActionsMenu = ({ isOpen, position, menuRef, onRemove }: CategoriaActionsMenuProps) => {
  if (!isOpen || !position) return null

  return createPortal(
    <div
      ref={menuRef}
      className="categoria-table__menu categoria-table__menu--portal"
      style={{ top: position.top, left: position.left }}
    >
      <button onClick={onRemove}>Remover</button>
    </div>,
    document.body
  )
}

export default CategoriaActionsMenu
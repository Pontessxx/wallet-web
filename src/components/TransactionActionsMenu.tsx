import { createPortal } from 'react-dom';
import type { RefObject } from 'react';

interface TransactionActionsMenuProps {
  isOpen: boolean;
  position: { top: number; left: number } | null;
  menuRef: RefObject<HTMLDivElement | null>;
  onRemove: () => void;
}

const TransactionActionsMenu = ({ isOpen, position, menuRef, onRemove }: TransactionActionsMenuProps) => {
  if (!isOpen || !position) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="history-page__menu history-page__menu--portal"
      style={{ top: position.top, left: position.left }}
    >
      <button type="button" onClick={onRemove}>Excluir</button>
    </div>,
    document.body
  );
};

export default TransactionActionsMenu;

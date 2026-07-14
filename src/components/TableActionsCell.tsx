interface TableActionsCellProps {
  id: string
  registerMenuBtnRef: (id: string) => (el: HTMLButtonElement | null) => void
  onToggleMenu: (id: string) => void
  tdClassName: string
  buttonClassName: string
  ariaLabel?: string
}

const TableActionsCell = ({
  id,
  registerMenuBtnRef,
  onToggleMenu,
  tdClassName,
  buttonClassName,
  ariaLabel = 'Ações',
}: TableActionsCellProps) => {
  return (
    <td className={tdClassName}>
      <button
        ref={registerMenuBtnRef(id)}
        className={buttonClassName}
        onClick={() => onToggleMenu(id)}
        aria-label={ariaLabel}
      >
        ⋮
      </button>
    </td>
  )
}

export default TableActionsCell
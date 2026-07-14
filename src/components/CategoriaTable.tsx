import type { Categoria } from '@/types/categoria'
import { getCategoriaIcon, normalizeCategoriaColor } from '@/utils/categoriaVisuals'
import TableEmptyState from '@/components/TableEmptyState'
import TableActionsCell from '@/components/TableActionsCell'

interface CategoriaTableProps {
  categorias: Categoria[]
  isLoading: boolean
  registerMenuBtnRef: (id: string) => (el: HTMLButtonElement | null) => void
  onToggleMenu: (id: string) => void
}

const CategoriaTable = ({ categorias, isLoading, registerMenuBtnRef, onToggleMenu }: CategoriaTableProps) => {
  const hasItems = categorias.length > 0

  if (!hasItems) {
    return (
      <TableEmptyState
        hasItems={hasItems}
        isLoading={isLoading}
        loadingText="Carregando categorias..."
        emptyText="Nenhuma categoria cadastrada ainda."
        className="categoria-table__empty"
      />
    )
  }

  return (
    <table className="categoria-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {categorias.map((categoria) => {
          const Icon = getCategoriaIcon(categoria.iconKey)
          const color = normalizeCategoriaColor(categoria.colorHex)

          return (
            <tr key={categoria.id}>
              <td className="categoria-table__nome">
                <span className="categoria-table__tag" style={{ borderColor: color }}>
                  <Icon size={14} color={color} />
                  <span>{categoria.nome}</span>
                </span>
              </td>
              <TableActionsCell
                id={categoria.id}
                registerMenuBtnRef={registerMenuBtnRef}
                onToggleMenu={onToggleMenu}
                tdClassName="categoria-table__actions"
                buttonClassName="categoria-table__menu-btn"
              />
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default CategoriaTable
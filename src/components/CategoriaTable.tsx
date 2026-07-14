import type { Categoria } from '@/types/categoria'

interface CategoriaTableProps {
  categorias: Categoria[]
  isLoading: boolean
  registerMenuBtnRef: (id: string) => (el: HTMLButtonElement | null) => void
  onToggleMenu: (id: string) => void
}

const CategoriaTable = ({ categorias, isLoading, registerMenuBtnRef, onToggleMenu }: CategoriaTableProps) => {
  if (categorias.length === 0) {
    return (
      <p className="categoria-table__empty">
        {isLoading ? 'Carregando categorias...' : 'Nenhuma categoria cadastrada ainda.'}
      </p>
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
        {categorias.map((categoria) => (
          <tr key={categoria.id}>
            <td className="categoria-table__nome">{categoria.nome}</td>
            <td className="categoria-table__actions">
              <button
                ref={registerMenuBtnRef(categoria.id)}
                className="categoria-table__menu-btn"
                onClick={() => onToggleMenu(categoria.id)}
                aria-label="Ações"
              >
                ⋮
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default CategoriaTable
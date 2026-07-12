import type { Carteira } from '@/types/carteira'
import BankLogo from '@/components/BankLogo'
import Money from '@/components/Money';

interface CarteiraTableProps {
  carteiras: Carteira[]
  isLoading: boolean
  registerMenuBtnRef: (id: string) => (el: HTMLButtonElement | null) => void
  onToggleMenu: (id: string) => void
}

const CarteiraTable = ({ carteiras, isLoading, registerMenuBtnRef, onToggleMenu }: CarteiraTableProps) => {
  if (carteiras.length === 0) {
    return (
      <p className="carteira-table__empty">
        {isLoading ? 'Carregando carteiras...' : 'Nenhuma carteira cadastrada ainda.'}
      </p>
    )
  }

  return (
    <table className="carteira-table">
      <thead>
        <tr>
          <th>Descrição</th>
          <th>Saldo inicial</th>
          <th>Receitas</th>
          <th>Despesas</th>
          <th>Transferências</th>
          <th>Saldo</th>
          <th>Previsto</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {carteiras.map((carteira) => (
          <tr key={carteira.id}>
            <td className="carteira-table__desc">
              <BankLogo nome={carteira.nome} size={24} />
              <span>{carteira.nome}</span>
            </td>
            <td><Money value={carteira.saldoInicial} /></td>
            <td><Money value={carteira.receitas} /></td>
            <td><Money value={carteira.despesas} /></td>
            <td><Money value={carteira.transferencias} /></td>
            <td className="carteira-table__saldo"><Money value={carteira.saldo} /></td>
            <td className="carteira-table__previsto"><Money value={carteira.saldoProjetado} /></td>
            <td className="carteira-table__actions">
              <button
                ref={registerMenuBtnRef(carteira.id)}
                className="carteira-table__menu-btn"
                onClick={() => onToggleMenu(carteira.id)}
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

export default CarteiraTable
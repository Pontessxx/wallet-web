import type { Carteira } from '@/types/carteira'
import BankLogo from '@/components/BankLogo'

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

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
            <td>{formatCurrency(carteira.saldoInicial)}</td>
            <td>{formatCurrency(carteira.receitas)}</td>
            <td>{formatCurrency(carteira.despesas)}</td>
            <td>{formatCurrency(carteira.transferencias)}</td>
            <td className="carteira-table__saldo">{formatCurrency(carteira.saldo)}</td>
            <td className="carteira-table__previsto">{formatCurrency(carteira.saldoProjetado)}</td>
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
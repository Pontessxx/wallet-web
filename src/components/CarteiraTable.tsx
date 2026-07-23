import type { Carteira } from '@/types/carteira'
import BankLogo from '@/components/BankLogo'
import Money from '@/components/Money';
import TableEmptyState from '@/components/TableEmptyState'
import TableActionsCell from '@/components/TableActionsCell'
import { currencyForOrigem } from '@/utils/currency'

interface CarteiraTableProps {
  carteiras: Carteira[]
  isLoading: boolean
  registerMenuBtnRef: (id: string) => (el: HTMLButtonElement | null) => void
  onToggleMenu: (id: string) => void
}

const CarteiraTable = ({ carteiras, isLoading, registerMenuBtnRef, onToggleMenu }: CarteiraTableProps) => {
  const hasItems = carteiras.length > 0

  if (!hasItems) {
    return (
      <TableEmptyState
        hasItems={hasItems}
        isLoading={isLoading}
        loadingText="Carregando carteiras..."
        emptyText="Nenhuma carteira cadastrada ainda."
        className="carteira-table__empty"
      />
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
        {carteiras.map((carteira) => {
          const currency = currencyForOrigem(carteira.origem)
          return (
          <tr key={carteira.id}>
            <td className="carteira-table__desc">
              <BankLogo nome={carteira.nome} size={24} />
              <span>{carteira.nome}</span>
            </td>
            <td><Money value={carteira.saldoInicial} currency={currency} /></td>
            <td><Money value={carteira.receitas} currency={currency} /></td>
            <td><Money value={carteira.despesas} currency={currency} /></td>
            <td><Money value={carteira.transferencias} currency={currency} /></td>
            <td className="carteira-table__saldo"><Money value={carteira.saldo} currency={currency} /></td>
            <td className="carteira-table__previsto"><Money value={carteira.saldoProjetado} currency={currency} /></td>
            <TableActionsCell
              id={carteira.id}
              registerMenuBtnRef={registerMenuBtnRef}
              onToggleMenu={onToggleMenu}
              tdClassName="carteira-table__actions"
              buttonClassName="carteira-table__menu-btn"
            />
          </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default CarteiraTable
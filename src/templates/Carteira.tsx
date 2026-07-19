import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import CurrencyInput from '@/components/CurrencyInput'
import { useCarteira } from '@/contexts/CarteiraContext'
import { useDropdownMenu } from '@/hooks/useDropdownMenu'
import CarteiraTable from '@/components/CarteiraTable'
import CarteiraActionsMenu from '@/components/CarteiraActionsMenu'
import TableShell from '@/components/TableShell'
import type { WalletFilterType, WalletType } from '@/types/carteira'
import '@/styles/CarteiraForm.scss'
import '@/styles/CarteiraTable.scss'
import Money from '@/components/Money'
import { useDateFilter } from '@/contexts/DateFilterContext'


const Carteira = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [saldoInicial, setSaldoInicial] = useState(0)
  const [tipo, setTipo] = useState<WalletType>('Corrente')
  const [filtroTipo, setFiltroTipo] = useState<WalletFilterType>('-')
  const { periodQuery } = useDateFilter()

  const { openId, position, menuRef, registerTriggerRef, toggle, close } = useDropdownMenu()

  const {
    carteiras,
    saldoTotal,
    fetchSummary,
    createCarteira,
    editCarteira,
    removeCarteira,
    isLoading,
    error,
  } = useCarteira()

  useEffect(() => {
    fetchSummary(filtroTipo === '-' ? undefined : filtroTipo)
  }, [filtroTipo, periodQuery])

  const listaCarteiras = carteiras ?? []

  const resetForm = () => {
    setNome('')
    setSaldoInicial(0)
    setTipo('Corrente')
    setEditingId(null)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (carteiraId: string) => {
    const carteira = listaCarteiras.find((c) => c.id === carteiraId)
    if (!carteira) return

    setEditingId(carteira.id)
    setNome(carteira.nome)
    setSaldoInicial(carteira.saldoInicial)
    setTipo(carteira.categoria as WalletType)
    close()
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!nome.trim()) return

    try {
      if (editingId) {
        await editCarteira({ id: editingId, nome, categoria: tipo }, tipo)
      } else {
        await createCarteira({ nome, saldoInicial }, tipo)
      }
      handleClose()
    } catch {
      // erro já tratado no context via `error`
    }
  }

  const handleRemove = async (id: string) => {
    close()
    try {
      await removeCarteira(id, tipo)
    } catch {
      // erro já tratado no context via `error`
    }
  }

  const totalReceitas = listaCarteiras.reduce((acc, c) => acc + c.receitas, 0)
  const totalDespesas = listaCarteiras.reduce((acc, c) => acc + c.despesas, 0)
  const totalPrevisto = listaCarteiras.reduce((acc, c) => acc + c.saldoProjetado, 0)

  return (
    <section className="carteira-page">
      <header className="carteira-page__header">
        <h1 className="carteira-page__title">Carteiras</h1>
        <div className="carteira-page__controls">
          <select
            className="carteira-page__filter"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as WalletFilterType)}
            aria-label="Filtrar carteiras por tipo"
          >
            <option value="-">-</option>
            <option value="Corrente">Corrente</option>
            <option value="Investimento">Investimento</option>
          </select>
          <button type="button" className="carteira-page__add-btn" onClick={handleOpenCreate}>
            Adicionar Carteira
          </button>
        </div>
      </header>

      <TableShell>
        <CarteiraTable
          carteiras={listaCarteiras}
          isLoading={isLoading}
          registerMenuBtnRef={registerTriggerRef}
          onToggleMenu={toggle}
        />
      </TableShell>

      <footer className="carteira-page__footer">
        <dl className="carteira-page__summary">
          <div>
            <dt>Receitas</dt>
            <dd style={{ color: 'var(--color-success)' }}><Money value={totalReceitas} /></dd>
          </div>
          <div>
            <dt>Despesas</dt>
            <dd style={{ color: 'var(--color-error)' }}><Money value={totalDespesas} /></dd>
          </div>
          <div>
            <dt>Saldo</dt>
            <dd><Money value={saldoTotal ?? 0} /></dd>
          </div>
          <div>
            <dt>Previsto</dt>
            <dd style={{ color: 'var(--color-edit)' }}><Money value={totalPrevisto} /></dd>
          </div>
        </dl>
      </footer>

      <CarteiraActionsMenu
        isOpen={!!openId}
        position={position}
        menuRef={menuRef}
        onRemove={() => openId && handleRemove(openId)}
        onEdit={() => openId && handleOpenEdit(openId)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingId ? 'Editar Carteira' : 'Adicionar Carteira'}
      >
        <div className="carteira-form">
          <div className="carteira-form__field">
            <label className="carteira-form__label">Nome</label>

            <div className="carteira-form__input-wrapper">
              <input
                id="nome"
                className="carteira-form__input"
                value={nome}
                type="text"
                autoComplete="off"
                placeholder="Ex: Bradesco, Nomad, XP..."
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          </div>

          <div className="carteira-form__field">
            <label className="carteira-form__label" htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              className="carteira-form__select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as WalletType)}
            >
              <option value="Corrente">Corrente</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>

          <div className="carteira-form__field">
            <label className="carteira-form__label" htmlFor="saldoInicial">
              Saldo inicial{editingId && ' (não editável)'}
            </label>
            <CurrencyInput
              id="saldoInicial"
              value={saldoInicial}
              onChange={setSaldoInicial}
              disabled={!!editingId}
            />
          </div>

          {error && <p className="carteira-form__error" role="alert">{error}</p>}

          <button
            type="button"
            className="carteira-form__submit"
            onClick={handleSubmit}
            disabled={isLoading || !nome.trim()}
          >
            {isLoading ? (editingId ? 'Salvando...' : 'Criando...') : editingId ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </Modal>
    </section>
  )
}

export default Carteira
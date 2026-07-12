import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { useCarteira } from '@/contexts/CarteiraContext'
import { useDropdownMenu } from '@/hooks/useDropdownMenu'
import CarteiraTable from '@/components/CarteiraTable'
import CarteiraActionsMenu from '@/components/CarteiraActionsMenu'
import type { WalletType } from '@/types/carteira'
import '@/styles/CarteiraForm.scss'
import '@/styles/CarteiraTable.scss'

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const Carteira = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [saldoInicial, setSaldoInicial] = useState(0)
  const [tipo, setTipo] = useState<WalletType>('Corrente')

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
    fetchSummary('Corrente')
  }, [])

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
        <button className="carteira-page__add-btn" onClick={handleOpenCreate}>
          Adicionar Carteira
        </button>
      </header>

      <div className="carteira-table-wrapper">
        <CarteiraTable
          carteiras={listaCarteiras}
          isLoading={isLoading}
          registerMenuBtnRef={registerTriggerRef}
          onToggleMenu={toggle}
        />
      </div>

      <footer className="carteira-page__footer">
        <span>Receitas: <strong>{formatCurrency(totalReceitas)}</strong></span>
        <span>Despesas: <strong>{formatCurrency(totalDespesas)}</strong></span>
        <span>Saldo: <strong>{formatCurrency(saldoTotal ?? 0)}</strong></span>
        <span>Previsto: <strong>{formatCurrency(totalPrevisto)}</strong></span>
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
            <label className="carteira-form__label" htmlFor="nome">Nome</label>
            <input
              id="nome"
              className="carteira-form__input"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Carteira principal"
            />
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
            <input
              id="saldoInicial"
              className="carteira-form__input"
              type="number"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(Number(e.target.value))}
              min={0}
              disabled={!!editingId}
            />
          </div>

          {error && <p className="carteira-form__error">{error}</p>}

          <button
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
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Modal from '@/components/Modal'
import { useCarteira } from '@/contexts/CarteiraContext'
import type { WalletType } from '@/types/carteira'
import '@/styles/CarteiraForm.scss'
import '@/styles/CarteiraTable.scss'

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type MenuPosition = { top: number; left: number }

const Carteira = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [saldoInicial, setSaldoInicial] = useState(0)
  const [tipo, setTipo] = useState<WalletType>('Corrente')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)

  const menuBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const menuRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    if (!openMenuId) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedBtn = menuBtnRefs.current[openMenuId]

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        clickedBtn &&
        !clickedBtn.contains(target)
      ) {
        setOpenMenuId(null)
      }
    }

    const handleReposition = () => setOpenMenuId(null)

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [openMenuId])

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
    setSaldoInicial(carteira.saldoInicial) // só exibido; não é enviado na edição
    setTipo(carteira.categoria as WalletType)
    setOpenMenuId(null)
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
    setOpenMenuId(null)
    try {
      await removeCarteira(id, tipo)
    } catch {
      // erro já tratado no context via `error`
    }
  }

  const toggleMenu = (id: string) => {
    if (openMenuId === id) {
      setOpenMenuId(null)
      return
    }

    const btn = menuBtnRefs.current[id]
    if (btn) {
      const rect = btn.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 120,
      })
    }
    setOpenMenuId(id)
  }

  const listaCarteiras = carteiras ?? []

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
        {listaCarteiras.length === 0 ? (
          <p className="carteira-table__empty">
            {isLoading ? 'Carregando carteiras...' : 'Nenhuma carteira cadastrada ainda.'}
          </p>
        ) : (
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
              {listaCarteiras.map((carteira) => (
                <tr key={carteira.id}>
                  <td className="carteira-table__desc">{carteira.nome}</td>
                  <td>{formatCurrency(carteira.saldoInicial)}</td>
                  <td>{formatCurrency(carteira.receitas)}</td>
                  <td>{formatCurrency(carteira.despesas)}</td>
                  <td>{formatCurrency(carteira.transferencias)}</td>
                  <td className="carteira-table__saldo">{formatCurrency(carteira.saldo)}</td>
                  <td className="carteira-table__previsto">{formatCurrency(carteira.saldoProjetado)}</td>
                  <td className="carteira-table__actions">
                    <button
                      ref={(el) => {
                        menuBtnRefs.current[carteira.id] = el
                      }}
                      className="carteira-table__menu-btn"
                      onClick={() => toggleMenu(carteira.id)}
                      aria-label="Ações"
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <footer className="carteira-page__footer">
        <span>Receitas: <strong>{formatCurrency(totalReceitas)}</strong></span>
        <span>Despesas: <strong>{formatCurrency(totalDespesas)}</strong></span>
        <span>Saldo: <strong>{formatCurrency(saldoTotal ?? 0)}</strong></span>
        <span>Previsto: <strong>{formatCurrency(totalPrevisto)}</strong></span>
      </footer>

      {openMenuId &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className="carteira-table__menu carteira-table__menu--portal"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button onClick={() => handleRemove(openMenuId)}>Remover</button>
            <button className="carteira-table__edit-btn" onClick={() => handleOpenEdit(openMenuId)}>Editar</button>
          </div>,
          document.body
        )}

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
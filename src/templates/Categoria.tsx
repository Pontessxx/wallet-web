import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { useCategoria } from '@/contexts/CategoriaContext'
import { useDropdownMenu } from '@/hooks/useDropdownMenu'
import CategoriaTable from '@/components/CategoriaTable'
import CategoriaActionsMenu from '@/components/CategoriaActionsMenu'
import '@/styles/CategoriaForm.scss'
import '@/styles/CategoriaTable.scss'

const Categoria = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nome, setNome] = useState('')

  const { openId, position, menuRef, registerTriggerRef, toggle, close } = useDropdownMenu()

  const {
    categorias,
    fetchCategorias,
    createCategoria,
    removeCategoria,
    isLoading,
    error,
  } = useCategoria()

  useEffect(() => {
    fetchCategorias()
  }, [])

  const listaCategorias = categorias ?? []

  const resetForm = () => {
    setNome('')
  }

  const handleClose = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!nome.trim()) return

    try {
      await createCategoria({ nome })
      handleClose()
    } catch {
      // erro já tratado no context via `error`
    }
  }

  const handleRemove = async (id: string) => {
    close()
    try {
      await removeCategoria(id)
    } catch {
      // erro já tratado no context via `error`
    }
  }

  return (
    <section className="categoria-page">
      <header className="categoria-page__header">
        <h1 className="categoria-page__title">Categorias</h1>
        <button className="categoria-page__add-btn" onClick={handleOpenCreate}>
          Adicionar Categoria
        </button>
      </header>

      <div className="categoria-table-wrapper">
        <CategoriaTable
          categorias={listaCategorias}
          isLoading={isLoading}
          registerMenuBtnRef={registerTriggerRef}
          onToggleMenu={toggle}
        />
      </div>

      <CategoriaActionsMenu
        isOpen={!!openId}
        position={position}
        menuRef={menuRef}
        onRemove={() => openId && handleRemove(openId)}
      />

      <Modal isOpen={isModalOpen} onClose={handleClose} title="Adicionar Categoria">
        <div className="categoria-form">
          <div className="categoria-form__field">
            <label className="categoria-form__label" htmlFor="nome">
              Nome
            </label>
            <input
              id="nome"
              className="categoria-form__input"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          {error && <p className="categoria-form__error">{error}</p>}

          <button
            className="categoria-form__submit"
            onClick={handleSubmit}
            disabled={isLoading || !nome.trim()}
          >
            {isLoading ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </Modal>
    </section>
  )
}

export default Categoria
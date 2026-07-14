import { useEffect, useMemo, useState } from 'react'
import Modal from '@/components/Modal'
import { useCategoria } from '@/contexts/CategoriaContext'
import { useDropdownMenu } from '@/hooks/useDropdownMenu'
import CategoriaTable from '@/components/CategoriaTable'
import CategoriaActionsMenu from '@/components/CategoriaActionsMenu'
import TableShell from '@/components/TableShell'
import type { CategoriaIconKey } from '@/types/categoria'
import {
  CATEGORIA_ICON_OPTIONS,
  DEFAULT_CATEGORIA_COLOR,
  DEFAULT_CATEGORIA_ICON,
  getCategoriaIcon,
} from '@/utils/categoriaVisuals'
import '@/styles/CategoriaForm.scss'
import '@/styles/CategoriaTable.scss'

const isHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

const Categoria = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [iconKeyInput, setIconKeyInput] = useState<CategoriaIconKey>(DEFAULT_CATEGORIA_ICON)
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)
  const [iconFilter, setIconFilter] = useState('')
  const [colorHex, setColorHex] = useState(DEFAULT_CATEGORIA_COLOR)

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
  const selectedIconKey = iconKeyInput
  const SelectedIcon = getCategoriaIcon(selectedIconKey)
  const selectedIconOption = CATEGORIA_ICON_OPTIONS.find((option) => option.value === selectedIconKey)
  const normalizedIconFilter = iconFilter.trim().toLowerCase()
  const filteredIconOptions = useMemo(
    () =>
      CATEGORIA_ICON_OPTIONS.filter((option) => {
        if (!normalizedIconFilter) return true

        return (
          option.label.toLowerCase().includes(normalizedIconFilter) ||
          option.value.toLowerCase().includes(normalizedIconFilter)
        )
      }),
    [normalizedIconFilter]
  )
  const isColorValid = isHexColor(colorHex)

  const resetForm = () => {
    setNome('')
    setIconKeyInput(DEFAULT_CATEGORIA_ICON)
    setIsIconPickerOpen(false)
    setIconFilter('')
    setColorHex(DEFAULT_CATEGORIA_COLOR)
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
    if (!nome.trim() || !isColorValid) return

    try {
      await createCategoria({ nome, iconKey: selectedIconKey, colorHex })
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

      <TableShell>
        <CategoriaTable
          categorias={listaCategorias}
          isLoading={isLoading}
          registerMenuBtnRef={registerTriggerRef}
          onToggleMenu={toggle}
        />
      </TableShell>

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

          <div className="categoria-form__field">
            <label className="categoria-form__label" htmlFor="iconKey">
              Ícone
            </label>
            <button
              id="iconKey"
              type="button"
              className="categoria-form__icon-trigger"
              onClick={() => setIsIconPickerOpen((prev) => !prev)}
              aria-expanded={isIconPickerOpen}
              aria-controls="categoria-icon-picker"
            >
              <SelectedIcon size={16} color={colorHex} />
              <span>
                {selectedIconOption?.label ?? 'Ícone selecionado'}
              </span>
            </button>

            {isIconPickerOpen && (
              <div className="categoria-form__icon-dropdown" id="categoria-icon-picker">
                <input
                  className="categoria-form__input"
                  type="text"
                  value={iconFilter}
                  onChange={(e) => setIconFilter(e.target.value)}
                  placeholder="Buscar ícone"
                  aria-label="Buscar ícone"
                />

                <div className="categoria-form__icon-grid" role="listbox" aria-label="Selecionar ícone">
                  {filteredIconOptions.map((option) => {
                    const IconOption = getCategoriaIcon(option.value)
                    const isSelected = option.value === selectedIconKey

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`categoria-form__icon-option ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          setIconKeyInput(option.value)
                          setIsIconPickerOpen(false)
                        }}
                        title={`${option.label} (${option.value})`}
                        aria-selected={isSelected}
                      >
                        <IconOption size={18} color={isSelected ? 'var(--color-info)' : colorHex} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="categoria-form__icon-preview" role="status" aria-live="polite">
              <SelectedIcon size={16} color={colorHex} />
              <span>
                {selectedIconOption?.label ?? 'Geral'}
              </span>
            </div>
          </div>

          <div className="categoria-form__field">
            <label className="categoria-form__label" htmlFor="colorHexPicker">
              Cor
            </label>
            <div className="categoria-form__color-row">
              <input
                id="colorHexPicker"
                className="categoria-form__color-picker"
                type="color"
                value={isColorValid ? colorHex : DEFAULT_CATEGORIA_COLOR}
                onChange={(e) => setColorHex(e.target.value.toUpperCase())}
                aria-label="Selecionar cor"
              />

              <input
                id="colorHex"
                className="categoria-form__input"
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value.toUpperCase())}
                placeholder="#64748B"
                maxLength={7}
              />
            </div>

            {!isColorValid && (
              <p className="categoria-form__error">
                Cor inválida. Use formato hexadecimal, por exemplo: #64748B.
              </p>
            )}
          </div>

          {error && <p className="categoria-form__error">{error}</p>}

          <button
            className="categoria-form__submit"
            onClick={handleSubmit}
            disabled={isLoading || !nome.trim() || !isColorValid}
          >
            {isLoading ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </Modal>
    </section>
  )
}

export default Categoria
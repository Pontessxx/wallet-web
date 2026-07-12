import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { bankCatalog, type BankCatalogItem } from '@/utils/bankCatalog'
import '@/styles/BankCombobox.scss'

interface BankComboboxProps {
  value: string
  onChange: (value: string) => void
  id?: string
}

type Position = {
  top: number
  left: number
  width: number
}

const BankCombobox = ({
  value,
  onChange,
  id,
}: BankComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const sugestoes = useMemo(() => {
    const termo = value.trim().toLowerCase()

    if (!termo) {
      return bankCatalog.slice(0, 12)
    }

    const startsWith = bankCatalog.filter((b) =>
      b.nome.toLowerCase().startsWith(termo)
    )

    const includes = bankCatalog.filter(
      (b) =>
        !b.nome.toLowerCase().startsWith(termo) &&
        b.nome.toLowerCase().includes(termo)
    )

    return [...startsWith, ...includes].slice(0, 12)
  }, [value])

  const updatePosition = () => {
    if (!inputRef.current) return

    const rect = inputRef.current.getBoundingClientRect()

    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    })
  }

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node

      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  const handleFocus = () => {
    updatePosition()
    setIsOpen(true)
  }

  const handleInputChange = (novoValor: string) => {
    onChange(novoValor)
    updatePosition()
    setIsOpen(true)
  }

  const handleSelect = (banco: BankCatalogItem) => {
    onChange(banco.nome)
    setIsOpen(false)
  }

  return (
    <div className="bank-combobox">
      <input
        ref={inputRef}
        id={id}
        className="carteira-form__input"
        value={value}
        type="text"
        autoComplete="off"
        placeholder="Ex: Bradesco, Nomad, XP..."
        onFocus={handleFocus}
        onChange={(e) => handleInputChange(e.target.value)}
      />

      {isOpen &&
        position &&
        sugestoes.length > 0 &&
        createPortal(
          <div
            ref={listRef}
            className="bank-combobox__list"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
          >
            {sugestoes.map((banco) => (
              <button
                key={banco.nome}
                type="button"
                className="bank-combobox__item"
                onClick={() => handleSelect(banco)}
              >
                <img
                  src={banco.url}
                  alt={banco.nome}
                  className="bank-combobox__icon"
                />

                <span>{banco.nome}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}

export default BankCombobox
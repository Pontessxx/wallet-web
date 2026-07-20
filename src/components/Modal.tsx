import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import '@/styles/Modal.scss'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  headerActions?: ReactNode
  size?: 'md' | 'lg'
}

const Modal = ({ isOpen, onClose, title, children, headerActions, size = 'md' }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal__overlay">
      <div
        className={`modal__content${size === 'lg' ? ' modal__content--lg' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <header className="modal__header">
          {headerActions ? (
            <>
              <div className="modal__header-left">
                <button
                  type="button"
                  className="modal__close modal__close--leading"
                  onClick={onClose}
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
                {title && (
                  <h2 className="modal__title" id="modal-title">
                    {title}
                  </h2>
                )}
              </div>
              <div className="modal__header-actions">{headerActions}</div>
            </>
          ) : (
            <>
              {title && (
                <h2 className="modal__title" id="modal-title">
                  {title}
                </h2>
              )}
              <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">
                <X size={18} />
              </button>
            </>
          )}
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
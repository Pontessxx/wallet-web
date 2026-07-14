import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '@/services/userService'
import Modal from '@/components/Modal'
import type { User } from '@/types/auth'
import '@/styles/Configuration.scss'

const Configuration = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Editar username
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [isSavingUsername, setIsSavingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  // Trocar senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Excluir conta
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getMe()
        setUser(data)
      } catch {
        setError('Não foi possível carregar os dados do usuário.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  // --- Username ---
  const handleOpenUsernameModal = () => {
    setUsernameInput(user?.username ?? '')
    setUsernameError(null)
    setIsUsernameModalOpen(true)
  }

  const handleCloseUsernameModal = () => {
    if (isSavingUsername) return
    setIsUsernameModalOpen(false)
    setUsernameError(null)
  }

  const handleSaveUsername = async () => {
    const trimmed = usernameInput.trim()

    if (!trimmed) {
      setUsernameError('O nome de usuário não pode ficar vazio.')
      return
    }

    if (trimmed === user?.username) {
      setIsUsernameModalOpen(false)
      return
    }

    setIsSavingUsername(true)
    setUsernameError(null)

    try {
      const updated = await userService.edit({ username: trimmed })
      setUser(updated)
      setIsUsernameModalOpen(false)
    } catch {
      setUsernameError('Não foi possível atualizar o nome de usuário. Tente novamente.')
    } finally {
      setIsSavingUsername(false)
    }
  }

  // --- Senha ---
  const handleOpenPasswordModal = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError(null)
    setIsPasswordModalOpen(true)
  }

  const handleClosePasswordModal = () => {
    if (isSavingPassword) return
    setIsPasswordModalOpen(false)
    setPasswordError(null)
  }

  const handleSavePassword = async () => {
    setPasswordError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação de senha não confere.')
      return
    }

    setIsSavingPassword(true)

    try {
      await userService.editPassword({ currentPassword, newPassword })
      setIsPasswordModalOpen(false)
    } catch {
      setPasswordError('Não foi possível atualizar a senha. Verifique a senha atual e tente novamente.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  // --- Excluir conta ---
  const handleRemove = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      await userService.remove()
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('user')
      navigate('/login')
    } catch {
      setDeleteError('Não foi possível excluir a conta. Tente novamente.')
      setIsDeleting(false)
    }
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setIsDeleteModalOpen(false)
    setDeleteError(null)
  }

  if (isLoading) {
    return <div className="configuration-page">Carregando...</div>
  }

  if (error) {
    return <div className="configuration-page">{error}</div>
  }

  return (
    <section className="configuration-page">
      <header className="configuration-page__header">
        <h1 className="configuration-page__title">Configuration</h1>
      </header>

      {user && (
        <div className="configuration-card">
          <div className="configuration-card__field">
            <span className="configuration-card__label">Usuário</span>
            <div className="configuration-card__row">
              <span className="configuration-card__value">{user.username}</span>
              <button
                className="configuration-card__edit-btn"
                onClick={handleOpenUsernameModal}
              >
                Editar
              </button>
            </div>
          </div>
          <div className="configuration-card__field">
            <span className="configuration-card__label">ID</span>
            <span className="configuration-card__value">{user.id}</span>
          </div>
          <div className="configuration-card__field">
            <button
              className="configuration-card__edit-btn"
              onClick={handleOpenPasswordModal}
            >
              Alterar senha
            </button>
          </div>
        </div>
      )}

      <div className="configuration-danger">
        <h2 className="configuration-danger__title">Zona de perigo</h2>
        <p className="configuration-danger__text">
          Excluir sua conta é uma ação irreversível. Todos os seus dados serão removidos.
        </p>

        <button
          className="configuration-danger__delete-btn"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Excluir conta
        </button>
      </div>

      {/* Modal: editar username */}
      <Modal
        isOpen={isUsernameModalOpen}
        onClose={handleCloseUsernameModal}
        title="Editar nome de usuário"
      >
        <div className="configuration-card__field">
          <input
            className="configuration-card__input"
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            disabled={isSavingUsername}
            autoFocus
          />
        </div>
        {usernameError && <p className="configuration-card__error">{usernameError}</p>}
        <div className="configuration-danger__confirm-actions">
          <button
            className="configuration-danger__cancel-btn"
            onClick={handleCloseUsernameModal}
            disabled={isSavingUsername}
          >
            Cancelar
          </button>
          <button
            className="configuration-card__save-btn"
            onClick={handleSaveUsername}
            disabled={isSavingUsername}
          >
            {isSavingUsername ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </Modal>

      {/* Modal: alterar senha */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title="Alterar senha"
      >
        <div className="configuration-password__field">
          <label className="configuration-password__label" htmlFor="current-password">
            Senha atual
          </label>
          <input
            id="current-password"
            className="configuration-password__input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isSavingPassword}
            autoFocus
          />
        </div>
        <div className="configuration-password__field">
          <label className="configuration-password__label" htmlFor="new-password">
            Nova senha
          </label>
          <input
            id="new-password"
            className="configuration-password__input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSavingPassword}
          />
        </div>
        <div className="configuration-password__field">
          <label className="configuration-password__label" htmlFor="confirm-password">
            Confirmar nova senha
          </label>
          <input
            id="confirm-password"
            className="configuration-password__input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSavingPassword}
          />
        </div>
        {passwordError && <p className="configuration-password__error">{passwordError}</p>}
        <div className="configuration-danger__confirm-actions">
          <button
            className="configuration-danger__cancel-btn"
            onClick={handleClosePasswordModal}
            disabled={isSavingPassword}
          >
            Cancelar
          </button>
          <button
            className="configuration-password__save-btn"
            onClick={handleSavePassword}
            disabled={isSavingPassword}
          >
            {isSavingPassword ? 'Salvando...' : 'Atualizar senha'}
          </button>
        </div>
      </Modal>

      {/* Modal: excluir conta */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Excluir conta"
      >
        <p className="configuration-danger__confirm-text">
          Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.
        </p>
        <div className="configuration-danger__confirm-actions">
          <button
            className="configuration-danger__cancel-btn"
            onClick={handleCloseDeleteModal}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            className="configuration-danger__delete-btn"
            onClick={handleRemove}
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
          </button>
        </div>
        {deleteError && (
          <p className="configuration-danger__error">{deleteError}</p>
        )}
      </Modal>
    </section>
  )
}

export default Configuration
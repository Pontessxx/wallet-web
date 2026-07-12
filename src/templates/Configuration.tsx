import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '@/services/userService'
import type { User } from '@/types/auth'
import '@/styles/Configuration.scss'

const Configuration = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
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
            <span className="configuration-card__value">{user.username}</span>
          </div>
          <div className="configuration-card__field">
            <span className="configuration-card__label">ID</span>
            <span className="configuration-card__value">{user.id}</span>
          </div>
        </div>
      )}

      <div className="configuration-danger">
        <h2 className="configuration-danger__title">Zona de perigo</h2>
        <p className="configuration-danger__text">
          Excluir sua conta é uma ação irreversível. Todos os seus dados serão removidos.
        </p>

        {!isConfirmingDelete ? (
          <button
            className="configuration-danger__delete-btn"
            onClick={() => setIsConfirmingDelete(true)}
          >
            Excluir conta
          </button>
        ) : (
          <div className="configuration-danger__confirm">
            <p className="configuration-danger__confirm-text">
              Tem certeza que deseja excluir sua conta?
            </p>
            <div className="configuration-danger__confirm-actions">
              <button
                className="configuration-danger__cancel-btn"
                onClick={() => setIsConfirmingDelete(false)}
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
          </div>
        )}
      </div>
    </section>
  )
}

export default Configuration
import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/utils/api'
import '@/styles/Login.scss'

type LoginState = {
  username: string
  password: string
}

const LoginTemplate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginState>({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setLoading(true)
    setMessage(null)

    try {
      await authApi.login(form)
      navigate('/home')
    } catch (error) {
      const fallbackMessage = 'Não foi possível entrar. Verifique a API.'
      setMessage(
        error instanceof Error ? error.message : fallbackMessage,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-header">
          <p className="auth-eyebrow">Wallet Web</p>
          <h1>Login</h1>
          <p>
            Acesse sua conta para continuar. A rota inicial do app aponta para
            esta tela.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Nome de usuário</span>
            <input
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Seu nome de usuário"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field">
            <span>Senha</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {message ? <p className="auth-message">{message}</p> : null}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          Não tem conta? <Link to="/signup">Criar cadastro</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginTemplate
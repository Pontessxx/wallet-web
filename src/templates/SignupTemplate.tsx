import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/utils/api'

type SignupState = {
  username: string
  password: string
  confirmPassword: string
}

const SignupTemplate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<SignupState>({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const canSubmit =
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword

  return (
    <main className="auth-shell auth-shell--signup">
      <section className="auth-card">
        <div className="auth-header">
          <p className="auth-eyebrow">Wallet Web</p>
          <h1>Signup</h1>
          <p>Crie seu acesso para depois retornar ao login com a rota certa.</p>
        </div>

        <form
          className="auth-form"
          onSubmit={async (event) => {
            event.preventDefault()

            if (form.password !== form.confirmPassword) {
              setMessage('As senhas precisam ser iguais.')
              return
            }

            setLoading(true)
            setMessage(null)

            try {
              await authApi.signup(form)
              navigate('/')
            } catch (error) {
              const fallbackMessage = 'Não foi possível criar a conta. Verifique a API.'
              setMessage(
                error instanceof Error ? error.message : fallbackMessage,
              )
            } finally {
              setLoading(false)
            }
          }}
        >
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
              autoComplete="new-password"
              placeholder="Crie uma senha"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <label className="auth-field">
            <span>Confirmar Senha</span>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirme sua senha"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          {message ? <p className="auth-message">{message}</p> : null}

          <button
            type="submit"
            className="auth-button"
            disabled={loading || !canSubmit}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/">Voltar ao login</Link>
        </p>
      </section>
    </main>
  )
}

export default SignupTemplate
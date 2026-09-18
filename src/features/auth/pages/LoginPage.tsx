import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

export function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setLoading(true)
    setMessage('')

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    setLoading(false)

    if (error) {
      setMessage(
        'Não foi possível entrar. Confira seu e-mail e sua senha.'
      )
      return
    }

    navigate('/app')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">LEVEL</div>

        <p className="eyebrow">
          Seu próximo level começa aqui.
        </p>

        <h1>Bem-vindo de volta.</h1>

        <p className="description">
          Entre na sua conta para continuar sua evolução.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              autoComplete="email"
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              autoComplete="current-password"
            />
          </label>

          {message && (
            <p className="form-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Entrando...'
              : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          Ainda não tem uma conta?{' '}
          <Link to="/cadastro">
            Criar conta
          </Link>
        </p>
      </section>
    </main>
  )
}

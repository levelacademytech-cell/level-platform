import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

export function RegisterPage() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            display_name: firstName,
          },
        },
      })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    if (!data.session) {
      setMessage(
        'Conta criada! Confira seu e-mail para confirmar o cadastro.'
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
          Bora subir de nível?
        </p>

        <h1>Crie sua conta.</h1>

        <p className="description">
          Estudo, carreira e oportunidades em um único lugar.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Primeiro nome
              <input
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
                required
              />
            </label>

            <label>
              Sobrenome
              <input
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
                required
              />
            </label>
          </div>

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
              minLength={8}
              required
              autoComplete="new-password"
            />
          </label>

          <label className="checkbox-row">
            <input type="checkbox" required />
            <span>
              Li e concordo com os Termos de Uso
              e a Política de Privacidade.
            </span>
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
              ? 'Criando conta...'
              : 'Criar minha conta'}
          </button>
        </form>

        <p className="auth-footer">
          Já possui uma conta?{' '}
          <Link to="/login">
            Entrar
          </Link>
        </p>
      </section>
    </main>
  )
}

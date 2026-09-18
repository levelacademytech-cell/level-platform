import {
  useState,
  type FormEvent,
} from 'react'

import {
  ArrowRight,
  LockKeyhole,
  Mail,
} from 'lucide-react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { BrandMark } from '../../../components/BrandMark'
import { supabase } from '../../../lib/supabase'
import { useTheme } from '../../../theme/ThemeContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { playSound } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
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

    playSound('success')

    const onboardingDone =
      localStorage.getItem('level-onboarding-complete')

    navigate(
      onboardingDone
        ? '/app'
        : '/onboarding'
    )
  }

  return (
    <main className="auth-screen">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <section className="auth-panel glass">
        <BrandMark className="auth-logo" />

        <span className="auth-kicker">
          LEVEL ACADEMY
        </span>

        <h1>Bem-vindo de volta.</h1>

        <p>
          Entre na sua conta para continuar evoluindo.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            E-mail
            <div className="field">
              <Mail size={18} />

              <input
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>
          </label>

          <label>
            Senha
            <div className="field">
              <LockKeyhole size={18} />

              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>
          </label>

          {message && (
            <div className="form-alert">
              {message}
            </div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            <span>
              {loading ? 'Entrando...' : 'Entrar'}
            </span>

            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-link">
          Ainda não tem uma conta?{' '}
          <Link to="/cadastro">
            Crie sua conta
          </Link>
        </p>
      </section>

      <section className="auth-showcase">
        <div className="showcase-orb">
          <div className="showcase-core">
            <BrandMark
              compact
              className="showcase-mark"
            />
          </div>

          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="orbit orbit-three" />
        </div>

        <div className="showcase-copy">
          <span>ESTUDE • JOGUE • EVOLUA</span>

          <h2>
            Seu próximo level começa aqui.
          </h2>

          <p>
            Uma experiência criada para acompanhar
            você do estudo à carreira.
          </p>
        </div>
      </section>
    </main>
  )
}
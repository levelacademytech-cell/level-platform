import {
  useState,
  type FormEvent,
} from 'react'

import {
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { BrandMark } from '../../../components/BrandMark'
import { supabase } from '../../../lib/supabase'
import { useTheme } from '../../../theme/ThemeContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { playSound } = useTheme()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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

    playSound('success')

    if (!data.session) {
      setMessage(
        'Conta criada! Confira seu e-mail para confirmar o cadastro.'
      )
      return
    }

    navigate('/onboarding')
  }

  return (
    <main className="auth-screen">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <section className="auth-panel glass register-panel">
        <BrandMark className="auth-logo" />

        <span className="auth-kicker">
          SUA JORNADA COMEÇA AGORA
        </span>

        <h1>Crie sua conta.</h1>

        <p>
          Entre para a LEVEL e monte uma experiência
          de estudo do seu jeito.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="form-grid">
            <label>
              Nome
              <div className="field">
                <UserRound size={18} />

                <input
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  required
                />
              </div>
            </label>

            <label>
              Sobrenome
              <div className="field">
                <UserRound size={18} />

                <input
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  required
                />
              </div>
            </label>
          </div>

          <label>
            E-mail
            <div className="field">
              <Mail size={18} />

              <input
                type="email"
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
                minLength={8}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>
          </label>

          <label className="check-line">
            <input
              type="checkbox"
              required
            />

            <span>
              Li e concordo com os Termos de Uso
              e a Política de Privacidade.
            </span>
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
              {loading
                ? 'Criando conta...'
                : 'Criar minha conta'}
            </span>

            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-link">
          Já tem uma conta?{' '}
          <Link to="/login">
            Entrar
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
          <span>UM PERFIL. MUITOS CAMINHOS.</span>

          <h2>
            Aprenda, conquiste e vá além.
          </h2>

          <p>
            Faculdade, carreira, concursos, games
            educacionais e oportunidades.
          </p>
        </div>
      </section>
    </main>
  )
}
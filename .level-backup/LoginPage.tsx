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

    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      setLoading(false)

      setMessage(
        'Não foi possível entrar. Confira seu e-mail e sua senha.'
      )

      return
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select('active_course_id')
      .eq('id', data.user.id)
      .single()

    setLoading(false)

    if (profileError) {
      setMessage(
        'Sua conta entrou, mas não conseguimos carregar seu perfil.'
      )

      return
    }

    playSound('success')

    if (profile?.active_course_id) {
      navigate('/app', {
        replace: true,
      })

      return
    }

    navigate('/onboarding', {
      replace: true,
    })
  }

  return (
    <main className="auth-screen level-auth-v2">
      <section className="auth-panel level-login-panel">
        <div className="login-brand-line">
          <BrandMark className="auth-logo" />

          <span>ACADEMY</span>
        </div>

        <span className="auth-kicker">
          ACESSE SUA JORNADA
        </span>

        <h1>
          Continue de onde você parou.
        </h1>

        <p>
          Seu curso, progresso, XP e atividades
          continuam exatamente no seu último level.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            E-mail

            <div className="field level-field">
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

            <div className="field level-field">
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
            className="primary-button level-login-button"
            type="submit"
            disabled={loading}
          >
            <span>
              {loading
                ? 'Carregando seu level...'
                : 'Entrar'}
            </span>

            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-link">
          Primeira vez por aqui?{' '}

          <Link to="/cadastro">
            Criar minha conta
          </Link>
        </p>

        <div className="login-footer-note">
          LEVEL • estudo • carreira • evolução
        </div>
      </section>

      <section className="level-login-scene">
        <div className="scene-grid" />

        <div className="level-monolith">
          <div className="monolith-edge" />

          <BrandMark
            compact
            className="monolith-logo"
          />

          <span className="monolith-label">
            YOUR NEXT LEVEL
          </span>
        </div>

        <div className="scene-copy">
          <span>LEVEL ACADEMY</span>

          <h2>
            Um sistema.
            <br />
            Vários caminhos.
          </h2>

          <p>
            O ambiente se adapta ao que você estuda.
            Você não precisa se adaptar à plataforma.
          </p>
        </div>
      </section>
    </main>
  )
}
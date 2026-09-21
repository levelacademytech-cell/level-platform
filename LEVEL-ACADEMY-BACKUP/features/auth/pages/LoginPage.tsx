import {
  useState,
  type FormEvent,
} from 'react'

import {
  ArrowRight,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { BrandMark } from '../../../components/BrandMark'
import { supabase } from '../../../lib/supabase'

const privilegedRoles = [
  'director',
  'admin',
  'super_admin',
]

export function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [showAccessChoice, setShowAccessChoice] =
    useState(false)

  const [studentDestination, setStudentDestination] =
    useState('/app')

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
        'Nao foi possivel entrar. Confira seu e-mail e sua senha.'
      )

      return
    }

    const [
      profileResult,
      rolesResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('active_course_id')
        .eq('id', data.user.id)
        .maybeSingle(),

      supabase.rpc(
        'get_my_role_keys'
      ),
    ])

    const destination =
      profileResult.data?.active_course_id
        ? '/app'
        : '/onboarding'

    setStudentDestination(
      destination
    )

    const roles =
      Array.isArray(rolesResult.data)
        ? rolesResult.data.map(String)
        : []

    const hasPrivilegedAccess =
      roles.some(
        (role) =>
          privilegedRoles.includes(role)
      )

    setLoading(false)

    if (hasPrivilegedAccess) {
      setShowAccessChoice(true)
      return
    }

    navigate(
      destination,
      {
        replace: true,
      }
    )
  }

  function enterStudent() {
    setShowAccessChoice(false)

    navigate(
      studentDestination,
      {
        replace: true,
      }
    )
  }

  function enterDirector() {
    setShowAccessChoice(false)

    navigate(
      '/app/controle',
      {
        replace: true,
      }
    )
  }

  return (
    <>
      <main className="auth-screen level-auth-v2">
        <section className="auth-panel level-login-panel">
          <div className="login-brand-line">
            <BrandMark className="auth-logo" />

            <span>
              ACADEMY
            </span>
          </div>

          <span className="auth-kicker">
            BEM-VINDO DE VOLTA
          </span>

          <h1>
            Continue seu proximo level.
          </h1>

          <p>
            Entre na sua conta para acessar sua jornada.
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
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="voce@email.com"
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
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Sua senha"
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
              type="submit"
              className="primary-button level-login-button"
              disabled={loading}
            >
              {loading
                ? 'Entrando...'
                : 'Entrar'}

              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-link">
            Primeira vez por aqui?{' '}

            <Link to="/cadastro">
              Criar conta
            </Link>
          </p>
        </section>

        <section className="level-login-scene">
          <div className="scene-grid" />

          <div className="level-monolith">
            <BrandMark
              compact
              className="monolith-logo"
            />

            <span className="monolith-label">
              YOUR NEXT LEVEL
            </span>
          </div>
        </section>
      </main>

      {showAccessChoice && (
        <div className="access-choice-overlay">
          <section className="access-choice-modal">
            <button
              className="access-choice-close"
              onClick={() =>
                setShowAccessChoice(false)
              }
              aria-label="Fechar"
            >
              <X size={19} />
            </button>

            <div className="access-choice-brand">
              <BrandMark compact />
            </div>

            <span className="access-choice-kicker">
              ESCOLHA COMO ENTRAR
            </span>

            <h2>
              Qual ambiente voce quer acessar?
            </h2>

            <p>
              Sua conta possui mais de um nivel de acesso.
            </p>

            <div className="access-choice-grid">
              <button
                className="access-mode-card student-mode"
                onClick={enterStudent}
              >
                <div className="access-mode-icon">
                  <GraduationCap size={29} />
                </div>

                <span>
                  PORTAL ACADEMICO
                </span>

                <strong>
                  Entrar como estudante
                </strong>

                <p>
                  Cursos, atividades, Arena, carreira e progresso.
                </p>

                <ArrowRight size={19} />
              </button>

              <button
                className="access-mode-card director-mode"
                onClick={enterDirector}
              >
                <div className="access-mode-icon">
                  <ShieldCheck size={29} />
                </div>

                <span>
                  DIRECAO LEVEL
                </span>

                <strong>
                  Entrar como diretor
                </strong>

                <p>
                  Administracao, usuarios, cursos, conteudos e configuracoes.
                </p>

                <ArrowRight size={19} />
              </button>
            </div>

            <small>
              Essa escolha aparece apenas para contas com mais de um perfil de acesso.
            </small>
          </section>
        </div>
      )}
    </>
  )
}
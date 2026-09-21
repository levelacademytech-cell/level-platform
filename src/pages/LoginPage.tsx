import {
  ArrowRight,
  LockKeyhole,
  Scale,
} from 'lucide-react'

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  Navigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'

export function LoginPage() {
  const {
    session,
    loading,
    signIn,
  } = useAuth()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  const [sending, setSending] =
    useState(false)

  const [
    desktopBanner,
    setDesktopBanner,
  ] = useState('')

  const [
    mobileBanner,
    setMobileBanner,
  ] = useState('')

  useEffect(() => {
    void supabase
      .from('adv_settings')
      .select('key,value')
      .in(
        'key',
        [
          'login_banner_desktop',
          'login_banner_mobile',
        ]
      )
      .then(({ data }) => {
        for (
          const row of data ?? []
        ) {
          if (
            row.key ===
            'login_banner_desktop'
          ) {
            setDesktopBanner(
              row.value ?? ''
            )
          }

          if (
            row.key ===
            'login_banner_mobile'
          ) {
            setMobileBanner(
              row.value ?? ''
            )
          }
        }
      })
  }, [])

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault()

    setSending(true)
    setError('')

    const result =
      await signIn(
        email,
        password
      )

    if (result) {
      setError(
        'Nao foi possivel entrar. Confira seu e-mail e senha.'
      )
    }

    setSending(false)
  }

  if (loading) {
    return (
      <div className="level-loading">
        LEVEL ADV
      </div>
    )
  }

  if (session) {
    return (
      <Navigate
        to="/app"
        replace
      />
    )
  }

  return (
    <main className="login-screen">
      <section className="login-visual">
        {(desktopBanner ||
          mobileBanner) && (
          <picture className="login-banner">
            {mobileBanner && (
              <source
                media="(max-width: 700px)"
                srcSet={mobileBanner}
              />
            )}

            <img
              src={
                desktopBanner ||
                mobileBanner
              }
              alt=""
            />
          </picture>
        )}

        <div className="login-overlay" />

        <div className="login-logo">
          <strong>LEVEL</strong>
          <span>ADV</span>
        </div>

        <div className="login-message">
          <span>
            INTELIGENCIA JURIDICA
          </span>

          <h1>
            Decisoes juridicas
            com mais dados.
          </h1>

          <p>
            Ferramentas financeiras,
            documentos, casos e
            inteligencia aplicada ao
            dia a dia do escritorio.
          </p>
        </div>
      </section>

      <section className="login-access">
        <form
          onSubmit={submit}
          className="login-card"
        >
          <div className="login-icon">
            <Scale size={28} />
          </div>

          <span className="eyebrow">
            AMBIENTE PROFISSIONAL
          </span>

          <h2>
            Acesse a LEVEL ADV
          </h2>

          <p>
            Entre com as credenciais
            fornecidas pelo seu
            escritorio.
          </p>

          <label>
            E-mail

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              required
            />
          </label>

          <label>
            Senha

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
            />
          </label>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            className="primary-button login-button"
            disabled={sending}
          >
            <LockKeyhole size={17} />

            {sending
              ? 'Entrando...'
              : 'Entrar'}

            {!sending && (
              <ArrowRight
                size={17}
              />
            )}
          </button>
        </form>
      </section>
    </main>
  )
}
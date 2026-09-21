import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  UserPlus,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  supabase,
} from '../lib/supabase'


type AuthMode =
  | 'login'
  | 'signup'
  | 'forgot'
  | 'recovery'


export function LoginPage() {
  const navigate =
    useNavigate()

  const [
    mode,
    setMode,
  ] =
    useState<AuthMode>('login')

  const [
    firstName,
    setFirstName,
  ] =
    useState('')

  const [
    lastName,
    setLastName,
  ] =
    useState('')

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    password,
    setPassword,
  ] =
    useState('')

  const [
    passwordConfirm,
    setPasswordConfirm,
  ] =
    useState('')

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false)

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState('')

  const [
    success,
    setSuccess,
  ] =
    useState(false)


  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      )

    if (
      params.get('recovery') ===
      '1'
    ) {
      setMode('recovery')
    }


    const {
      data: listener,
    } =
      supabase.auth
        .onAuthStateChange(
          (event) => {
            if (
              event ===
              'PASSWORD_RECOVERY'
            ) {
              setMode('recovery')
            }
          }
        )


    return () => {
      listener
        .subscription
        .unsubscribe()
    }
  }, [])


  function clearFeedback() {
    setMessage('')
    setSuccess(false)
  }


  function switchMode(
    next: AuthMode
  ) {
    clearFeedback()

    setPassword('')
    setPasswordConfirm('')

    setMode(next)
  }


  async function login(
    event: FormEvent
  ) {
    event.preventDefault()

    clearFeedback()

    if (
      !email.trim() ||
      !password
    ) {
      setMessage(
        'Informe seu e-mail e senha.'
      )

      return
    }

    setLoading(true)

    const {
      error,
    } =
      await supabase.auth
        .signInWithPassword({
          email:
            email
              .trim()
              .toLowerCase(),

          password,
        })

    setLoading(false)

    if (error) {
      setMessage(
        'E-mail ou senha inválidos.'
      )

      return
    }

    navigate(
      '/app',
      {
        replace: true,
      }
    )
  }


  async function signup(
    event: FormEvent
  ) {
    event.preventDefault()

    clearFeedback()

    if (
      !firstName.trim() ||
      !email.trim()
    ) {
      setMessage(
        'Informe seu nome e e-mail.'
      )

      return
    }


    if (
      password.length < 8
    ) {
      setMessage(
        'A senha deve ter pelo menos 8 caracteres.'
      )

      return
    }


    if (
      password !==
      passwordConfirm
    ) {
      setMessage(
        'As senhas não coincidem.'
      )

      return
    }


    setLoading(true)


    const {
      data,
      error,
    } =
      await supabase.auth
        .signUp({
          email:
            email
              .trim()
              .toLowerCase(),

          password,

          options: {
            emailRedirectTo:
              `${window.location.origin}/login`,

            data: {
              first_name:
                firstName.trim(),

              last_name:
                lastName.trim(),

              display_name:
                `${firstName.trim()} ${lastName.trim()}`
                  .trim(),
            },
          },
        })


    setLoading(false)


    if (error) {
      setMessage(
        error.message
      )

      return
    }


    if (data.session) {
      navigate(
        '/app',
        {
          replace: true,
        }
      )

      return
    }


    setSuccess(true)

    setMessage(
      'Conta criada. Verifique seu e-mail para confirmar o cadastro e depois faça login.'
    )
  }


  async function forgotPassword(
    event: FormEvent
  ) {
    event.preventDefault()

    clearFeedback()

    if (!email.trim()) {
      setMessage(
        'Informe seu e-mail.'
      )

      return
    }


    setLoading(true)


    const {
      error,
    } =
      await supabase.auth
        .resetPasswordForEmail(
          email
            .trim()
            .toLowerCase(),
          {
            redirectTo:
              `${window.location.origin}/login?recovery=1`,
          }
        )


    setLoading(false)


    if (error) {
      setMessage(
        error.message
      )

      return
    }


    setSuccess(true)

    setMessage(
      'Se o e-mail estiver cadastrado, você receberá as instruções para criar uma nova senha.'
    )
  }


  async function updatePassword(
    event: FormEvent
  ) {
    event.preventDefault()

    clearFeedback()

    if (
      password.length < 8
    ) {
      setMessage(
        'A nova senha deve ter pelo menos 8 caracteres.'
      )

      return
    }


    if (
      password !==
      passwordConfirm
    ) {
      setMessage(
        'As senhas não coincidem.'
      )

      return
    }


    setLoading(true)


    const {
      error,
    } =
      await supabase.auth
        .updateUser({
          password,
        })


    if (error) {
      setLoading(false)

      setMessage(
        error.message
      )

      return
    }


    await supabase.auth
      .signOut()


    setLoading(false)

    setPassword('')
    setPasswordConfirm('')

    setSuccess(true)

    setMessage(
      'Senha atualizada com sucesso. Faça login com sua nova senha.'
    )

    setMode('login')

    window.history.replaceState(
      {},
      '',
      '/login'
    )
  }


  return (
    <main className="level-auth">

      <section className="level-auth-visual">

        <div className="level-auth-brand">
          <strong>
            LEVEL
          </strong>

          <span>
            ADV
          </span>
        </div>


        <div className="level-auth-copy">

          <span>
            AMBIENTE JURÍDICO
          </span>

          <h1>
            Inteligência para
            decisões jurídicas.
          </h1>

          <p>
            Cálculos, casos, documentos,
            colaboração e ferramentas para
            a rotina do escritório em um
            único ambiente.
          </p>

        </div>


        <div className="level-auth-footer">
          LEVEL ADV
          <span>•</span>
          Ambiente profissional
        </div>

      </section>


      <section className="level-auth-access">

        <div className="level-auth-card">

          {mode === 'login' && (
            <>

              <div className="auth-title">

                <span>
                  ACESSO
                </span>

                <h2>
                  Entrar na LEVEL
                </h2>

                <p>
                  Use seu e-mail e senha
                  para acessar o escritório.
                </p>

              </div>


              <form
                onSubmit={login}
              >

                <label>
                  E-mail

                  <div className="auth-input">
                    <Mail size={17} />

                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="voce@escritorio.com"
                    />
                  </div>
                </label>


                <label>
                  Senha

                  <div className="auth-input">
                    <LockKeyhole
                      size={17}
                    />

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Sua senha"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}
                    </button>
                  </div>
                </label>


                <button
                  type="button"
                  className="forgot-link"
                  onClick={() =>
                    switchMode(
                      'forgot'
                    )
                  }
                >
                  Esqueci minha senha
                </button>


                {message && (
                  <div
                    className={
                      success
                        ? 'auth-message success'
                        : 'auth-message'
                    }
                  >
                    {success && (
                      <CheckCircle2
                        size={16}
                      />
                    )}

                    {message}
                  </div>
                )}


                <button
                  type="submit"
                  className="auth-main-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Entrando...'
                    : 'Entrar'}
                </button>

              </form>


              <div className="auth-divider">
                <span>
                  NOVO NA LEVEL?
                </span>
              </div>


              <button
                type="button"
                className="auth-create-button"
                onClick={() =>
                  switchMode(
                    'signup'
                  )
                }
              >
                <UserPlus size={17} />

                Criar minha conta
              </button>

            </>
          )}


          {mode === 'signup' && (
            <>

              <button
                type="button"
                className="auth-back"
                onClick={() =>
                  switchMode(
                    'login'
                  )
                }
              >
                <ArrowLeft
                  size={15}
                />

                Voltar
              </button>


              <div className="auth-title">

                <span>
                  NOVO ACESSO
                </span>

                <h2>
                  Criar conta
                </h2>

                <p>
                  Cadastre seus dados para
                  utilizar a LEVEL ADV.
                </p>

              </div>


              <form
                onSubmit={signup}
              >

                <div className="auth-name-grid">

                  <label>
                    Nome

                    <input
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(
                          event.target.value
                        )
                      }
                      placeholder="Nome"
                    />
                  </label>


                  <label>
                    Sobrenome

                    <input
                      value={lastName}
                      onChange={(event) =>
                        setLastName(
                          event.target.value
                        )
                      }
                      placeholder="Sobrenome"
                    />
                  </label>

                </div>


                <label>
                  E-mail

                  <div className="auth-input">
                    <Mail size={17} />

                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="voce@escritorio.com"
                    />
                  </div>
                </label>


                <label>
                  Senha

                  <div className="auth-input">
                    <LockKeyhole
                      size={17}
                    />

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Mínimo de 8 caracteres"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}
                    </button>
                  </div>
                </label>


                <label>
                  Confirmar senha

                  <div className="auth-input">
                    <KeyRound
                      size={17}
                    />

                    <input
                      type="password"
                      autoComplete="new-password"
                      value={
                        passwordConfirm
                      }
                      onChange={(event) =>
                        setPasswordConfirm(
                          event.target.value
                        )
                      }
                      placeholder="Repita sua senha"
                    />
                  </div>
                </label>


                {message && (
                  <div
                    className={
                      success
                        ? 'auth-message success'
                        : 'auth-message'
                    }
                  >
                    {success && (
                      <CheckCircle2
                        size={16}
                      />
                    )}

                    {message}
                  </div>
                )}


                <button
                  type="submit"
                  className="auth-main-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Criando conta...'
                    : 'Criar conta'}
                </button>

              </form>

            </>
          )}


          {mode === 'forgot' && (
            <>

              <button
                type="button"
                className="auth-back"
                onClick={() =>
                  switchMode(
                    'login'
                  )
                }
              >
                <ArrowLeft
                  size={15}
                />

                Voltar
              </button>


              <div className="auth-title">

                <span>
                  RECUPERAÇÃO
                </span>

                <h2>
                  Esqueceu sua senha?
                </h2>

                <p>
                  Informe o e-mail da sua conta.
                  A LEVEL enviará o link de
                  recuperação.
                </p>

              </div>


              <form
                onSubmit={
                  forgotPassword
                }
              >

                <label>
                  E-mail

                  <div className="auth-input">
                    <Mail size={17} />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="voce@escritorio.com"
                    />
                  </div>
                </label>


                {message && (
                  <div
                    className={
                      success
                        ? 'auth-message success'
                        : 'auth-message'
                    }
                  >
                    {success && (
                      <CheckCircle2
                        size={16}
                      />
                    )}

                    {message}
                  </div>
                )}


                <button
                  type="submit"
                  className="auth-main-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Enviando...'
                    : 'Enviar link de recuperação'}
                </button>

              </form>

            </>
          )}


          {mode === 'recovery' && (
            <>

              <div className="auth-title">

                <span>
                  NOVA SENHA
                </span>

                <h2>
                  Defina sua nova senha
                </h2>

                <p>
                  Crie uma nova senha para
                  recuperar o acesso à LEVEL.
                </p>

              </div>


              <form
                onSubmit={
                  updatePassword
                }
              >

                <label>
                  Nova senha

                  <div className="auth-input">
                    <LockKeyhole
                      size={17}
                    />

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Mínimo de 8 caracteres"
                    />
                  </div>
                </label>


                <label>
                  Confirmar nova senha

                  <div className="auth-input">
                    <KeyRound
                      size={17}
                    />

                    <input
                      type="password"
                      value={
                        passwordConfirm
                      }
                      onChange={(event) =>
                        setPasswordConfirm(
                          event.target.value
                        )
                      }
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </label>


                {message && (
                  <div className="auth-message">
                    {message}
                  </div>
                )}


                <button
                  type="submit"
                  className="auth-main-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Atualizando...'
                    : 'Salvar nova senha'}
                </button>

              </form>

            </>
          )}

        </div>

      </section>

    </main>
  )
}
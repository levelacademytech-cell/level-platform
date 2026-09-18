import { useAuth } from '../features/auth/context/AuthContext'

export function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <main style={{ padding: 40 }}>
      <h1>LEVEL</h1>

      <h2>
        Seu próximo level começa aqui.
      </h2>

      <p>
        Usuário conectado:
        {' '}
        {user?.email}
      </p>

      <button onClick={signOut}>
        Sair
      </button>
    </main>
  )
}

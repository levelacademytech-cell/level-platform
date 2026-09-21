import {
  Bot,
  MessageCircle,
  MessagesSquare,
} from 'lucide-react'

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext'

import {
  AppLayout,
} from './layouts/AppLayout'

import {
  AdminPage,
} from './pages/AdminPage'

import {
  BankingPage,
} from './pages/BankingPage'

import {
  CalculatorsPage,
} from './pages/CalculatorsPage'

import {
  CasesPage,
} from './pages/CasesPage'

import {
  DashboardPage,
} from './pages/DashboardPage'

import {
  DocumentsPage,
} from './pages/DocumentsPage'

import {
  LoginPage,
} from './pages/LoginPage'

import {
  ModulePage,
} from './pages/ModulePage'

import {
  RevolvingCardPage,
} from './pages/RevolvingCardPage'

function ProtectedLayout() {
  const {
    session,
    loading,
  } = useAuth()

  if (loading) {
    return (
      <div className="level-loading">
        LEVEL ADV
      </div>
    )
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <AppLayout />
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/app"
        element={
          <ProtectedLayout />
        }
      >
        <Route
          index
          element={
            <DashboardPage />
          }
        />

        <Route
          path="calculadoras"
          element={
            <CalculatorsPage />
          }
        />

        <Route
          path="calculadoras/bancario"
          element={
            <BankingPage />
          }
        />

        <Route
          path="calculadoras/bancario/rotativo"
          element={
            <RevolvingCardPage />
          }
        />

        <Route
          path="casos"
          element={
            <CasesPage />
          }
        />

        <Route
          path="documentos"
          element={
            <DocumentsPage />
          }
        />

        <Route
          path="ia"
          element={
            <ModulePage
              eyebrow="INTELIGENCIA JURIDICA"
              title="LEVEL IA"
              description="Leitura de documentos, organizacao de informacoes e apoio inteligente para a equipe."
              icon={Bot}
              beta
            />
          }
        />

        <Route
          path="chat"
          element={
            <ModulePage
              eyebrow="COMUNICACAO"
              title="Chat interno"
              description="Mensagens privadas entre membros da equipe com expiracao operacional em 24 horas."
              icon={
                MessageCircle
              }
            />
          }
        />

        <Route
          path="forum"
          element={
            <ModulePage
              eyebrow="EQUIPE"
              title="Forum juridico"
              description="Espaco permanente para discussoes, duvidas internas e compartilhamento de conhecimento."
              icon={
                MessagesSquare
              }
            />
          }
        />

        <Route
          path="admin"
          element={
            <AdminPage />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/app"
            replace
          />
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
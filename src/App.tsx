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
  LegalGate,
} from './components/LegalGate'

import {
  AppLayout,
} from './layouts/AppLayout'

import {
  AdminPage,
} from './pages/AdminPage'

import {
  CalculatorCategoryPage,
} from './pages/CalculatorCategoryPage'

import {
  CalculatorsPage,
} from './pages/CalculatorsPage'

import {
  CasesPage,
} from './pages/CasesPage'

import {
  CaseWorkspacePage,
} from './pages/CaseWorkspacePage'

import {
  ChatPage,
} from './pages/ChatPage'

import {
  DashboardPage,
} from './pages/DashboardPage'

import {
  DocumentGeneratorPage,
} from './pages/DocumentGeneratorPage'

import {
  DocumentsPage,
} from './pages/DocumentsPage'

import {
  ForumPage,
} from './pages/ForumPage'

import {
  GenericCalculatorPage,
} from './pages/GenericCalculatorPage'

import {
  LoginPage,
} from './pages/LoginPage'

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

  return (
    <LegalGate>
      <AppLayout />
    </LegalGate>
  )
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
        element={
          <LoginPage />
        }
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
          path="calculadoras/bancario/rotativo"
          element={
            <RevolvingCardPage />
          }
        />

        <Route
          path="calculadoras/bancario/rotativo/:caseId"
          element={
            <RevolvingCardPage />
          }
        />

        <Route
          path="calculadoras/:category/:slug"
          element={
            <GenericCalculatorPage />
          }
        />

        <Route
          path="calculadoras/:category"
          element={
            <CalculatorCategoryPage />
          }
        />

        <Route
          path="casos"
          element={
            <CasesPage />
          }
        />

        <Route
          path="casos/:caseId"
          element={
            <CaseWorkspacePage />
          }
        />

        <Route
          path="documentos"
          element={
            <DocumentsPage />
          }
        />

        <Route
          path="gerador-documentos"
          element={
            <DocumentGeneratorPage />
          }
        />

        <Route
          path="gerador-documentos/modelo/:templateId"
          element={
            <DocumentGeneratorPage />
          }
        />

        <Route
          path="gerador-documentos/documento/:documentId"
          element={
            <DocumentGeneratorPage />
          }
        />

        <Route
          path="chat"
          element={
            <ChatPage />
          }
        />

        <Route
          path="forum"
          element={
            <ForumPage />
          }
        />

        <Route
          path="forum/:topicId"
          element={
            <ForumPage />
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
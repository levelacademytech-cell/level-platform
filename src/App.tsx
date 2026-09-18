import type { ReactNode } from 'react'

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { AuthProvider } from './features/auth/context/AuthContext'
import { ProtectedRoute } from './features/auth/guards/ProtectedRoute'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { OnboardingPage } from './features/auth/pages/OnboardingPage'

import {
  CourseProvider,
  useCourses,
} from './courses/CourseContext'

import { ThemeProvider } from './theme/ThemeContext'

import { AppShell } from './layouts/AppShell'

import { DashboardPage } from './pages/DashboardPage'
import { ModulePage } from './pages/ModulePage'
import { SettingsPage } from './pages/SettingsPage'
import { CoursesPage } from './pages/CoursesPage'


function CourseGate({
  children,
}: {
  children: ReactNode
}) {
  const {
    activeCourse,
    loading,
  } = useCourses()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--app-bg)',
          color: 'var(--text)',
        }}
      >
        Preparando sua LEVEL...
      </div>
    )
  }

  if (!activeCourse) {
    return (
      <Navigate
        to="/onboarding"
        replace
      />
    )
  }

  return children
}


function ProtectedShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ProtectedRoute>
      <CourseGate>
        <AppShell>
          {children}
        </AppShell>
      </CourseGate>
    </ProtectedRoute>
  )
}


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CourseProvider>
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
                path="/cadastro"
                element={<RegisterPage />}
              />

              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/app"
                element={
                  <ProtectedShell>
                    <DashboardPage />
                  </ProtectedShell>
                }
              />

              <Route
                path="/app/cursos"
                element={
                  <ProtectedShell>
                    <CoursesPage />
                  </ProtectedShell>
                }
              />

              <Route
                path="/app/estudar"
                element={
                  <ProtectedShell>
                    <ModulePage
                      eyebrow="LEVEL ACADEMY"
                      title="Estudar"
                      description="Trilhas, disciplinas, biblioteca, atividades, flashcards e progresso."
                    />
                  </ProtectedShell>
                }
              />

              <Route
                path="/app/arena"
                element={
                  <ProtectedShell>
                    <ModulePage
                      eyebrow="ARENA LEVEL"
                      title="Jogue, aprenda e suba de nível."
                      description="Perguntas aleatórias, desafios, ranking, XP, Level Coins e batalhas de conhecimento."
                    />
                  </ProtectedShell>
                }
              />

              <Route
                path="/app/carreira"
                element={
                  <ProtectedShell>
                    <ModulePage
                      eyebrow="LEVEL CARREIRA"
                      title="Sua carreira também sobe de nível."
                      description="Currículo estruturado, vagas, estágios, testes, entrevistas e empresas parceiras."
                    />
                  </ProtectedShell>
                }
              />

              <Route
                path="/app/concursos"
                element={
                  <ProtectedShell>
                    <ModulePage
                      eyebrow="CONCURSOS & PROVAS"
                      title="Prepare-se para a próxima conquista."
                      description="ENEM, Encceja, vestibulares, concursos, simulados e preparatórios."
                    />
                  </ProtectedShell>
                }
              />

              <Route
                path="/app/comunidade"
                element={
                  <ProtectedShell>
                    <ModulePage
                      eyebrow="LEVEL COMUNIDADE"
                      title="Aprender também é compartilhar."
                      description="Fóruns, grupos, discussões e comunidades por curso e disciplina."
                    />
                  </ProtectedShell>
                }
              />

              <Route
                path="/app/recompensas"
                element={
                  <ProtectedShell>
                    <ModulePage
                      eyebrow="LEVEL REWARDS"
                      title="Seu esforço vale recompensas."
                      description="Level Coins, badges, benefícios, Premium e itens exclusivos."
                    />
                  </ProtectedShell>
                }
              />

              <Route
                path="/app/store"
                element={
                  <ProtectedShell>
                    <ModulePage
                      eyebrow="LEVEL STORE"
                      title="Uma loja feita para quem quer evoluir."
                      description="Produtos LEVEL, livros, materiais, parceiros e recompensas."
                    />
                  </ProtectedShell>
                }
              />

              <Route
                path="/app/configuracoes"
                element={
                  <ProtectedShell>
                    <SettingsPage />
                  </ProtectedShell>
                }
              />

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
          </CourseProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

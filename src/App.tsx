import type { ReactNode } from 'react'

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { ThemeProvider } from './theme/ThemeContext'

import {
  AuthProvider,
} from './features/auth/context/AuthContext'

import {
  ProtectedRoute,
} from './features/auth/guards/ProtectedRoute'

import {
  LoginPage,
} from './features/auth/pages/LoginPage'

import {
  RegisterPage,
} from './features/auth/pages/RegisterPage'

import {
  OnboardingPage,
} from './features/auth/pages/OnboardingPage'

import {
  CourseProvider,
  useCourses,
} from './courses/CourseContext'

import {
  AdminProvider,
} from './admin/AdminContext'

import {
  AdminGuard,
} from './admin/AdminGuard'

import {
  DirectorLayout,
} from './admin/DirectorLayout'

import { AppShell } from './layouts/AppShell'

import { DashboardPage } from './pages/DashboardPage'
import { ModulePage } from './pages/ModulePage'
import { SettingsPage } from './pages/SettingsPage'
import { CoursesPage } from './pages/CoursesPage'

import {
  AdminDashboardPage,
} from './pages/admin/AdminDashboardPage'

import {
  AdminUsersPage,
} from './pages/admin/AdminUsersPage'

import {
  AdminCoursesPage,
} from './pages/admin/AdminCoursesPage'

import {
  AdminCommunicationsPage,
} from './pages/admin/AdminCommunicationsPage'

import {
  AdminModulePage,
} from './pages/admin/AdminModulePage'


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
      <div className="level-permission-loading">
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


function StudentShell({
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


function DirectorShell() {
  return (
    <ProtectedRoute>
      <AdminGuard>
        <DirectorLayout />
      </AdminGuard>
    </ProtectedRoute>
  )
}


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CourseProvider>
            <AdminProvider>
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
                    <StudentShell>
                      <DashboardPage />
                    </StudentShell>
                  }
                />

                <Route
                  path="/app/cursos"
                  element={
                    <StudentShell>
                      <CoursesPage />
                    </StudentShell>
                  }
                />

                <Route
                  path="/app/estudar"
                  element={
                    <StudentShell>
                      <ModulePage
                        eyebrow="LEVEL ACADEMY"
                        title="Estudar"
                        description="Trilhas, disciplinas, biblioteca, atividades, flashcards e progresso."
                      />
                    </StudentShell>
                  }
                />

                <Route
                  path="/app/arena"
                  element={
                    <StudentShell>
                      <ModulePage
                        eyebrow="ARENA LEVEL"
                        title="Jogue, aprenda e suba de nivel."
                        description="Desafios, ranking, XP e batalhas de conhecimento."
                      />
                    </StudentShell>
                  }
                />

                <Route
                  path="/app/carreira"
                  element={
                    <StudentShell>
                      <ModulePage
                        eyebrow="LEVEL CARREIRA"
                        title="Carreira"
                        description="Curriculo, vagas, estagios e empresas parceiras."
                      />
                    </StudentShell>
                  }
                />

                <Route
                  path="/app/concursos"
                  element={
                    <StudentShell>
                      <ModulePage
                        eyebrow="CONCURSOS"
                        title="Concursos e provas"
                        description="ENEM, vestibulares, concursos e simulados."
                      />
                    </StudentShell>
                  }
                />

                <Route
                  path="/app/comunidade"
                  element={
                    <StudentShell>
                      <ModulePage
                        eyebrow="COMUNIDADE"
                        title="Comunidade LEVEL"
                        description="Foruns, grupos e discussoes."
                      />
                    </StudentShell>
                  }
                />

                <Route
                  path="/app/recompensas"
                  element={
                    <StudentShell>
                      <ModulePage
                        eyebrow="REWARDS"
                        title="Recompensas"
                        description="XP, moedas e beneficios."
                      />
                    </StudentShell>
                  }
                />

                <Route
                  path="/app/store"
                  element={
                    <StudentShell>
                      <ModulePage
                        eyebrow="STORE"
                        title="LEVEL Store"
                        description="Produtos, livros e materiais."
                      />
                    </StudentShell>
                  }
                />

                <Route
                  path="/app/configuracoes"
                  element={
                    <StudentShell>
                      <SettingsPage />
                    </StudentShell>
                  }
                />


                <Route
                  path="/app/controle"
                  element={<DirectorShell />}
                >
                  <Route
                    index
                    element={
                      <AdminDashboardPage />
                    }
                  />

                  <Route
                    path="usuarios"
                    element={
                      <AdminUsersPage />
                    }
                  />

                  <Route
                    path="cursos"
                    element={
                      <AdminCoursesPage />
                    }
                  />

                  <Route
                    path="comunicacao"
                    element={
                      <AdminCommunicationsPage />
                    }
                  />

                  <Route
                    path="conteudos"
                    element={
                      <AdminModulePage
                        eyebrow="ACADEMICO"
                        title="Disciplinas e conteudos"
                        description="Aulas, disciplinas, bibliotecas, atividades e materiais."
                      />
                    }
                  />

                  <Route
                    path="arena"
                    element={
                      <AdminModulePage
                        eyebrow="GAMIFICACAO"
                        title="Arena Level"
                        description="Perguntas, desafios, ranking, XP e moedas."
                      />
                    }
                  />

                  <Route
                    path="carreira"
                    element={
                      <AdminModulePage
                        eyebrow="CARREIRA"
                        title="Vagas e empresas"
                        description="Empresas, vagas, candidatos e processos seletivos."
                      />
                    }
                  />

                  <Route
                    path="concursos"
                    element={
                      <AdminModulePage
                        eyebrow="OPORTUNIDADES"
                        title="Concursos e provas"
                        description="Concursos, ENEM, vestibulares, datas e preparatorios."
                      />
                    }
                  />

                  <Route
                    path="comunidade"
                    element={
                      <AdminModulePage
                        eyebrow="MODERACAO"
                        title="Comunidade"
                        description="Foruns, publicacoes, denuncias e moderacao."
                      />
                    }
                  />

                  <Route
                    path="store"
                    element={
                      <AdminModulePage
                        eyebrow="COMERCIO"
                        title="Store e Rewards"
                        description="Produtos, estoque, recompensas, XP e parceiros."
                      />
                    }
                  />

                  <Route
                    path="financeiro"
                    element={
                      <AdminModulePage
                        eyebrow="FINANCEIRO"
                        title="Planos e pagamentos"
                        description="Planos, assinaturas, compras, pagamentos e historico."
                      />
                    }
                  />

                  <Route
                    path="aparencia"
                    element={
                      <AdminModulePage
                        eyebrow="DESIGN SYSTEM"
                        title="Aparencia da plataforma"
                        description="Cores, banners, fontes, fundos, animacoes e temas por curso."
                      />
                    }
                  />

                  <Route
                    path="configuracoes"
                    element={
                      <AdminModulePage
                        eyebrow="SISTEMA"
                        title="Configuracoes gerais"
                        description="Parametros globais e configuracoes da LEVEL."
                      />
                    }
                  />

                  <Route
                    path="auditoria"
                    element={
                      <AdminModulePage
                        eyebrow="SEGURANCA"
                        title="Auditoria e logs"
                        description="Historico de acoes administrativas e eventos do sistema."
                      />
                    }
                  />
                </Route>

                <Route
                  path="/app/admin/*"
                  element={
                    <Navigate
                      to="/app/controle"
                      replace
                    />
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
            </AdminProvider>
          </CourseProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
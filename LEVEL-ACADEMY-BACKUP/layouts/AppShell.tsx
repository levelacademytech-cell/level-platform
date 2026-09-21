import type { ReactNode } from 'react'

import {
  BookOpen,
  BriefcaseBusiness,
  Gift,
  Home,
  Landmark,
  Layers3,
  LogOut,
  MessageCircleMore,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Trophy,
} from 'lucide-react'

import {
  NavLink,
  useNavigate,
} from 'react-router-dom'

import { BrandMark } from '../components/BrandMark'
import { useAuth } from '../features/auth/context/AuthContext'
import { useCourses } from '../courses/CourseContext'
import { useAdmin } from '../admin/AdminContext'

interface AppShellProps {
  children: ReactNode
}

const navItems = [
  {
    to: '/app',
    label: 'In\u00edcio',
    icon: Home,
    end: true,
  },
  {
    to: '/app/estudar',
    label: 'Estudar',
    icon: BookOpen,
  },
  {
    to: '/app/cursos',
    label: 'Meus Cursos',
    icon: Layers3,
  },
  {
    to: '/app/arena',
    label: 'Arena Level',
    icon: Trophy,
  },
  {
    to: '/app/carreira',
    label: 'Carreira',
    icon: BriefcaseBusiness,
  },
  {
    to: '/app/concursos',
    label: 'Concursos',
    icon: Landmark,
  },
  {
    to: '/app/comunidade',
    label: 'Comunidade',
    icon: MessageCircleMore,
  },
  {
    to: '/app/recompensas',
    label: 'Rewards',
    icon: Gift,
  },
  {
    to: '/app/store',
    label: 'Store',
    icon: ShoppingBag,
  },
]

export function AppShell({
  children,
}: AppShellProps) {
  const navigate = useNavigate()

  const {
    user,
    signOut,
  } = useAuth()

  const {
    activeCourse,
    progress,
  } = useCourses()

  const {
    canAccessControl,
  } = useAdmin()

  const firstName =
    user?.user_metadata?.first_name ??
    user?.email?.split('@')[0] ??
    'Aluno'

  async function handleLogout() {
    await signOut()

    navigate(
      '/login',
      {
        replace: true,
      }
    )
  }

  return (
    <div className="level-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrandMark className="brand-wordmark" />

          <span>
            ACADEMY
          </span>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">
            {firstName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {firstName}
            </strong>

            <span>
              {activeCourse?.name ??
                'LEVEL'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(
            (item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({
                    isActive,
                  }) =>
                    `nav-item ${
                      isActive
                        ? 'active'
                        : ''
                    }`
                  }
                >
                  <Icon size={19} />

                  <span>
                    {item.label}
                  </span>
                </NavLink>
              )
            }
          )}

          {canAccessControl && (
            <NavLink
              to="/app/controle"
              className={({
                isActive,
              }) =>
                `nav-item director-menu ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }
            >
              <ShieldCheck size={19} />

              <span>
                Centro de Controle
              </span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/app/configuracoes"
            className="icon-action"
          >
            <Settings size={18} />

            <span>
              {'Configura\u00e7\u00f5es'}
            </span>
          </NavLink>

          <button
            className="icon-action danger"
            onClick={handleLogout}
          >
            <LogOut size={18} />

            <span>
              Sair
            </span>
          </button>
        </div>
      </aside>

      <section className="app-main">
        <header className="topbar">
          <div>
            <span className="topbar-eyebrow">
              LEVEL {'\u2022'}{' '}
              {activeCourse?.name ??
                'ACADEMY'}
            </span>

            <strong>
              Ei, {firstName}!{' '}
              {'\uD83D\uDC4B'}
            </strong>
          </div>

          <div className="topbar-actions">
            <div className="level-chip">
              Level{' '}
              {String(
                progress?.level ?? 1
              ).padStart(2, '0')}
            </div>

            <div className="xp-chip">
              {progress?.active_xp ?? 0}
              {' '}
              XP
            </div>
          </div>
        </header>

        <main className="app-content">
          {children}
        </main>
      </section>
    </div>
  )
}
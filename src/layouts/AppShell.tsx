import type { ReactNode } from 'react'

import {
  BookOpen,
  BriefcaseBusiness,
  Gift,
  GraduationCap,
  Home,
  Landmark,
  LogOut,
  MessageCircleMore,
  Settings,
  ShoppingBag,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react'

import {
  NavLink,
  useNavigate,
} from 'react-router-dom'

import { BrandMark } from '../components/BrandMark'
import { useAuth } from '../features/auth/context/AuthContext'
import { useTheme } from '../theme/ThemeContext'
import { themePresets } from '../theme/presets'

interface AppShellProps {
  children: ReactNode
}

const navItems = [
  { to: '/app', label: 'Início', icon: Home, end: true },
  { to: '/app/estudar', label: 'Estudar', icon: BookOpen },
  { to: '/app/arena', label: 'Arena Level', icon: Trophy },
  { to: '/app/carreira', label: 'Carreira', icon: BriefcaseBusiness },
  { to: '/app/concursos', label: 'Concursos', icon: Landmark },
  { to: '/app/comunidade', label: 'Comunidade', icon: MessageCircleMore },
  { to: '/app/recompensas', label: 'Rewards', icon: Gift },
  { to: '/app/store', label: 'Store', icon: ShoppingBag },
]

export function AppShell({
  children,
}: AppShellProps) {
  const navigate = useNavigate()

  const { signOut, user } = useAuth()

  const {
    preset,
    soundEnabled,
    setSoundEnabled,
    playSound,
  } = useTheme()

  const theme = themePresets[preset]

  async function handleLogout() {
    playSound('click')
    await signOut()
    navigate('/login')
  }

  const firstName =
    user?.user_metadata?.first_name ??
    user?.email?.split('@')[0] ??
    'Aluno'

  return (
    <div className="level-app">
      <aside className="sidebar glass">
        <div className="sidebar-brand">
          <BrandMark className="brand-wordmark" />
          <span>ACADEMY</span>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{firstName}</strong>
            <span>{theme.label}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => playSound('click')}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="icon-action"
            onClick={() =>
              setSoundEnabled(!soundEnabled)
            }
          >
            {soundEnabled
              ? <Volume2 size={18} />
              : <VolumeX size={18} />}
            <span>
              {soundEnabled
                ? 'Som ativado'
                : 'Som desligado'}
            </span>
          </button>

          <NavLink
            to="/app/configuracoes"
            className="icon-action"
          >
            <Settings size={18} />
            <span>Configurações</span>
          </NavLink>

          <button
            className="icon-action danger"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <section className="app-main">
        <header className="topbar glass">
          <div>
            <span className="topbar-eyebrow">
              {theme.eyebrow}
            </span>

            <strong>
              Ei, {firstName}! 👋
            </strong>
          </div>

          <div className="topbar-actions">
            <div className="level-chip">
              <GraduationCap size={17} />
              <span>Level 01</span>
            </div>

            <div className="xp-chip">
              <span>120 XP</span>
            </div>
          </div>
        </header>

        <main className="app-content">
          {children}
        </main>
      </section>

      <nav className="mobile-dock glass">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `dock-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}

        <NavLink
          to="/app/configuracoes"
          className={({ isActive }) =>
            `dock-item ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={20} />
          <span>Ajustes</span>
        </NavLink>
      </nav>
    </div>
  )
}
import {
  Bot,
  BriefcaseBusiness,
  Calculator,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
  X,
} from 'lucide-react'

import {
  useState,
} from 'react'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

const mainItems = [
  {
    to: '/app',
    label: 'Inicio',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/app/calculadoras',
    label: 'Calculadoras',
    icon: Calculator,
  },
  {
    to: '/app/casos',
    label: 'Casos',
    icon: BriefcaseBusiness,
  },
  {
    to: '/app/documentos',
    label: 'Documentos',
    icon: FileText,
  },
  {
    to: '/app/ia',
    label: 'LEVEL IA',
    icon: Bot,
    badge: 'BETA',
  },
  {
    to: '/app/chat',
    label: 'Chat interno',
    icon: MessageCircle,
  },
  {
    to: '/app/forum',
    label: 'Forum',
    icon: MessagesSquare,
  },
]

export function AppLayout() {
  const {
    user,
    signOut,
    isAdmin,
  } = useAuth()

  const navigate =
    useNavigate()

  const [open, setOpen] =
    useState(false)

  const displayName =
    user?.user_metadata
      ?.first_name ??
    user?.user_metadata
      ?.display_name ??
    user?.email
      ?.split('@')[0] ??
    'Usuario'

  async function logout() {
    await signOut()

    navigate(
      '/login',
      {
        replace: true,
      }
    )
  }

  return (
    <div className="adv-shell">
      <aside
        className={
          open
            ? 'adv-sidebar open'
            : 'adv-sidebar'
        }
      >
        <div className="adv-brand">
          <strong>LEVEL</strong>
          <span>ADV</span>
        </div>

        <button
          type="button"
          className="mobile-close"
          onClick={() =>
            setOpen(false)
          }
        >
          <X size={20} />
        </button>

        <div className="office-card">
          <span>AMBIENTE</span>
          <strong>
            LEVEL Jurídico
          </strong>
          <small>
            Escritório principal
          </small>
        </div>

        <div className="nav-label">
          NAVEGACAO
        </div>

        <nav>
          {mainItems.map(
            (item) => {
              const Icon =
                item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() =>
                    setOpen(false)
                  }
                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? 'nav-item active'
                      : 'nav-item'
                  }
                >
                  <Icon size={18} />

                  <span>
                    {item.label}
                  </span>

                  {item.badge && (
                    <small>
                      {item.badge}
                    </small>
                  )}
                </NavLink>
              )
            }
          )}

          {isAdmin && (
            <>
              <div className="nav-label second">
                ADMINISTRACAO
              </div>

              <NavLink
                to="/app/admin"
                onClick={() =>
                  setOpen(false)
                }
                className={({
                  isActive,
                }) =>
                  isActive
                    ? 'nav-item active'
                    : 'nav-item'
                }
              >
                <ShieldCheck
                  size={18}
                />

                <span>
                  Painel administrador
                </span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            {displayName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {displayName}
            </strong>

            <span>
              {isAdmin
                ? 'Administrador'
                : 'Advogado'}
            </span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          <LogOut size={17} />
          Sair da LEVEL
        </button>
      </aside>

      <section className="adv-workspace">
        <header className="adv-topbar">
          <button
            className="mobile-menu"
            onClick={() =>
              setOpen(true)
            }
          >
            <Menu size={20} />
          </button>

          <div>
            <span>
              LEVEL ADV
            </span>

            <strong>
              Ambiente jurídico
            </strong>
          </div>

          <div className="topbar-user">
            {user?.email}
          </div>
        </header>

        <main className="adv-content">
          <Outlet />
        </main>
      </section>
    </div>
  )
}
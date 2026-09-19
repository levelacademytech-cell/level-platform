import {
  ArrowLeft,
  BriefcaseBusiness,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageCircleMore,
  Palette,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Trophy,
  Users,
  Landmark,
  Library,
} from 'lucide-react'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { BrandMark } from '../components/BrandMark'
import { useAuth } from '../features/auth/context/AuthContext'
import { useAdmin } from './AdminContext'

const items = [
  {
    to: '/app/controle',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/app/controle/usuarios',
    label: 'Usuarios e acessos',
    icon: Users,
  },
  {
    to: '/app/controle/cursos',
    label: 'Cursos',
    icon: GraduationCap,
  },
  {
    to: '/app/controle/conteudos',
    label: 'Disciplinas e conteudos',
    icon: Library,
  },
  {
    to: '/app/controle/arena',
    label: 'Arena Level',
    icon: Trophy,
  },
  {
    to: '/app/controle/carreira',
    label: 'Carreira e vagas',
    icon: BriefcaseBusiness,
  },
  {
    to: '/app/controle/concursos',
    label: 'Concursos e provas',
    icon: Landmark,
  },
  {
    to: '/app/controle/comunidade',
    label: 'Comunidade',
    icon: MessageCircleMore,
  },
  {
    to: '/app/controle/store',
    label: 'Store e Rewards',
    icon: ShoppingBag,
  },
  {
    to: '/app/controle/comunicacao',
    label: 'Comunicacao',
    icon: Megaphone,
  },
  {
    to: '/app/controle/financeiro',
    label: 'Planos e financeiro',
    icon: CreditCard,
  },
  {
    to: '/app/controle/aparencia',
    label: 'Aparencia',
    icon: Palette,
  },
  {
    to: '/app/controle/configuracoes',
    label: 'Configuracoes',
    icon: Settings,
  },
  {
    to: '/app/controle/auditoria',
    label: 'Auditoria',
    icon: ScrollText,
  },
]

export function DirectorLayout() {
  const navigate = useNavigate()

  const {
    user,
    signOut,
  } = useAuth()

  const { roles } = useAdmin()

  const name =
    user?.user_metadata?.first_name ??
    user?.email?.split('@')[0] ??
    'Diretor'

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
    <div className="director-shell">
      <aside className="director-sidebar">
        <div className="director-brand">
          <BrandMark />

          <div>
            <strong>COMMAND</strong>
            <span>LEVEL ACADEMY</span>
          </div>
        </div>

        <div className="director-profile">
          <div className="director-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{name}</strong>

            <span>
              {roles.join(' / ')}
            </span>
          </div>
        </div>

        <div className="director-menu-label">
          DIRECAO
        </div>

        <nav className="director-nav">
          {items.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({
                  isActive,
                }) =>
                  `director-nav-item ${
                    isActive
                      ? 'active'
                      : ''
                  }`
                }
              >
                <Icon size={18} />

                <span>
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>

        <div className="director-footer">
          <button
            type="button"
            onClick={() =>
              navigate('/app')
            }
          >
            <ArrowLeft size={18} />

            <span>
              Portal do estudante
            </span>
          </button>

          <button
            type="button"
            className="director-logout"
            onClick={logout}
          >
            <LogOut size={18} />

            <span>
              Sair da LEVEL
            </span>
          </button>
        </div>
      </aside>

      <section className="director-workspace">
        <header className="director-topbar">
          <div>
            <span>
              LEVEL COMMAND CENTER
            </span>

            <strong>
              Ambiente administrativo
            </strong>
          </div>

          <div className="director-security">
            <ShieldCheck size={17} />

            <span>
              Acesso autorizado
            </span>
          </div>
        </header>

        <main className="director-content">
          <Outlet />
        </main>
      </section>
    </div>
  )
}
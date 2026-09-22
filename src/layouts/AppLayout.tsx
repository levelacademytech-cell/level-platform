import {
  BriefcaseBusiness,
  Calculator,
  Check,
  FileSignature,
  FileText,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MessagesSquare,
  Palette,
  ShieldCheck,
  X,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  BrandMark,
} from '../components/BrandMark'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'

const mainItems = [
  {
    to: '/app',
    label: 'Início',
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
    to: '/app/gerador-documentos',
    label: 'Gerador de documentos',
    icon: FileSignature,
  },
  {
    to: '/app/chat',
    label: 'Chat interno',
    icon: MessageCircle,
  },
  {
    to: '/app/forum',
    label: 'Fórum',
    icon: MessagesSquare,
  },
]

const presetColors = [
  {
    name: 'Dourado',
    value: '#B58A3A',
  },
  {
    name: 'Azul',
    value: '#315FCE',
  },
  {
    name: 'Vinho',
    value: '#8D3048',
  },
  {
    name: 'Verde',
    value: '#28745B',
  },
  {
    name: 'Roxo',
    value: '#7252B7',
  },
  {
    name: 'Grafite',
    value: '#353C48',
  },
]

export function AppLayout() {
  const {
    user,
    signOut,
    isAdmin,
  } =
    useAuth()

  const navigate =
    useNavigate()

  const location =
    useLocation()

  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false)

  const [
    appearanceOpen,
    setAppearanceOpen,
  ] =
    useState(false)

  const [
    accentColor,
    setAccentColor,
  ] =
    useState(
      '#B58A3A'
    )

  const displayName =
    user?.user_metadata
      ?.first_name ??
    user?.user_metadata
      ?.display_name ??
    user?.email
      ?.split('@')[0] ??
    'Usuário'

  function applyColor(
    color: string
  ) {
    setAccentColor(
      color
    )

    document
      .documentElement
      .style
      .setProperty(
        '--accent',
        color
      )

    document
      .documentElement
      .style
      .setProperty(
        '--gold',
        color
      )
  }

  useEffect(() => {
    if (!user) {
      return
    }

    void supabase
      .from(
        'adv_profiles'
      )
      .select(
        'accent_color'
      )
      .eq(
        'user_id',
        user.id
      )
      .maybeSingle()
      .then(
        ({
          data,
        }) => {
          const color =
            data
              ?.accent_color ??
            '#B58A3A'

          applyColor(
            color
          )
        }
      )
  }, [user?.id])

  useEffect(() => {
    if (!user) {
      return
    }

    const path =
      location.pathname

    void supabase.rpc(
      'adv_touch_presence',
      {
        p_path: path,
      }
    )

    void supabase.rpc(
      'adv_log_activity',
      {
        p_event_type:
          'page_view',

        p_path:
          path,

        p_metadata:
          {},
      }
    )
  }, [
    user?.id,
    location.pathname,
  ])

  useEffect(() => {
    if (!user) {
      return
    }

    const timer =
      window.setInterval(
        () => {
          void supabase.rpc(
            'adv_touch_presence',
            {
              p_path:
                location.pathname,
            }
          )
        },
        60000
      )

    return () =>
      window.clearInterval(
        timer
      )
  }, [
    user?.id,
    location.pathname,
  ])

  async function saveColor(
    color: string
  ) {
    if (!user) {
      return
    }

    applyColor(
      color
    )

    await supabase
      .from(
        'adv_profiles'
      )
      .upsert({
        user_id:
          user.id,

        accent_color:
          color,
      })

    setAppearanceOpen(
      false
    )
  }

  async function logout() {
    await supabase.rpc(
      'adv_log_activity',
      {
        p_event_type:
          'logout',

        p_path:
          location.pathname,

        p_metadata:
          {},
      }
    )

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
          mobileOpen
            ? 'adv-sidebar open'
            : 'adv-sidebar'
        }
      >
        <BrandMark />

        <button
          type="button"
          className="mobile-close"
          onClick={() =>
            setMobileOpen(
              false
            )
          }
        >
          <X size={20} />
        </button>

        <div className="office-card">
          <span>
            AMBIENTE
          </span>

          <strong>
            LEVEL Jurídico
          </strong>

          <small>
            Escritório principal
          </small>
        </div>

        <div className="nav-label">
          NAVEGAÇÃO
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
                    setMobileOpen(
                      false
                    )
                  }
                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? 'nav-item active'
                      : 'nav-item'
                  }
                >
                  <Icon
                    size={18}
                  />

                  <span>
                    {item.label}
                  </span>
                </NavLink>
              )
            }
          )}

          {isAdmin && (
            <>
              <div className="nav-label second">
                ADMINISTRAÇÃO
              </div>

              <NavLink
                to="/app/admin"
                end
                onClick={() =>
                  setMobileOpen(
                    false
                  )
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

              <NavLink
                to="/app/admin/banners"
                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }
                className={({
                  isActive,
                }) =>
                  isActive
                    ? 'nav-item active'
                    : 'nav-item'
                }
              >
                <ImagePlus
                  size={18}
                />

                <span>
                  Banners e marca
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
          onClick={
            logout
          }
        >
          <LogOut
            size={17}
          />

          Sair da LEVEL
        </button>
      </aside>

      <section className="adv-workspace">
        <header className="adv-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() =>
                setMobileOpen(
                  true
                )
              }
            >
              <Menu
                size={20}
              />
            </button>

            <div>
              <span>
                LEVEL ADV
              </span>

              <strong>
                Ambiente jurídico
              </strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="appearance-control">
              <button
                type="button"
                className="appearance-button"
                onClick={() =>
                  setAppearanceOpen(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                title="Personalizar aparência"
              >
                <Palette
                  size={18}
                />

                <span
                  className="accent-preview"
                  style={{
                    background:
                      accentColor,
                  }}
                />
              </button>

              {appearanceOpen && (
                <div className="appearance-popover">
                  <div className="appearance-title">
                    <div>
                      <span>
                        APARÊNCIA
                      </span>

                      <strong>
                        Cor da sua LEVEL
                      </strong>
                    </div>

                    <Palette
                      size={20}
                    />
                  </div>

                  <p>
                    Escolha a cor dos botões,
                    ícones e detalhes da sua
                    plataforma.
                  </p>

                  <div className="preset-colors">
                    {presetColors.map(
                      (
                        color
                      ) => (
                        <button
                          key={
                            color.value
                          }
                          type="button"
                          className={
                            accentColor ===
                            color.value
                              ? 'color-option selected'
                              : 'color-option'
                          }
                          onClick={() =>
                            void saveColor(
                              color.value
                            )
                          }
                        >
                          <span
                            style={{
                              background:
                                color.value,
                            }}
                          />

                          <strong>
                            {color.name}
                          </strong>

                          {accentColor ===
                            color.value && (
                            <Check
                              size={14}
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>

                  <label className="custom-color">
                    Cor personalizada

                    <div>
                      <input
                        type="color"
                        value={
                          accentColor
                        }
                        onChange={(
                          event
                        ) =>
                          applyColor(
                            event
                              .target
                              .value
                          )
                        }
                      />

                      <input
                        value={
                          accentColor
                        }
                        onChange={(
                          event
                        ) => {
                          const color =
                            event
                              .target
                              .value

                          if (
                            /^#[0-9A-Fa-f]{6}$/.test(
                              color
                            )
                          ) {
                            applyColor(
                              color
                            )
                          } else {
                            setAccentColor(
                              color
                            )
                          }
                        }}
                      />
                    </div>
                  </label>

                  <button
                    type="button"
                    className="primary-button appearance-save"
                    onClick={() => {
                      if (
                        /^#[0-9A-Fa-f]{6}$/.test(
                          accentColor
                        )
                      ) {
                        void saveColor(
                          accentColor
                        )
                      }
                    }}
                  >
                    Salvar minha cor
                  </button>
                </div>
              )}
            </div>

            <div className="topbar-user">
              {user?.email}
            </div>
          </div>
        </header>

        <main className="adv-content">
          <Outlet />
        </main>
      </section>
    </div>
  )
}

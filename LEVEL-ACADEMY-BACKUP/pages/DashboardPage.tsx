import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Flame,
  Gift,
  Landmark,
  MessageCircleMore,
  ShoppingBag,
  Sparkles,
  Trophy,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/context/AuthContext'
import { useTheme } from '../theme/ThemeContext'
import { themePresets } from '../theme/presets'

const modules = [
  {
    title: 'Continuar estudando',
    description:
      'Retome suas trilhas, conteúdos e atividades.',
    icon: BookOpen,
    path: '/app/estudar',
    className: 'blue',
  },
  {
    title: 'Arena Level',
    description:
      'Jogue, aprenda, ganhe XP e suba no ranking.',
    icon: Trophy,
    path: '/app/arena',
    className: 'purple',
  },
  {
    title: 'Carreira',
    description:
      'Currículo, vagas, estágios e oportunidades.',
    icon: BriefcaseBusiness,
    path: '/app/carreira',
    className: 'cyan',
  },
  {
    title: 'Concursos & Provas',
    description:
      'Preparatórios, inscrições e simulados.',
    icon: Landmark,
    path: '/app/concursos',
    className: 'gold',
  },
  {
    title: 'Comunidade',
    description:
      'Converse, compartilhe e aprenda em grupo.',
    icon: MessageCircleMore,
    path: '/app/comunidade',
    className: 'pink',
  },
  {
    title: 'LEVEL Rewards',
    description:
      'Troque moedas por benefícios e experiências.',
    icon: Gift,
    path: '/app/recompensas',
    className: 'green',
  },
  {
    title: 'LEVEL Store',
    description:
      'Produtos, livros, materiais e itens da marca.',
    icon: ShoppingBag,
    path: '/app/store',
    className: 'orange',
  },
]

export function DashboardPage() {
  const { user } = useAuth()

  const {
    preset,
    promosEnabled,
    playSound,
  } = useTheme()

  const theme = themePresets[preset]

  const firstName =
    user?.user_metadata?.first_name ??
    'Aluno'

  return (
    <div className="dashboard page-enter">
      <section className="hero-card glass">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            {theme.eyebrow}
          </span>

          <h1>{theme.heroTitle}</h1>

          <p>
            {theme.heroSubtitle}
          </p>

          <div className="hero-actions">
            <Link
              className="primary-button"
              to="/app/estudar"
              onClick={() => playSound('click')}
            >
              Continuar estudando
              <ArrowRight size={18} />
            </Link>

            <Link
              className="secondary-button"
              to="/app/arena"
              onClick={() => playSound('click')}
            >
              <Trophy size={18} />
              Arena Level
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-3d-object">
            <span>{theme.emoji}</span>

            <div className="hero-ring ring-a" />
            <div className="hero-ring ring-b" />
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <span>XP</span>
            <strong>120</strong>
          </div>

          <small>+40 esta semana</small>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon">
            <Flame size={20} />
          </div>

          <div>
            <span>Sequência</span>
            <strong>3 dias</strong>
          </div>

          <small>Continue assim 🔥</small>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon">
            <Trophy size={20} />
          </div>

          <div>
            <span>Ranking</span>
            <strong>#38</strong>
          </div>

          <small>Ranking semanal</small>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <span>Atividades</span>
            <strong>4</strong>
          </div>

          <small>Pendentes esta semana</small>
        </div>
      </section>

      {promosEnabled && (
        <section className="announcement glass">
          <div>
            <span className="new-pill">NOVO</span>

            <strong>
              Ei, {firstName}! O desafio diário
              já está disponível.
            </strong>

            <p>
              Cinco perguntas rápidas podem render
              XP e Level Coins.
            </p>
          </div>

          <Link
            to="/app/arena"
            className="secondary-button"
          >
            Jogar agora
          </Link>
        </section>
      )}

      <div className="section-heading">
        <div>
          <span>SEU ECOSSISTEMA</span>
          <h2>O que vamos fazer hoje?</h2>
        </div>
      </div>

      <section className="module-grid">
        {modules.map((module) => {
          const Icon = module.icon

          return (
            <Link
              key={module.title}
              to={module.path}
              className={
                `module-card glass ${module.className}`
              }
              onClick={() => playSound('click')}
            >
              <div className="module-icon">
                <Icon size={24} />
              </div>

              <div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>

              <ArrowRight
                className="module-arrow"
                size={20}
              />
            </Link>
          )
        })}
      </section>

      <section className="progress-panel glass">
        <div className="section-heading compact">
          <div>
            <span>MINHA EVOLUÇÃO</span>
            <h2>Seu progresso nesta semana</h2>
          </div>

          <strong>68%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: '68%' }}
          />
        </div>

        <div className="progress-labels">
          <span>4 atividades concluídas</span>
          <span>2 faltando</span>
        </div>
      </section>
    </div>
  )
}
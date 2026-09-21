import {
  ArrowRight,
  Construction,
  Sparkles,
} from 'lucide-react'

import { useTheme } from '../theme/ThemeContext'

interface ModulePageProps {
  eyebrow: string
  title: string
  description: string
}

export function ModulePage({
  eyebrow,
  title,
  description,
}: ModulePageProps) {
  const { playSound } = useTheme()

  return (
    <div className="page-enter">
      <section className="module-hero glass">
        <div>
          <span className="hero-eyebrow">
            {eyebrow}
          </span>

          <h1>{title}</h1>

          <p>{description}</p>

          <button
            className="secondary-button"
            onClick={() => playSound('click')}
          >
            <Sparkles size={18} />
            Explorar
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="construction-object">
          <Construction size={54} />
        </div>
      </section>

      <section className="placeholder-grid">
        <div className="placeholder-card glass">
          <span>01</span>
          <h3>Estrutura pronta</h3>
          <p>
            Este módulo já faz parte da navegação
            oficial da LEVEL.
          </p>
        </div>

        <div className="placeholder-card glass">
          <span>02</span>
          <h3>Conteúdo dinâmico</h3>
          <p>
            Na próxima fase, os cards serão alimentados
            diretamente pelo painel administrativo.
          </p>
        </div>

        <div className="placeholder-card glass">
          <span>03</span>
          <h3>Personalização</h3>
          <p>
            Cores, banners e componentes acompanharão
            o tema escolhido.
          </p>
        </div>
      </section>
    </div>
  )
}
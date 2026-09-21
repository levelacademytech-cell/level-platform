import {
  Image,
  Moon,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { useCourses } from '../courses/CourseContext'
import { useTheme } from '../theme/ThemeContext'

export function SettingsPage() {
  const {
    activeCourse,
  } = useCourses()

  const {
    mode,
    setMode,

    soundEnabled,
    setSoundEnabled,

    motionEnabled,
    setMotionEnabled,

    promosEnabled,
    setPromosEnabled,

    customBackground,
    setCustomBackground,

    backgroundOpacity,
    setBackgroundOpacity,

    glassBlur,
    setGlassBlur,
  } = useTheme()

  return (
    <div className="settings-page page-enter">
      <section className="settings-header">
        <span>CONFIGURAÇÕES</span>

        <h1>
          Sua experiência.
          Suas preferências.
        </h1>

        <p>
          As cores principais são definidas
          automaticamente pelo seu curso atual.
          Para mudar de área, use Meus Cursos.
        </p>
      </section>

      <section className="course-identity-panel">
        <div>
          <span>IDENTIDADE ATUAL</span>

          <h2>
            {activeCourse?.icon_emoji}
            {' '}
            {activeCourse?.name ??
              'LEVEL Academy'}
          </h2>

          <p>
            A navegação, destaques e elementos
            visuais acompanham este curso.
          </p>
        </div>

        <a
          href="/app/cursos"
          className="secondary-button"
        >
          Meus Cursos
        </a>
      </section>

      <section className="settings-grid">
        <article className="settings-card">
          <div className="settings-title">
            {mode === 'dark'
              ? <Moon size={20} />
              : <Sun size={20} />}

            <div>
              <h2>Modo da interface</h2>

              <p>
                Claro ou escuro sem alterar
                a identidade do curso.
              </p>
            </div>
          </div>

          <div className="segmented-control">
            <button
              className={
                mode === 'dark'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setMode('dark')
              }
            >
              <Moon size={17} />
              Escuro
            </button>

            <button
              className={
                mode === 'light'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setMode('light')
              }
            >
              <Sun size={17} />
              Claro
            </button>
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-title">
            {soundEnabled
              ? <Volume2 size={20} />
              : <VolumeX size={20} />}

            <div>
              <h2>Sons</h2>

              <p>
                Feedback sonoro de ações,
                conquistas e Arena.
              </p>
            </div>
          </div>

          <label className="toggle-row">
            <span>
              {soundEnabled
                ? 'Ativados'
                : 'Desativados'}
            </span>

            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) =>
                setSoundEnabled(
                  event.target.checked
                )
              }
            />
          </label>
        </article>

        <article className="settings-card">
          <div className="settings-title">
            <Sparkles size={20} />

            <div>
              <h2>Movimento</h2>

              <p>
                Controle animações e
                profundidade da interface.
              </p>
            </div>
          </div>

          <label className="toggle-row">
            <span>
              {motionEnabled
                ? 'Animações completas'
                : 'Movimento reduzido'}
            </span>

            <input
              type="checkbox"
              checked={motionEnabled}
              onChange={(event) =>
                setMotionEnabled(
                  event.target.checked
                )
              }
            />
          </label>
        </article>

        <article className="settings-card">
          <div className="settings-title">
            <Sparkles size={20} />

            <div>
              <h2>Destaques</h2>

              <p>
                Avisos, novidades e campanhas.
              </p>
            </div>
          </div>

          <label className="toggle-row">
            <span>
              {promosEnabled
                ? 'Visíveis'
                : 'Ocultos'}
            </span>

            <input
              type="checkbox"
              checked={promosEnabled}
              onChange={(event) =>
                setPromosEnabled(
                  event.target.checked
                )
              }
            />
          </label>
        </article>

        <article className="settings-card settings-card-wide">
          <div className="settings-title">
            <Image size={20} />

            <div>
              <h2>Fundo personalizado</h2>

              <p>
                Recurso experimental do seu perfil.
              </p>
            </div>
          </div>

          <input
            className="settings-input"
            placeholder="https://..."
            value={customBackground}
            onChange={(event) =>
              setCustomBackground(
                event.target.value
              )
            }
          />

          <div className="slider-row">
            <label>
              Intensidade do fundo

              <strong>
                {backgroundOpacity}%
              </strong>
            </label>

            <input
              type="range"
              min="0"
              max="55"
              value={backgroundOpacity}
              onChange={(event) =>
                setBackgroundOpacity(
                  Number(
                    event.target.value
                  )
                )
              }
            />
          </div>

          <div className="slider-row">
            <label>
              Desfoque de interface

              <strong>
                {glassBlur}px
              </strong>
            </label>

            <input
              type="range"
              min="0"
              max="28"
              value={glassBlur}
              onChange={(event) =>
                setGlassBlur(
                  Number(
                    event.target.value
                  )
                )
              }
            />
          </div>
        </article>
      </section>
    </div>
  )
}
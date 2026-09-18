import {
  Moon,
  Palette,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { useTheme } from '../theme/ThemeContext'

import {
  themePresetList,
  type ThemePresetId,
} from '../theme/presets'

export function SettingsPage() {
  const {
    preset,
    setPreset,
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
    playSound,
  } = useTheme()

  return (
    <div className="settings-page page-enter">
      <section className="settings-header">
        <span>PERSONALIZAÇÃO</span>
        <h1>Deixe a LEVEL com a sua cara.</h1>
        <p>
          Essas configurações já funcionam no seu perfil.
          Depois, a mesma tecnologia será controlada
          globalmente pelo painel administrativo.
        </p>
      </section>

      <section className="settings-grid">
        <article className="settings-card glass">
          <div className="settings-title">
            <Palette size={20} />

            <div>
              <h2>Tema da experiência</h2>
              <p>
                Mude a atmosfera visual de toda a plataforma.
              </p>
            </div>
          </div>

          <div className="mini-theme-grid">
            {themePresetList.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setPreset(theme.id as ThemePresetId)
                  playSound('click')
                }}
                className={
                  `mini-theme ${
                    preset === theme.id
                      ? 'selected'
                      : ''
                  }`
                }
              >
                <span
                  style={{
                    background: theme.heroGradient,
                  }}
                >
                  {theme.emoji}
                </span>

                {theme.label}
              </button>
            ))}
          </div>
        </article>

        <article className="settings-card glass">
          <div className="settings-title">
            {mode === 'dark'
              ? <Moon size={20} />
              : <Sun size={20} />}

            <div>
              <h2>Modo de visualização</h2>
              <p>
                Alterne entre claro e escuro.
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
              onClick={() => setMode('dark')}
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
              onClick={() => setMode('light')}
            >
              <Sun size={17} />
              Claro
            </button>
          </div>
        </article>

        <article className="settings-card glass">
          <div className="settings-title">
            {soundEnabled
              ? <Volume2 size={20} />
              : <VolumeX size={20} />}

            <div>
              <h2>Sons da interface</h2>
              <p>
                Feedback de ações, conquistas e level up.
              </p>
            </div>
          </div>

          <label className="toggle-row">
            <span>
              {soundEnabled
                ? 'Sons ativados'
                : 'Sons desativados'}
            </span>

            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) =>
                setSoundEnabled(event.target.checked)
              }
            />
          </label>
        </article>

        <article className="settings-card glass">
          <div className="settings-title">
            <Sparkles size={20} />

            <div>
              <h2>Animações e movimento</h2>
              <p>
                Permite reduzir efeitos se preferir.
              </p>
            </div>
          </div>

          <label className="toggle-row">
            <span>
              {motionEnabled
                ? 'Movimento ativado'
                : 'Movimento reduzido'}
            </span>

            <input
              type="checkbox"
              checked={motionEnabled}
              onChange={(event) =>
                setMotionEnabled(event.target.checked)
              }
            />
          </label>
        </article>

        <article className="settings-card glass wide">
          <div className="settings-title">
            <Palette size={20} />

            <div>
              <h2>Imagem de fundo</h2>
              <p>
                Cole uma URL de imagem para testar
                fundos personalizados.
              </p>
            </div>
          </div>

          <input
            className="settings-input"
            placeholder="https://..."
            value={customBackground}
            onChange={(event) =>
              setCustomBackground(event.target.value)
            }
          />

          <div className="slider-row">
            <label>
              Transparência da imagem
              <strong>{backgroundOpacity}%</strong>
            </label>

            <input
              type="range"
              min="0"
              max="70"
              value={backgroundOpacity}
              onChange={(event) =>
                setBackgroundOpacity(
                  Number(event.target.value)
                )
              }
            />
          </div>

          <div className="slider-row">
            <label>
              Intensidade do vidro
              <strong>{glassBlur}px</strong>
            </label>

            <input
              type="range"
              min="4"
              max="40"
              value={glassBlur}
              onChange={(event) =>
                setGlassBlur(
                  Number(event.target.value)
                )
              }
            />
          </div>
        </article>

        <article className="settings-card glass">
          <div className="settings-title">
            <Sparkles size={20} />

            <div>
              <h2>Banners e destaques</h2>
              <p>
                Controle comunicados promocionais.
              </p>
            </div>
          </div>

          <label className="toggle-row">
            <span>
              {promosEnabled
                ? 'Destaques visíveis'
                : 'Destaques ocultos'}
            </span>

            <input
              type="checkbox"
              checked={promosEnabled}
              onChange={(event) =>
                setPromosEnabled(event.target.checked)
              }
            />
          </label>
        </article>
      </section>
    </div>
  )
}
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  themePresets,
  type ThemePresetId,
} from './presets'

type ColorMode = 'dark' | 'light'
type SoundName = 'click' | 'success' | 'level'

interface ThemeContextValue {
  preset: ThemePresetId
  setPreset: (value: ThemePresetId) => void

  mode: ColorMode
  setMode: (value: ColorMode) => void

  soundEnabled: boolean
  setSoundEnabled: (value: boolean) => void

  motionEnabled: boolean
  setMotionEnabled: (value: boolean) => void

  promosEnabled: boolean
  setPromosEnabled: (value: boolean) => void

  customBackground: string
  setCustomBackground: (value: string) => void

  backgroundOpacity: number
  setBackgroundOpacity: (value: number) => void

  glassBlur: number
  setGlassBlur: (value: number) => void

  playSound: (sound: SoundName) => void
}

const ThemeContext =
  createContext<ThemeContextValue | undefined>(undefined)

function readStorage() {
  if (typeof window === 'undefined') return null

  try {
    const saved = localStorage.getItem('level-ui-preferences')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode
}) {
  const saved = readStorage()

  const [preset, setPreset] =
    useState<ThemePresetId>(saved?.preset ?? 'level')

  const [mode, setMode] =
    useState<ColorMode>(saved?.mode ?? 'dark')

  const [soundEnabled, setSoundEnabled] =
    useState(saved?.soundEnabled ?? true)

  const [motionEnabled, setMotionEnabled] =
    useState(saved?.motionEnabled ?? true)

  const [promosEnabled, setPromosEnabled] =
    useState(saved?.promosEnabled ?? true)

  const [customBackground, setCustomBackground] =
    useState(saved?.customBackground ?? '')

  const [backgroundOpacity, setBackgroundOpacity] =
    useState(saved?.backgroundOpacity ?? 18)

  const [glassBlur, setGlassBlur] =
    useState(saved?.glassBlur ?? 22)

  useEffect(() => {
    const theme = themePresets[preset]
    const root = document.documentElement
    const isDark = mode === 'dark'

    root.dataset.mode = mode

    root.style.setProperty('--accent', theme.accent)
    root.style.setProperty('--accent-2', theme.accent2)

    root.style.setProperty(
      '--app-bg',
      isDark ? theme.bg : '#eef3fb'
    )

    root.style.setProperty(
      '--surface',
      isDark
        ? theme.panel
        : 'rgba(255,255,255,.76)'
    )

    root.style.setProperty(
      '--surface-solid',
      isDark ? '#111a2d' : '#ffffff'
    )

    root.style.setProperty(
      '--border',
      isDark
        ? theme.border
        : 'rgba(24,42,72,.11)'
    )

    root.style.setProperty(
      '--text',
      isDark ? theme.text : '#101828'
    )

    root.style.setProperty(
      '--muted',
      isDark ? theme.muted : '#667085'
    )

    root.style.setProperty(
      '--hero-gradient',
      theme.heroGradient
    )

    root.style.setProperty(
      '--glass-blur',
      `${glassBlur}px`
    )

    root.style.setProperty(
      '--user-bg-opacity',
      String(backgroundOpacity / 100)
    )

    const safeUrl =
      customBackground.trim().replace(/"/g, '%22')

    root.style.setProperty(
      '--user-bg-image',
      safeUrl
        ? `url("${safeUrl}")`
        : 'none'
    )

    root.classList.toggle(
      'reduce-motion',
      !motionEnabled
    )

    localStorage.setItem(
      'level-ui-preferences',
      JSON.stringify({
        preset,
        mode,
        soundEnabled,
        motionEnabled,
        promosEnabled,
        customBackground,
        backgroundOpacity,
        glassBlur,
      })
    )
  }, [
    preset,
    mode,
    soundEnabled,
    motionEnabled,
    promosEnabled,
    customBackground,
    backgroundOpacity,
    glassBlur,
  ])

  function playSound(sound: SoundName) {
    if (!soundEnabled) return

    try {
      const WindowAudio = window as typeof window & {
        webkitAudioContext?: typeof AudioContext
      }

      const AudioCtx =
        window.AudioContext ??
        WindowAudio.webkitAudioContext

      if (!AudioCtx) return

      const context = new AudioCtx()
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      const frequencies = {
        click: 390,
        success: 660,
        level: 920,
      }

      oscillator.frequency.value = frequencies[sound]
      oscillator.type = sound === 'level'
        ? 'triangle'
        : 'sine'

      gain.gain.setValueAtTime(
        0.0001,
        context.currentTime
      )

      gain.gain.exponentialRampToValueAtTime(
        sound === 'click' ? 0.025 : 0.05,
        context.currentTime + 0.01
      )

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 0.18
      )

      oscillator.connect(gain)
      gain.connect(context.destination)

      oscillator.start()
      oscillator.stop(context.currentTime + 0.2)

      setTimeout(() => {
        context.close().catch(() => undefined)
      }, 300)
    } catch {
      // Som é um recurso opcional.
    }
  }

  return (
    <ThemeContext.Provider
      value={{
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
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error(
      'useTheme precisa estar dentro de ThemeProvider'
    )
  }

  return context
}
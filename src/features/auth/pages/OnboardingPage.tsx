import { useState } from 'react'

import {
  ArrowRight,
  Check,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import { BrandMark } from '../../../components/BrandMark'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { useTheme } from '../../../theme/ThemeContext'

import {
  themePresetList,
  type ThemePresetId,
} from '../../../theme/presets'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const {
    preset,
    setPreset,
    playSound,
  } = useTheme()

  const [selected, setSelected] =
    useState<ThemePresetId>(preset)

  const [saving, setSaving] = useState(false)

  async function finish() {
    if (!user) return

    setSaving(true)

    setPreset(selected)

    await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
      })
      .eq('id', user.id)

    localStorage.setItem(
      'level-onboarding-complete',
      'true'
    )

    playSound('level')

    setSaving(false)
    navigate('/app')
  }

  return (
    <main className="onboarding-page">
      <div className="onboarding-card glass">
        <BrandMark className="onboarding-logo" />

        <span className="auth-kicker">
          PERSONALIZE SUA EXPERIÊNCIA
        </span>

        <h1>
          O que mais combina com você agora?
        </h1>

        <p>
          Isso muda cores, atmosfera, banners
          e alguns destaques da sua LEVEL.
        </p>

        <div className="theme-selector-grid">
          {themePresetList.map((theme) => (
            <button
              key={theme.id}
              className={
                `theme-choice ${
                  selected === theme.id
                    ? 'selected'
                    : ''
                }`
              }
              onClick={() => {
                setSelected(theme.id)
                setPreset(theme.id)
                playSound('click')
              }}
            >
              <span
                className="theme-preview"
                style={{
                  background: theme.heroGradient,
                }}
              >
                <span>{theme.emoji}</span>
              </span>

              <strong>{theme.label}</strong>

              {selected === theme.id && (
                <Check
                  size={17}
                  className="choice-check"
                />
              )}
            </button>
          ))}
        </div>

        <button
          className="primary-button onboarding-action"
          onClick={finish}
          disabled={saving}
        >
          <span>
            {saving
              ? 'Preparando sua LEVEL...'
              : 'Entrar na LEVEL'}
          </span>

          <ArrowRight size={18} />
        </button>
      </div>
    </main>
  )
}
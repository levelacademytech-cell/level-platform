import { useState } from 'react'
import {
  ArrowRight,
  Check,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import { BrandMark } from '../../../components/BrandMark'
import { useCourses } from '../../../courses/CourseContext'
import { themePresets } from '../../../theme/presets'

export function OnboardingPage() {
  const navigate = useNavigate()

  const {
    courses,
    enrollAndActivate,
  } = useCourses()

  const [selected, setSelected] =
    useState<string | null>(null)

  const [saving, setSaving] =
    useState(false)

  async function finish() {
    if (!selected) return

    setSaving(true)

    await enrollAndActivate(selected)

    setSaving(false)

    navigate('/app')
  }

  return (
    <main className="onboarding-page">
      <div className="onboarding-card glass">
        <BrandMark className="onboarding-logo" />

        <span className="auth-kicker">
          VAMOS PERSONALIZAR SUA LEVEL
        </span>

        <h1>
          O que você vai estudar?
        </h1>

        <p>
          Escolha seu primeiro curso.
          A experiência, as cores e os conteúdos
          serão ajustados automaticamente.
        </p>

        <div className="theme-selector-grid">
          {courses.map((course) => {
            const visual =
              themePresets[
                course.theme_key
              ] ?? themePresets.level

            return (
              <button
                key={course.id}
                className={
                  `theme-choice ${
                    selected === course.id
                      ? 'selected'
                      : ''
                  }`
                }
                onClick={() =>
                  setSelected(course.id)
                }
              >
                <span
                  className="theme-preview"
                  style={{
                    background:
                      visual.heroGradient,
                  }}
                >
                  <span>
                    {course.icon_emoji ?? '🎓'}
                  </span>
                </span>

                <strong>
                  {course.name}
                </strong>

                <small>
                  {course.description}
                </small>

                {selected === course.id && (
                  <Check
                    size={17}
                    className="choice-check"
                  />
                )}
              </button>
            )
          })}
        </div>

        <button
          className="primary-button onboarding-action"
          onClick={finish}
          disabled={!selected || saving}
        >
          {saving
            ? 'Preparando sua LEVEL...'
            : 'Começar'}

          <ArrowRight size={18} />
        </button>
      </div>
    </main>
  )
}

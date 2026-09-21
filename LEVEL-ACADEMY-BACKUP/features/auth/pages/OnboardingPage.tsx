import {
  useState,
} from 'react'

import {
  ArrowRight,
  Check,
} from 'lucide-react'

import {
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { BrandMark } from '../../../components/BrandMark'

import {
  useCourses,
} from '../../../courses/CourseContext'

import {
  themePresets,
} from '../../../theme/presets'

export function OnboardingPage() {
  const navigate = useNavigate()

  const {
    courses,
    activeCourse,
    loading,
    enrollAndActivate,
  } = useCourses()

  const [selected, setSelected] =
    useState<string | null>(null)

  const [saving, setSaving] =
    useState(false)

  if (loading) {
    return (
      <main className="onboarding-page">
        <div className="level-loading-mark">
          <BrandMark compact />
          <span>Preparando sua LEVEL...</span>
        </div>
      </main>
    )
  }

  if (activeCourse) {
    return (
      <Navigate
        to="/app"
        replace
      />
    )
  }

  async function finish() {
    if (!selected) return

    setSaving(true)

    try {
      await enrollAndActivate(selected)

      navigate('/app', {
        replace: true,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="onboarding-page course-onboarding">
      <section className="course-onboarding-header">
        <BrandMark className="onboarding-logo" />

        <span className="auth-kicker">
          PRIMEIRO ACESSO
        </span>

        <h1>
          Qual caminho você quer começar?
        </h1>

        <p>
          Escolha seu primeiro curso.
          A identidade da LEVEL será criada
          automaticamente para essa área.
        </p>
      </section>

      <section className="course-picker-grid">
        {courses.map((course) => {
          const visual =
            themePresets[
              course.theme_key
            ] ?? themePresets.level

          const isSelected =
            selected === course.id

          return (
            <button
              key={course.id}
              className={
                `course-picker-card ${
                  isSelected
                    ? 'selected'
                    : ''
                }`
              }
              onClick={() =>
                setSelected(course.id)
              }
            >
              <div
                className="course-picker-stripe"
                style={{
                  background:
                    visual.heroGradient,
                }}
              />

              <div className="course-picker-number">
                {String(
                  courses.indexOf(course) + 1
                ).padStart(2, '0')}
              </div>

              <div className="course-picker-icon">
                {course.icon_emoji ?? '🎓'}
              </div>

              <div className="course-picker-copy">
                <strong>
                  {course.name}
                </strong>

                <p>
                  {course.description}
                </p>
              </div>

              {isSelected && (
                <div className="course-picker-check">
                  <Check size={17} />
                </div>
              )}
            </button>
          )
        })}
      </section>

      <button
        className="primary-button onboarding-action"
        onClick={finish}
        disabled={!selected || saving}
      >
        <span>
          {saving
            ? 'Criando seu ambiente...'
            : 'Começar neste curso'}
        </span>

        <ArrowRight size={18} />
      </button>
    </main>
  )
}
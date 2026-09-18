import {
  CheckCircle2,
  Plus,
  Repeat2,
} from 'lucide-react'

import {
  useState,
} from 'react'

import { useCourses } from '../courses/CourseContext'
import { themePresets } from '../theme/presets'

export function CoursesPage() {
  const {
    courses,
    linkedCourses,
    activeCourse,
    enrollAndActivate,
    activateCourse,
  } = useCourses()

  const [busy, setBusy] =
    useState<string | null>(null)

  async function activate(
    courseId: string
  ) {
    setBusy(courseId)

    await activateCourse(courseId)

    setBusy(null)
  }

  async function add(
    courseId: string
  ) {
    setBusy(courseId)

    await enrollAndActivate(courseId)

    setBusy(null)
  }

  const linkedIds =
    linkedCourses.map(
      (course) => course.id
    )

  const available =
    courses.filter(
      (course) =>
        !linkedIds.includes(course.id)
    )

  return (
    <div className="page-enter">
      <section className="settings-header">
        <span>MEUS CURSOS</span>

        <h1>
          Sua LEVEL pode ter mais de um caminho.
        </h1>

        <p>
          Troque de curso quando quiser.
          O dashboard muda automaticamente para
          acompanhar a área que você está estudando.
        </p>
      </section>

      <div className="section-heading">
        <div>
          <span>CURSOS VINCULADOS</span>
          <h2>
            Você possui {linkedCourses.length}
            {' '}
            {linkedCourses.length === 1
              ? 'curso'
              : 'cursos'}
          </h2>
        </div>
      </div>

      <section className="module-grid">
        {linkedCourses.map((course) => {
          const visual =
            themePresets[
              course.theme_key
            ] ?? themePresets.level

          const active =
            activeCourse?.id === course.id

          return (
            <article
              key={course.id}
              className="module-card glass"
            >
              <div
                className="module-icon"
                style={{
                  background:
                    visual.heroGradient,
                }}
              >
                <span>
                  {course.icon_emoji}
                </span>
              </div>

              <div>
                <h3>
                  {course.name}
                </h3>

                <p>
                  {course.description}
                </p>
              </div>

              {active ? (
                <button
                  className="secondary-button"
                  disabled
                >
                  <CheckCircle2 size={17} />
                  Curso atual
                </button>
              ) : (
                <button
                  className="secondary-button"
                  onClick={() =>
                    activate(course.id)
                  }
                  disabled={
                    busy === course.id
                  }
                >
                  <Repeat2 size={17} />
                  Mudar para este curso
                </button>
              )}
            </article>
          )
        })}
      </section>

      {available.length > 0 && (
        <>
          <div className="section-heading">
            <div>
              <span>NOVOS CAMINHOS</span>
              <h2>
                Vincular outro curso
              </h2>
            </div>
          </div>

          <section className="module-grid">
            {available.map((course) => {
              const visual =
                themePresets[
                  course.theme_key
                ] ?? themePresets.level

              return (
                <article
                  key={course.id}
                  className="module-card glass"
                >
                  <div
                    className="module-icon"
                    style={{
                      background:
                        visual.heroGradient,
                    }}
                  >
                    <span>
                      {course.icon_emoji}
                    </span>
                  </div>

                  <div>
                    <h3>
                      {course.name}
                    </h3>

                    <p>
                      {course.description}
                    </p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      add(course.id)
                    }
                    disabled={
                      busy === course.id
                    }
                  >
                    <Plus size={17} />
                    Vincular curso
                  </button>
                </article>
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}

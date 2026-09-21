import {
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import { supabase } from '../../lib/supabase'

interface CourseRow {
  id: string
  name: string
  slug: string
  audience_segment: string
  theme_key: string
  is_active: boolean
  is_public: boolean
}

export function AdminCoursesPage() {
  const [rows, setRows] =
    useState<CourseRow[]>([])

  const [message, setMessage] =
    useState('')

  async function load() {
    const { data, error } =
      await supabase
        .from('courses')
        .select(`
          id,
          name,
          slug,
          audience_segment,
          theme_key,
          is_active,
          is_public
        `)
        .order('name')

    if (error) {
      setMessage(error.message)
      return
    }

    setRows(
      (data ?? []) as CourseRow[]
    )
  }

  async function toggle(
    row: CourseRow
  ) {
    const { error } =
      await supabase
        .from('courses')
        .update({
          is_active:
            !row.is_active,
        })
        .eq('id', row.id)

    if (error) {
      setMessage(error.message)
      return
    }

    await load()
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="director-page">
      <div className="director-page-heading row">
        <div>
          <span>ACADEMICO</span>

          <h1>
            Gestao de cursos
          </h1>

          <p>
            Ative, oculte e acompanhe os
            cursos disponiveis.
          </p>
        </div>

        <button
          className="director-button"
          onClick={() => void load()}
        >
          <RefreshCw size={17} />
          Atualizar
        </button>
      </div>

      {message && (
        <div className="director-alert">
          {message}
        </div>
      )}

      <section className="director-cards">
        {rows.map((row) => (
          <article
            className="director-course-card"
            key={row.id}
          >
            <div>
              <span>
                {row.audience_segment}
              </span>

              <h2>
                {row.name}
              </h2>

              <small>
                {row.slug}
                {' / '}
                {row.theme_key}
              </small>
            </div>

            <button
              className={
                row.is_active
                  ? 'director-course-toggle active'
                  : 'director-course-toggle'
              }
              onClick={() =>
                void toggle(row)
              }
            >
              {row.is_active
                ? <Eye size={18} />
                : <EyeOff size={18} />}

              {row.is_active
                ? 'Ativo'
                : 'Oculto'}
            </button>
          </article>
        ))}
      </section>
    </div>
  )
}
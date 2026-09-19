import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  Activity,
  BellRing,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/context/AuthContext'
import { useAdmin } from '../admin/AdminContext'

interface ProfileRow {
  id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  account_status: string
  created_at: string
}

interface CourseRow {
  id: string
  name: string
  slug: string
  is_active: boolean
  is_public: boolean
  audience_segment: string
  theme_key: string
}

interface AnnouncementRow {
  id: string
  title: string
  body: string | null
  announcement_type: string
  is_popup: boolean
  is_active: boolean
  created_at: string
}

export function ControlCenterPage() {
  const { user } = useAuth()
  const { roles } = useAdmin()

  const [loading, setLoading] =
    useState(true)

  const [studentsCount, setStudentsCount] =
    useState(0)

  const [coursesCount, setCoursesCount] =
    useState(0)

  const [
    announcementsCount,
    setAnnouncementsCount,
  ] = useState(0)

  const [profiles, setProfiles] =
    useState<ProfileRow[]>([])

  const [courses, setCourses] =
    useState<CourseRow[]>([])

  const [announcements, setAnnouncements] =
    useState<AnnouncementRow[]>([])

  const [title, setTitle] =
    useState('')

  const [body, setBody] =
    useState('')

  const [announcementType, setAnnouncementType] =
    useState('info')

  const [isPopup, setIsPopup] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [message, setMessage] =
    useState('')

  async function loadData() {
    setLoading(true)

    const [
      profilesCountResult,
      coursesCountResult,
      announcementsCountResult,
      profilesResult,
      coursesResult,
      announcementsResult,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id', {
          count: 'exact',
          head: true,
        }),

      supabase
        .from('courses')
        .select('id', {
          count: 'exact',
          head: true,
        }),

      supabase
        .from('announcements')
        .select('id', {
          count: 'exact',
          head: true,
        }),

      supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          display_name,
          account_status,
          created_at
        `)
        .order('created_at', {
          ascending: false,
        })
        .limit(8),

      supabase
        .from('courses')
        .select(`
          id,
          name,
          slug,
          is_active,
          is_public,
          audience_segment,
          theme_key
        `)
        .order('name'),

      supabase
        .from('announcements')
        .select(`
          id,
          title,
          body,
          announcement_type,
          is_popup,
          is_active,
          created_at
        `)
        .order('created_at', {
          ascending: false,
        })
        .limit(8),
    ])

    setStudentsCount(
      profilesCountResult.count ?? 0
    )

    setCoursesCount(
      coursesCountResult.count ?? 0
    )

    setAnnouncementsCount(
      announcementsCountResult.count ?? 0
    )

    setProfiles(
      (profilesResult.data ?? [])
      as ProfileRow[]
    )

    setCourses(
      (coursesResult.data ?? [])
      as CourseRow[]
    )

    setAnnouncements(
      (announcementsResult.data ?? [])
      as AnnouncementRow[]
    )

    setLoading(false)
  }

  useEffect(() => {
    void loadData()
  }, [])

  async function toggleCourse(
    course: CourseRow
  ) {
    const { error } =
      await supabase
        .from('courses')
        .update({
          is_active:
            !course.is_active,
        })
        .eq('id', course.id)

    if (error) {
      setMessage(
        `Erro ao atualizar curso: ${error.message}`
      )
      return
    }

    await loadData()
  }

  async function createAnnouncement(
    event: FormEvent
  ) {
    event.preventDefault()

    if (!title.trim()) return

    setSaving(true)
    setMessage('')

    const { error } =
      await supabase
        .from('announcements')
        .insert({
          title: title.trim(),
          body:
            body.trim() || null,
          announcement_type:
            announcementType,
          is_popup: isPopup,
          is_active: true,
          created_by:
            user?.id ?? null,
        })

    setSaving(false)

    if (error) {
      setMessage(
        `Erro ao publicar: ${error.message}`
      )
      return
    }

    setTitle('')
    setBody('')
    setAnnouncementType('info')
    setIsPopup(false)

    setMessage(
      'Comunicado publicado com sucesso.'
    )

    await loadData()
  }

  return (
    <div className="control-page page-enter">
      <header className="control-header">
        <div>
          <span>
            CENTRO DE CONTROLE
          </span>

          <h1>
            LEVEL Command
          </h1>

          <p>
            Administração geral da plataforma.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            void loadData()
          }
        >
          <RefreshCw size={17} />
          Atualizar
        </button>
      </header>

      <section className="control-identity">
        <ShieldCheck size={22} />

        <div>
          <span>
            ACESSO AUTORIZADO
          </span>

          <strong>
            {user?.email}
          </strong>

          <small>
            {roles.join(' • ')}
          </small>
        </div>
      </section>

      <section className="control-stats">
        <article>
          <Users size={21} />

          <div>
            <span>Usuários</span>

            <strong>
              {loading
                ? '—'
                : studentsCount}
            </strong>
          </div>
        </article>

        <article>
          <BookOpen size={21} />

          <div>
            <span>Cursos</span>

            <strong>
              {loading
                ? '—'
                : coursesCount}
            </strong>
          </div>
        </article>

        <article>
          <Megaphone size={21} />

          <div>
            <span>Comunicados</span>

            <strong>
              {loading
                ? '—'
                : announcementsCount}
            </strong>
          </div>
        </article>

        <article>
          <Activity size={21} />

          <div>
            <span>Sistema</span>

            <strong>
              ONLINE
            </strong>
          </div>
        </article>
      </section>

      <div className="control-grid">
        <section className="control-panel">
          <div className="control-panel-title">
            <div>
              <span>GESTÃO</span>

              <h2>
                Cursos
              </h2>
            </div>

            <GraduationCap size={21} />
          </div>

          <div className="control-list">
            {courses.map(
              (course) => (
                <div
                  key={course.id}
                  className="control-row"
                >
                  <div>
                    <strong>
                      {course.name}
                    </strong>

                    <span>
                      {course.audience_segment}
                      {' • '}
                      {course.theme_key}
                    </span>
                  </div>

                  <button
                    className={
                      course.is_active
                        ? 'status-button active'
                        : 'status-button'
                    }
                    onClick={() =>
                      void toggleCourse(
                        course
                      )
                    }
                  >
                    {course.is_active
                      ? <Eye size={16} />
                      : <EyeOff size={16} />}

                    {course.is_active
                      ? 'Ativo'
                      : 'Oculto'}
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        <section className="control-panel">
          <div className="control-panel-title">
            <div>
              <span>COMUNICAÇÃO</span>

              <h2>
                Novo comunicado
              </h2>
            </div>

            <BellRing size={21} />
          </div>

          <form
            className="control-form"
            onSubmit={
              createAnnouncement
            }
          >
            <label>
              Título

              <input
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Ex.: Novo desafio disponível"
                required
              />
            </label>

            <label>
              Mensagem

              <textarea
                value={body}
                onChange={(event) =>
                  setBody(
                    event.target.value
                  )
                }
                placeholder="Escreva o comunicado..."
                rows={4}
              />
            </label>

            <label>
              Tipo

              <select
                value={
                  announcementType
                }
                onChange={(event) =>
                  setAnnouncementType(
                    event.target.value
                  )
                }
              >
                <option value="info">
                  Informação
                </option>

                <option value="success">
                  Novidade
                </option>

                <option value="warning">
                  Atenção
                </option>

                <option value="promotion">
                  Promoção
                </option>

                <option value="maintenance">
                  Manutenção
                </option>
              </select>
            </label>

            <label className="control-check">
              <input
                type="checkbox"
                checked={isPopup}
                onChange={(event) =>
                  setIsPopup(
                    event.target.checked
                  )
                }
              />

              Exibir como pop-up
            </label>

            <button
              className="primary-button"
              disabled={saving}
            >
              <Megaphone size={17} />

              {saving
                ? 'Publicando...'
                : 'Publicar'}
            </button>

            {message && (
              <p className="control-message">
                {message}
              </p>
            )}
          </form>
        </section>
      </div>

      <div className="control-grid">
        <section className="control-panel">
          <div className="control-panel-title">
            <div>
              <span>USUÁRIOS</span>

              <h2>
                Cadastros recentes
              </h2>
            </div>

            <Users size={21} />
          </div>

          <div className="control-list">
            {profiles.map(
              (profile) => (
                <div
                  key={profile.id}
                  className="control-row"
                >
                  <div>
                    <strong>
                      {profile.display_name ??
                        profile.first_name ??
                        'Usuário LEVEL'}
                    </strong>

                    <span>
                      {profile.account_status}
                    </span>
                  </div>

                  <CheckCircle2
                    size={17}
                  />
                </div>
              )
            )}
          </div>
        </section>

        <section className="control-panel">
          <div className="control-panel-title">
            <div>
              <span>PUBLICAÇÕES</span>

              <h2>
                Últimos comunicados
              </h2>
            </div>

            <Megaphone size={21} />
          </div>

          <div className="control-list">
            {announcements.length === 0 && (
              <p className="control-empty">
                Nenhum comunicado publicado.
              </p>
            )}

            {announcements.map(
              (announcement) => (
                <div
                  key={announcement.id}
                  className="control-row"
                >
                  <div>
                    <strong>
                      {announcement.title}
                    </strong>

                    <span>
                      {
                        announcement.announcement_type
                      }

                      {announcement.is_popup
                        ? ' • POP-UP'
                        : ''}
                    </span>
                  </div>

                  <span
                    className={
                      announcement.is_active
                        ? 'control-dot active'
                        : 'control-dot'
                    }
                  />
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
import {
  Activity,
  BookOpen,
  Megaphone,
  ShieldCheck,
  Users,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import { supabase } from '../../lib/supabase'

interface RecentUser {
  id: string
  display_name: string | null
  first_name: string | null
  account_status: string
}

interface RecentCourse {
  id: string
  name: string
  is_active: boolean
}

export function AdminDashboardPage() {
  const [users, setUsers] = useState(0)
  const [courses, setCourses] = useState(0)
  const [announcements, setAnnouncements] =
    useState(0)

  const [recentUsers, setRecentUsers] =
    useState<RecentUser[]>([])

  const [recentCourses, setRecentCourses] =
    useState<RecentCourse[]>([])

  const [loading, setLoading] =
    useState(true)

  async function load() {
    setLoading(true)

    const [
      usersCount,
      coursesCount,
      announcementsCount,
      usersResult,
      coursesResult,
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
          display_name,
          first_name,
          account_status
        `)
        .order('created_at', {
          ascending: false,
        })
        .limit(6),

      supabase
        .from('courses')
        .select(`
          id,
          name,
          is_active
        `)
        .order('name')
        .limit(6),
    ])

    setUsers(usersCount.count ?? 0)
    setCourses(coursesCount.count ?? 0)

    setAnnouncements(
      announcementsCount.count ?? 0
    )

    setRecentUsers(
      (usersResult.data ?? []) as RecentUser[]
    )

    setRecentCourses(
      (coursesResult.data ?? []) as RecentCourse[]
    )

    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="director-page">
      <div className="director-page-heading">
        <span>DASHBOARD</span>

        <h1>
          Centro de Controle
        </h1>

        <p>
          Visao geral da plataforma LEVEL.
        </p>
      </div>

      <section className="director-stats">
        <article>
          <Users size={22} />

          <div>
            <span>Usuarios</span>
            <strong>
              {loading ? '...' : users}
            </strong>
          </div>
        </article>

        <article>
          <BookOpen size={22} />

          <div>
            <span>Cursos</span>
            <strong>
              {loading ? '...' : courses}
            </strong>
          </div>
        </article>

        <article>
          <Megaphone size={22} />

          <div>
            <span>Comunicados</span>
            <strong>
              {loading
                ? '...'
                : announcements}
            </strong>
          </div>
        </article>

        <article>
          <Activity size={22} />

          <div>
            <span>Sistema</span>
            <strong>ONLINE</strong>
          </div>
        </article>
      </section>

      <section className="director-grid-two">
        <article className="director-panel">
          <div className="director-panel-heading">
            <div>
              <span>ACESSOS</span>
              <h2>Cadastros recentes</h2>
            </div>

            <Users size={20} />
          </div>

          <div className="director-list">
            {recentUsers.map((row) => (
              <div
                className="director-list-row"
                key={row.id}
              >
                <div>
                  <strong>
                    {row.display_name ??
                      row.first_name ??
                      'Usuario LEVEL'}
                  </strong>

                  <span>
                    {row.account_status}
                  </span>
                </div>

                <ShieldCheck size={16} />
              </div>
            ))}
          </div>
        </article>

        <article className="director-panel">
          <div className="director-panel-heading">
            <div>
              <span>ACADEMICO</span>
              <h2>Cursos cadastrados</h2>
            </div>

            <BookOpen size={20} />
          </div>

          <div className="director-list">
            {recentCourses.map((row) => (
              <div
                className="director-list-row"
                key={row.id}
              >
                <strong>
                  {row.name}
                </strong>

                <span
                  className={
                    row.is_active
                      ? 'director-status active'
                      : 'director-status'
                  }
                >
                  {row.is_active
                    ? 'Ativo'
                    : 'Oculto'}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
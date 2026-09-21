import {
  Megaphone,
  Trash2,
} from 'lucide-react'

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/context/AuthContext'

interface AnnouncementRow {
  id: string
  title: string
  body: string | null
  announcement_type: string
  is_popup: boolean
  is_active: boolean
}

export function AdminCommunicationsPage() {
  const { user } = useAuth()

  const [rows, setRows] =
    useState<AnnouncementRow[]>([])

  const [title, setTitle] =
    useState('')

  const [body, setBody] =
    useState('')

  const [type, setType] =
    useState('info')

  const [popup, setPopup] =
    useState(false)

  const [message, setMessage] =
    useState('')

  async function load() {
    const { data, error } =
      await supabase
        .from('announcements')
        .select(`
          id,
          title,
          body,
          announcement_type,
          is_popup,
          is_active
        `)
        .order('created_at', {
          ascending: false,
        })

    if (error) {
      setMessage(error.message)
      return
    }

    setRows(
      (data ?? []) as AnnouncementRow[]
    )
  }

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault()

    const { error } =
      await supabase
        .from('announcements')
        .insert({
          title: title.trim(),
          body:
            body.trim() || null,
          announcement_type: type,
          is_popup: popup,
          is_active: true,
          created_by:
            user?.id ?? null,
        })

    if (error) {
      setMessage(error.message)
      return
    }

    setTitle('')
    setBody('')
    setPopup(false)
    setType('info')
    setMessage('Publicado com sucesso.')

    await load()
  }

  async function remove(id: string) {
    const { error } =
      await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

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
      <div className="director-page-heading">
        <span>COMUNICACAO</span>

        <h1>
          Avisos, banners e pop-ups
        </h1>

        <p>
          Publique comunicados para os
          usuarios da LEVEL.
        </p>
      </div>

      <section className="director-grid-two">
        <form
          className="director-panel director-form"
          onSubmit={submit}
        >
          <div className="director-panel-heading">
            <div>
              <span>NOVO</span>

              <h2>
                Criar comunicado
              </h2>
            </div>

            <Megaphone size={20} />
          </div>

          <label>
            Titulo

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              required
            />
          </label>

          <label>
            Mensagem

            <textarea
              rows={5}
              value={body}
              onChange={(event) =>
                setBody(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Tipo

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value
                )
              }
            >
              <option value="info">
                Informacao
              </option>

              <option value="success">
                Novidade
              </option>

              <option value="warning">
                Atencao
              </option>

              <option value="promotion">
                Promocao
              </option>

              <option value="maintenance">
                Manutencao
              </option>
            </select>
          </label>

          <label className="director-checkbox">
            <input
              type="checkbox"
              checked={popup}
              onChange={(event) =>
                setPopup(
                  event.target.checked
                )
              }
            />

            Mostrar como pop-up
          </label>

          <button
            className="director-primary-button"
          >
            Publicar comunicado
          </button>

          {message && (
            <p className="director-form-message">
              {message}
            </p>
          )}
        </form>

        <section className="director-panel">
          <div className="director-panel-heading">
            <div>
              <span>PUBLICADOS</span>

              <h2>
                Comunicados
              </h2>
            </div>
          </div>

          <div className="director-list">
            {rows.map((row) => (
              <div
                className="director-list-row"
                key={row.id}
              >
                <div>
                  <strong>
                    {row.title}
                  </strong>

                  <span>
                    {row.announcement_type}
                    {row.is_popup
                      ? ' / POP-UP'
                      : ''}
                  </span>
                </div>

                <button
                  className="director-delete"
                  onClick={() =>
                    void remove(row.id)
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}
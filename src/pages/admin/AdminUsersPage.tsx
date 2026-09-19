import {
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import { supabase } from '../../lib/supabase'

interface UserRow {
  id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  account_status: string
  created_at: string
}

export function AdminUsersPage() {
  const [rows, setRows] =
    useState<UserRow[]>([])

  const [loading, setLoading] =
    useState(true)

  const [message, setMessage] =
    useState('')

  async function load() {
    setLoading(true)

    const { data, error } =
      await supabase
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

    if (error) {
      setMessage(error.message)
    } else {
      setRows(
        (data ?? []) as UserRow[]
      )
    }

    setLoading(false)
  }

  async function toggleStatus(
    row: UserRow
  ) {
    const next =
      row.account_status === 'active'
        ? 'suspended'
        : 'active'

    const { error } =
      await supabase
        .from('profiles')
        .update({
          account_status: next,
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
          <span>USUARIOS</span>

          <h1>
            Usuarios e acessos
          </h1>

          <p>
            Controle de cadastros e status
            das contas.
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

      <section className="director-panel">
        <div className="director-table">
          <div className="director-table-head">
            <span>Usuario</span>
            <span>Status</span>
            <span>Cadastro</span>
            <span>Acao</span>
          </div>

          {loading && (
            <div className="director-empty">
              Carregando...
            </div>
          )}

          {!loading &&
            rows.map((row) => (
              <div
                className="director-table-row"
                key={row.id}
              >
                <div>
                  <strong>
                    {row.display_name ??
                      row.first_name ??
                      'Usuario LEVEL'}
                  </strong>

                  <small>
                    {row.first_name}
                    {' '}
                    {row.last_name}
                  </small>
                </div>

                <span
                  className={
                    row.account_status === 'active'
                      ? 'director-status active'
                      : 'director-status warning'
                  }
                >
                  {row.account_status}
                </span>

                <span>
                  {new Date(
                    row.created_at
                  ).toLocaleDateString(
                    'pt-BR'
                  )}
                </span>

                <button
                  className="director-icon-button"
                  onClick={() =>
                    void toggleStatus(row)
                  }
                >
                  {row.account_status ===
                  'active'
                    ? <UserX size={17} />
                    : <UserCheck size={17} />}

                  {row.account_status ===
                  'active'
                    ? 'Suspender'
                    : 'Ativar'}
                </button>
              </div>
            ))}
        </div>
      </section>

      <div className="director-note">
        <Shield size={18} />

        <span>
          A gestao de cargos e permissoes
          sera adicionada nesta mesma tela.
        </span>
      </div>
    </div>
  )
}
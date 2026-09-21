import {
  FileSearch,
  ShieldCheck,
  Users,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'

interface RequestRow {
  id: string
  title: string
  status: string
  requested_at: string
}

export function AdminPage() {
  const {
    isAdmin,
    roles,
  } = useAuth()

  const [users, setUsers] =
    useState(0)

  const [requests, setRequests] =
    useState<RequestRow[]>([])

  useEffect(() => {
    if (!isAdmin) return

    void Promise.all([
      supabase
        .from('profiles')
        .select(
          'id',
          {
            count: 'exact',
            head: true,
          }
        ),

      supabase
        .from(
          'adv_analysis_requests'
        )
        .select(`
          id,
          title,
          status,
          requested_at
        `)
        .order(
          'requested_at',
          {
            ascending: false,
          }
        )
        .limit(10),
    ]).then(
      ([
        userResult,
        requestResult,
      ]) => {
        setUsers(
          userResult.count ?? 0
        )

        setRequests(
          (requestResult.data ??
            []) as RequestRow[]
        )
      }
    )
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="module-coming">
          <ShieldCheck
            size={34}
          />

          <h2>
            Acesso restrito
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-heading">
        <span className="eyebrow">
          ADMINISTRACAO
        </span>

        <h1>
          LEVEL Control
        </h1>

        <p>
          Controle de usuarios,
          solicitacoes e operacao da
          plataforma.
        </p>
      </div>

      <div className="stats-grid admin-stats">
        <article>
          <Users size={20} />

          <span>
            Usuarios cadastrados
          </span>

          <strong>
            {users}
          </strong>
        </article>

        <article>
          <FileSearch size={20} />

          <span>
            Solicitacoes
          </span>

          <strong>
            {requests.length}
          </strong>
        </article>

        <article>
          <ShieldCheck
            size={20}
          />

          <span>
            Seu acesso
          </span>

          <strong>
            ADMIN
          </strong>
        </article>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              ANALISES
            </span>

            <h2>
              Solicitacoes recentes
            </h2>
          </div>
        </div>

        {requests.length ===
          0 && (
          <div className="empty-state">
            Nenhuma solicitacao
            recebida.
          </div>
        )}

        <div className="simple-list">
          {requests.map(
            (request) => (
              <article
                key={request.id}
              >
                <div>
                  <strong>
                    {
                      request.title
                    }
                  </strong>

                  <span>
                    {
                      request.status
                    }
                  </span>
                </div>

                <span>
                  {new Date(
                    request.requested_at
                  ).toLocaleString(
                    'pt-BR'
                  )}
                </span>
              </article>
            )
          )}
        </div>
      </section>

      <section className="panel">
        <span className="eyebrow">
          PERMISSOES ATUAIS
        </span>

        <p className="muted">
          {roles.join(' / ')}
        </p>

        <p className="muted">
          O cadastro, bloqueio e
          suspensao de usuarios sera
          o proximo modulo
          administrativo.
        </p>
      </section>
    </div>
  )
}
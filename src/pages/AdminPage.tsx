import {
  Activity,
  Ban,
  Bot,
  Calculator,
  Check,
  CheckCircle2,
  FileSearch,
  FileSignature,
  FileX2,
  Image,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCcw,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  Users,
  X,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'

type AdminTab =
  | 'overview'
  | 'users'
  | 'activity'
  | 'requests'
  | 'security'
  | 'platform'

type AdminUser = {
  id: string
  email: string
  display_name: string
  username: string | null
  oab_number: string | null
  law_firm: string | null
  account_status: string
  created_at: string
  last_sign_in_at: string | null
  last_seen_at: string | null
  last_path: string | null
  roles: string[]
}

type ActivityRow = {
  id: string
  user_id: string
  email: string
  display_name: string
  event_type: string
  path: string | null
  metadata: Record<string, unknown>
  occurred_at: string
}

type AnalysisRequest = {
  id: string
  title: string
  status: string
  requested_at: string
}

type DeleteRequest = {
  id: string
  document_id: string | null
  requester_id: string
  original_name: string
  storage_path: string
  reason: string | null
  status: string
  requested_at: string
}

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  pending: 'Pendente',
  suspended: 'Suspenso',
  banned: 'Bloqueado',
  deleted: 'Excluído',
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return 'Nunca'
  }

  return new Date(
    value
  ).toLocaleString(
    'pt-BR'
  )
}

function isOnline(
  value: string | null
) {
  if (!value) {
    return false
  }

  return (
    Date.now() -
      new Date(
        value
      ).getTime()
  ) <
    5 * 60 * 1000
}

function activityLabel(
  value: string
) {
  if (
    value === 'page_view'
  ) {
    return 'Página acessada'
  }

  if (
    value === 'logout'
  ) {
    return 'Saiu da plataforma'
  }

  return value
}

export function AdminPage() {
  const {
    user,
    isAdmin,
    roles,
  } =
    useAuth()

  const [
    tab,
    setTab,
  ] =
    useState<AdminTab>(
      'overview'
    )

  const [
    users,
    setUsers,
  ] =
    useState<AdminUser[]>([])

  const [
    activities,
    setActivities,
  ] =
    useState<ActivityRow[]>([])

  const [
    analysisRequests,
    setAnalysisRequests,
  ] =
    useState<AnalysisRequest[]>([])

  const [
    deletionRequests,
    setDeletionRequests,
  ] =
    useState<DeleteRequest[]>([])

  const [
    search,
    setSearch,
  ] =
    useState('')

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState('')

  async function load() {
    if (!isAdmin) {
      return
    }

    setLoading(true)

    const [
      usersResult,
      activityResult,
      analysisResult,
      deletionResult,
    ] =
      await Promise.all([
        supabase.rpc(
          'adv_admin_list_users'
        ),

        supabase.rpc(
          'adv_admin_activity_feed',
          {
            p_limit:
              150,
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
              ascending:
                false,
            }
          )
          .limit(30),

        supabase
          .from(
            'adv_document_deletion_requests'
          )
          .select(`
            id,
            document_id,
            requester_id,
            original_name,
            storage_path,
            reason,
            status,
            requested_at
          `)
          .eq(
            'status',
            'pending'
          )
          .order(
            'requested_at',
            {
              ascending:
                false,
            }
          ),
      ])

    if (
      usersResult.error
    ) {
      setMessage(
        usersResult.error
          .message
      )
    } else {
      setUsers(
        (
          usersResult.data ??
          []
        ) as AdminUser[]
      )
    }

    if (
      !activityResult.error
    ) {
      setActivities(
        (
          activityResult.data ??
          []
        ) as ActivityRow[]
      )
    }

    setAnalysisRequests(
      (
        analysisResult.data ??
        []
      ) as AnalysisRequest[]
    )

    setDeletionRequests(
      (
        deletionResult.data ??
        []
      ) as DeleteRequest[]
    )

    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [isAdmin])

  const filteredUsers =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase()

        if (!term) {
          return users
        }

        return users.filter(
          (item) =>
            [
              item.email,
              item.display_name,
              item.username,
              item.oab_number,
              item.law_firm,
            ]
              .filter(
                Boolean
              )
              .some(
                (value) =>
                  String(
                    value
                  )
                    .toLowerCase()
                    .includes(
                      term
                    )
              )
        )
      },
      [
        users,
        search,
      ]
    )

  const onlineCount =
    users.filter(
      (item) =>
        isOnline(
          item.last_seen_at
        )
    ).length

  async function changeStatus(
    target: AdminUser,
    status: string
  ) {
    const label =
      statusLabels[
        status
      ] ?? status

    const confirmed =
      window.confirm(
        `${label} o acesso de ${target.display_name}?`
      )

    if (!confirmed) {
      return
    }

    setMessage(
      'Atualizando acesso...'
    )

    const {
      error,
    } =
      await supabase.rpc(
        'adv_admin_set_account_status',
        {
          p_user_id:
            target.id,

          p_status:
            status,
        }
      )

    if (error) {
      setMessage(
        error.message
      )
      return
    }

    setMessage(
      `Acesso atualizado para: ${label}.`
    )

    await load()
  }

  async function sendReset(
    target: AdminUser
  ) {
    setMessage(
      'Enviando recuperação de senha...'
    )

    const {
      error,
    } =
      await supabase.auth
        .resetPasswordForEmail(
          target.email,
          {
            redirectTo:
              `${window.location.origin}/login?recovery=1`,
          }
        )

    setMessage(
      error
        ? error.message
        : `Link de recuperação enviado para ${target.email}.`
    )
  }

  async function temporaryPassword(
    target: AdminUser
  ) {
    const suggestion =
      `Level@${Math.random()
        .toString(36)
        .slice(2, 8)}9A`

    const password =
      window.prompt(
        `Defina uma senha temporária para ${target.display_name}. O usuário deve trocá-la depois.`,
        suggestion
      )

    if (
      password === null
    ) {
      return
    }

    if (
      password.length < 8
    ) {
      setMessage(
        'A senha temporária precisa ter pelo menos 8 caracteres.'
      )
      return
    }

    setMessage(
      'Alterando senha temporária...'
    )

    const {
      data,
      error,
    } =
      await supabase.functions
        .invoke(
          'admin-user-control',
          {
            body: {
              action:
                'set_temporary_password',

              user_id:
                target.id,

              password,
            },
          }
        )

    if (error) {
      setMessage(
        error.message
      )
      return
    }

    if (
      data?.error
    ) {
      setMessage(
        data.error
      )
      return
    }

    setMessage(
      `Senha temporária definida para ${target.email}.`
    )
  }

  async function approveDeletion(
    request: DeleteRequest
  ) {
    if (!user) {
      return
    }

    const confirmed =
      window.confirm(
        `Excluir definitivamente "${request.original_name}"?`
      )

    if (!confirmed) {
      return
    }

    setMessage(
      'Excluindo documento...'
    )

    const {
      error:
        storageError,
    } =
      await supabase.storage
        .from(
          'level-adv-documents'
        )
        .remove([
          request.storage_path,
        ])

    if (storageError) {
      setMessage(
        storageError.message
      )
      return
    }

    if (
      request.document_id
    ) {
      const {
        error:
          databaseError,
      } =
        await supabase
          .from(
            'adv_documents'
          )
          .delete()
          .eq(
            'id',
            request.document_id
          )

      if (
        databaseError
      ) {
        setMessage(
          databaseError
            .message
        )
        return
      }
    }

    const {
      error,
    } =
      await supabase
        .from(
          'adv_document_deletion_requests'
        )
        .update({
          status:
            'approved',

          reviewed_at:
            new Date()
              .toISOString(),

          reviewed_by:
            user.id,

          admin_note:
            'Exclusão aprovada pelo administrador.',
        })
        .eq(
          'id',
          request.id
        )

    if (error) {
      setMessage(
        error.message
      )
      return
    }

    setMessage(
      'Documento excluído definitivamente.'
    )

    await load()
  }

  async function rejectDeletion(
    request: DeleteRequest
  ) {
    if (!user) {
      return
    }

    const note =
      window.prompt(
        'Motivo da recusa:',
        'Documento mantido pela administração.'
      )

    if (
      note === null
    ) {
      return
    }

    const {
      error,
    } =
      await supabase
        .from(
          'adv_document_deletion_requests'
        )
        .update({
          status:
            'rejected',

          reviewed_at:
            new Date()
              .toISOString(),

          reviewed_by:
            user.id,

          admin_note:
            note.trim() ||
            null,
        })
        .eq(
          'id',
          request.id
        )

    if (error) {
      setMessage(
        error.message
      )
      return
    }

    setMessage(
      'Solicitação recusada.'
    )

    await load()
  }

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
    <div className="page level-admin-page">
      <div className="page-heading admin-heading-row">
        <div>
          <span className="eyebrow">
            ADMINISTRAÇÃO
          </span>

          <h1>
            LEVEL Control
          </h1>

          <p>
            Usuários, acessos,
            atividade, solicitações,
            marca e segurança da
            plataforma.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            void load()
          }
          disabled={
            loading
          }
        >
          <RefreshCcw
            size={15}
          />

          Atualizar
        </button>
      </div>

      {message && (
        <div className="system-message">
          {message}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={
            tab ===
            'overview'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab(
              'overview'
            )
          }
        >
          Visão geral
        </button>

        <button
          className={
            tab === 'users'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab(
              'users'
            )
          }
        >
          Usuários
        </button>

        <button
          className={
            tab ===
            'activity'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab(
              'activity'
            )
          }
        >
          Atividade
        </button>

        <button
          className={
            tab ===
            'requests'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab(
              'requests'
            )
          }
        >
          Solicitações
        </button>

        <button
          className={
            tab ===
            'platform'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab(
              'platform'
            )
          }
        >
          Plataforma
        </button>

        <button
          className={
            tab ===
            'security'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab(
              'security'
            )
          }
        >
          Segurança
        </button>
      </div>

      {tab ===
        'overview' && (
        <>
          <div className="stats-grid admin-stats">
            <article>
              <Users
                size={20}
              />

              <span>
                USUÁRIOS
              </span>

              <strong>
                {users.length}
              </strong>
            </article>

            <article className="online-stat">
              <UserRoundCheck
                size={20}
              />

              <span>
                ONLINE AGORA
              </span>

              <strong>
                {onlineCount}
              </strong>
            </article>

            <article>
              <FileSearch
                size={20}
              />

              <span>
                ANÁLISES
              </span>

              <strong>
                {
                  analysisRequests
                    .length
                }
              </strong>
            </article>

            <article>
              <FileX2
                size={20}
              />

              <span>
                EXCLUSÕES
              </span>

              <strong>
                {
                  deletionRequests
                    .length
                }
              </strong>
            </article>
          </div>

          <section className="panel admin-section">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  ACESSO
                </span>

                <h2>
                  Usuários recentes
                </h2>
              </div>
            </div>

            <div className="admin-user-mini-list">
              {users
                .slice(
                  0,
                  8
                )
                .map(
                  (item) => (
                    <article
                      key={
                        item.id
                      }
                    >
                      <span
                        className={
                          isOnline(
                            item.last_seen_at
                          )
                            ? 'presence-dot online'
                            : 'presence-dot'
                        }
                      />

                      <div>
                        <strong>
                          {
                            item.display_name
                          }
                        </strong>

                        <span>
                          {
                            item.email
                          }
                        </span>
                      </div>

                      <small>
                        {isOnline(
                          item.last_seen_at
                        )
                          ? 'Online agora'
                          : formatDate(
                              item.last_seen_at ||
                              item.last_sign_in_at
                            )}
                      </small>
                    </article>
                  )
                )}
            </div>
          </section>
        </>
      )}

      {tab ===
        'users' && (
        <section className="panel admin-section">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                USUÁRIOS E ACESSOS
              </span>

              <h2>
                Controle de contas
              </h2>

              <p>
                Consulte atividade,
                recupere acesso e
                bloqueie contas quando
                necessário.
              </p>
            </div>
          </div>

          <div className="admin-user-toolbar">
            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
              placeholder="Buscar por nome, e-mail, usuário, OAB ou escritório..."
            />
          </div>

          <div className="admin-user-list">
            {filteredUsers.map(
              (item) => (
                <article
                  key={
                    item.id
                  }
                  className="admin-user-card"
                >
                  <div className="admin-user-main">
                    <div className="admin-user-title">
                      <span
                        className={
                          isOnline(
                            item.last_seen_at
                          )
                            ? 'presence-dot online'
                            : 'presence-dot'
                        }
                      />

                      <div>
                        <strong>
                          {
                            item.display_name
                          }
                        </strong>

                        <span>
                          {
                            item.email
                          }
                        </span>
                      </div>
                    </div>

                    <div className="admin-user-badges">
                      <span
                        className={
                          `status-pill ${item.account_status}`
                        }
                      >
                        {
                          statusLabels[
                            item.account_status
                          ] ??
                          item.account_status
                        }
                      </span>

                      {item.roles
                        .map(
                          (
                            role
                          ) => (
                            <span
                              key={
                                role
                              }
                              className="role-pill"
                            >
                              {
                                role
                              }
                            </span>
                          )
                        )}
                    </div>
                  </div>

                  <div className="admin-user-details">
                    <span>
                      Último acesso:
                      <strong>
                        {' '}
                        {formatDate(
                          item.last_seen_at ||
                          item.last_sign_in_at
                        )}
                      </strong>
                    </span>

                    <span>
                      Última página:
                      <strong>
                        {' '}
                        {item.last_path ||
                          'Sem registro'}
                      </strong>
                    </span>

                    <span>
                      OAB:
                      <strong>
                        {' '}
                        {item.oab_number ||
                          'Não informada'}
                      </strong>
                    </span>

                    <span>
                      Escritório:
                      <strong>
                        {' '}
                        {item.law_firm ||
                          'Não informado'}
                      </strong>
                    </span>
                  </div>

                  <div className="admin-user-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        void sendReset(
                          item
                        )
                      }
                    >
                      <Mail
                        size={14}
                      />

                      Enviar recuperação
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        void temporaryPassword(
                          item
                        )
                      }
                    >
                      <KeyRound
                        size={14}
                      />

                      Senha temporária
                    </button>

                    {item.account_status !==
                      'active' && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          void changeStatus(
                            item,
                            'active'
                          )
                        }
                      >
                        <CheckCircle2
                          size={14}
                        />

                        Ativar
                      </button>
                    )}

                    {item.account_status ===
                      'active' && (
                      <button
                        type="button"
                        className="secondary-button warning"
                        onClick={() =>
                          void changeStatus(
                            item,
                            'suspended'
                          )
                        }
                      >
                        <UserRoundX
                          size={14}
                        />

                        Suspender
                      </button>
                    )}

                    {item.account_status !==
                      'banned' && (
                      <button
                        type="button"
                        className="secondary-button danger"
                        onClick={() =>
                          void changeStatus(
                            item,
                            'banned'
                          )
                        }
                      >
                        <Ban
                          size={14}
                        />

                        Bloquear
                      </button>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        </section>
      )}

      {tab ===
        'activity' && (
        <section className="panel admin-section">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                AUDITORIA OPERACIONAL
              </span>

              <h2>
                Atividade recente
              </h2>

              <p>
                Registro de páginas e
                ações operacionais. O
                conteúdo de conversas
                privadas não é exibido.
              </p>
            </div>
          </div>

          <div className="activity-feed">
            {activities.map(
              (item) => (
                <article
                  key={
                    item.id
                  }
                >
                  <Activity
                    size={17}
                  />

                  <div>
                    <strong>
                      {
                        item.display_name
                      }
                    </strong>

                    <span>
                      {
                        activityLabel(
                          item.event_type
                        )
                      }
                      {item.path
                        ? ` • ${item.path}`
                        : ''}
                    </span>

                    <small>
                      {
                        item.email
                      }
                    </small>
                  </div>

                  <time>
                    {formatDate(
                      item.occurred_at
                    )}
                  </time>
                </article>
              )
            )}
          </div>
        </section>
      )}

      {tab ===
        'requests' && (
        <>
          <section className="panel admin-section">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  DOCUMENTOS
                </span>

                <h2>
                  Solicitações de exclusão
                </h2>
              </div>
            </div>

            {deletionRequests.length ===
              0 && (
              <div className="empty-state compact">
                Nenhuma solicitação pendente.
              </div>
            )}

            <div className="admin-request-list">
              {deletionRequests.map(
                (
                  request
                ) => (
                  <article
                    key={
                      request.id
                    }
                    className="admin-request-item"
                  >
                    <div>
                      <span className="case-type">
                        EXCLUSÃO DE DOCUMENTO
                      </span>

                      <strong>
                        {
                          request.original_name
                        }
                      </strong>

                      <p>
                        {request.reason ||
                          'Nenhum motivo informado.'}
                      </p>

                      <small>
                        {formatDate(
                          request.requested_at
                        )}
                      </small>
                    </div>

                    <div className="admin-request-actions">
                      <button
                        type="button"
                        className="approve-button"
                        onClick={() =>
                          void approveDeletion(
                            request
                          )
                        }
                      >
                        <Check
                          size={15}
                        />

                        Aprovar
                      </button>

                      <button
                        type="button"
                        className="reject-button"
                        onClick={() =>
                          void rejectDeletion(
                            request
                          )
                        }
                      >
                        <X
                          size={15}
                        />

                        Recusar
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>

          <section className="panel admin-section">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  ANÁLISES
                </span>

                <h2>
                  Solicitações recentes
                </h2>
              </div>
            </div>

            <div className="simple-list">
              {analysisRequests.map(
                (
                  request
                ) => (
                  <article
                    key={
                      request.id
                    }
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
                      {formatDate(
                        request.requested_at
                      )}
                    </span>
                  </article>
                )
              )}
            </div>
          </section>
        </>
      )}

      {tab ===
        'platform' && (
        <div className="admin-platform-grid">
          <Link
            to="/app/admin/banners"
            className="admin-platform-card"
          >
            <Image
              size={22}
            />

            <span>
              MARCA E CONTEÚDO
            </span>

            <strong>
              Banners, logo e favicon
            </strong>

            <p>
              Envie banners, altere a
              logo usada na interface,
              favicon e imagem de
              compartilhamento.
            </p>
          </Link>

          <article className="admin-platform-card">
            <Calculator
              size={22}
            />

            <span>
              CALCULADORAS
            </span>

            <strong>
              Fórmulas protegidas
            </strong>

            <p>
              Para evitar resultados
              jurídicos ou financeiros
              incorretos, as fórmulas
              permanecem versionadas no
              código.
            </p>
          </article>

          <article className="admin-platform-card">
            <FileSignature
              size={22}
            />

            <span>
              DOCUMENTOS
            </span>

            <strong>
              Modelos jurídicos
            </strong>

            <p>
              Os modelos atuais ficam
              versionados no código.
              A edição administrativa
              completa poderá ser
              liberada em uma próxima
              etapa.
            </p>
          </article>

          <article className="admin-platform-card">
            <Bot
              size={22}
            />

            <span>
              FUTURO
            </span>

            <strong>
              Planos e LEVEL IA
            </strong>

            <p>
              Estrutura reservada para
              assinatura, pagamento e
              liberação de recursos de
              inteligência artificial.
            </p>
          </article>
        </div>
      )}

      {tab ===
        'security' && (
        <div className="admin-security-grid">
          <article className="panel">
            <ShieldCheck
              size={23}
            />

            <span className="eyebrow">
              ISOLAMENTO
            </span>

            <h2>
              Dados por usuário
            </h2>

            <p>
              Casos e documentos são
              isolados por políticas
              RLS. Outros advogados só
              acessam um caso quando
              recebem autorização de
              compartilhamento.
            </p>
          </article>

          <article className="panel">
            <LockKeyhole
              size={23}
            />

            <span className="eyebrow">
              ADMINISTRAÇÃO
            </span>

            <h2>
              Acesso privilegiado
            </h2>

            <p>
              Apenas contas com papel
              administrativo podem
              acessar o LEVEL Control,
              redefinir acesso e
              visualizar auditoria.
            </p>
          </article>

          <article className="panel">
            <Activity
              size={23}
            />

            <span className="eyebrow">
              AUDITORIA
            </span>

            <h2>
              Presença e navegação
            </h2>

            <p>
              A plataforma registra
              páginas acessadas e
              presença operacional por
              até 180 dias, sem exibir
              conteúdo de chat privado.
            </p>
          </article>

          <article className="panel">
            <Users
              size={23}
            />

            <span className="eyebrow">
              SEU ACESSO
            </span>

            <h2>
              Perfis administrativos
            </h2>

            <p>
              {roles.join(
                ' / '
              )}
            </p>
          </article>
        </div>
      )}
    </div>
  )
}

import {
  Check,
  FileSearch,
  FileX2,
  ShieldCheck,
  Users,
  X,
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


export function AdminPage() {
  const {
    user,
    isAdmin,
    roles,
  } = useAuth()

  const [
    users,
    setUsers,
  ] = useState(0)

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
    message,
    setMessage,
  ] =
    useState('')


  async function load() {
    if (!isAdmin) return

    const [
      userResult,
      analysisResult,
      deletionResult,
    ] = await Promise.all([
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
        .limit(20),

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
            ascending: false,
          }
        ),
    ])

    setUsers(
      userResult.count ?? 0
    )

    setAnalysisRequests(
      analysisResult.data ?? []
    )

    setDeletionRequests(
      deletionResult.data ?? []
    )
  }


  useEffect(() => {
    void load()
  }, [isAdmin])


  async function approveDeletion(
    request: DeleteRequest
  ) {
    if (!user) return

    const confirmed =
      window.confirm(
        `Excluir definitivamente "${request.original_name}"?`
      )

    if (!confirmed) return

    setMessage(
      'Excluindo documento...'
    )

    const {
      error: storageError,
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


    if (request.document_id) {
      const {
        error: databaseError,
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

      if (databaseError) {
        setMessage(
          databaseError.message
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
    if (!user) return

    const note =
      window.prompt(
        'Motivo da recusa:',
        'Documento mantido pela administração.'
      )

    if (note === null) {
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
          <ShieldCheck size={34} />
          <h2>Acesso restrito</h2>
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
          Controle operacional da plataforma,
          usuários, análises e documentos.
        </p>
      </div>


      {message && (
        <div className="system-message">
          {message}
        </div>
      )}


      <div className="stats-grid admin-stats">

        <article>
          <Users size={20} />

          <span>
            USUÁRIOS
          </span>

          <strong>
            {users}
          </strong>
        </article>


        <article>
          <FileSearch size={20} />

          <span>
            ANÁLISES
          </span>

          <strong>
            {
              analysisRequests.length
            }
          </strong>
        </article>


        <article>
          <FileX2 size={20} />

          <span>
            EXCLUSÕES PENDENTES
          </span>

          <strong>
            {
              deletionRequests.length
            }
          </strong>
        </article>


        <article>
          <ShieldCheck size={20} />

          <span>
            SEU ACESSO
          </span>

          <strong>
            ADMIN
          </strong>
        </article>

      </div>


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


        {deletionRequests.length === 0 && (
          <div className="empty-state compact">
            Nenhuma solicitação pendente.
          </div>
        )}


        <div className="admin-request-list">

          {deletionRequests.map(
            (request) => (
              <article
                key={request.id}
                className="admin-request-item"
              >

                <div>
                  <span className="case-type">
                    EXCLUSÃO DE DOCUMENTO
                  </span>

                  <strong>
                    {request.original_name}
                  </strong>

                  <p>
                    {request.reason ||
                      'Nenhum motivo informado.'}
                  </p>

                  <small>
                    {new Date(
                      request.requested_at
                    ).toLocaleString(
                      'pt-BR'
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
                    <Check size={15} />

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
                    <X size={15} />

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
              ANALISES
            </span>

            <h2>
              Solicitações recentes
            </h2>
          </div>
        </div>


        {analysisRequests.length === 0 && (
          <div className="empty-state compact">
            Nenhuma solicitação recebida.
          </div>
        )}


        <div className="simple-list">

          {analysisRequests.map(
            (request) => (
              <article
                key={request.id}
              >
                <div>
                  <strong>
                    {request.title}
                  </strong>

                  <span>
                    {request.status}
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


      <section className="panel admin-section">
        <span className="eyebrow">
          PERMISSOES
        </span>

        <p className="muted">
          {roles.join(' / ')}
        </p>
      </section>

    </div>
  )
}
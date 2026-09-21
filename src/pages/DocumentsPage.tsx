import {
  Clock3,
  Download,
  FileText,
  ShieldAlert,
  Trash2,
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


type DocumentRow = {
  id: string
  original_name: string
  storage_path: string
  extraction_status: string
  created_at: string
}


type DeleteRequest = {
  id: string
  document_id: string | null
  status: string
  reason: string | null
  admin_note: string | null
}


export function DocumentsPage() {
  const {
    user,
  } = useAuth()

  const [
    documents,
    setDocuments,
  ] = useState<DocumentRow[]>([])

  const [
    requests,
    setRequests,
  ] = useState<DeleteRequest[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    message,
    setMessage,
  ] = useState('')


  async function load() {
    setLoading(true)

    const [
      documentsResult,
      requestsResult,
    ] = await Promise.all([
      supabase
        .from('adv_documents')
        .select(`
          id,
          original_name,
          storage_path,
          extraction_status,
          created_at
        `)
        .order(
          'created_at',
          {
            ascending: false,
          }
        ),

      supabase
        .from(
          'adv_document_deletion_requests'
        )
        .select(`
          id,
          document_id,
          status,
          reason,
          admin_note
        `)
        .order(
          'requested_at',
          {
            ascending: false,
          }
        ),
    ])

    if (documentsResult.error) {
      setMessage(
        documentsResult.error.message
      )
    }

    if (requestsResult.error) {
      setMessage(
        requestsResult.error.message
      )
    }

    setDocuments(
      documentsResult.data ?? []
    )

    setRequests(
      requestsResult.data ?? []
    )

    setLoading(false)
  }


  useEffect(() => {
    void load()
  }, [])


  function requestForDocument(
    documentId: string
  ) {
    return requests.find(
      (request) =>
        request.document_id === documentId &&
        request.status === 'pending'
    )
  }


  async function requestDeletion(
    document: DocumentRow
  ) {
    if (!user) return

    const reason =
      window.prompt(
        'Informe o motivo da solicitação de exclusão:',
        'Documento não é mais necessário.'
      )

    if (reason === null) {
      return
    }

    const {
      error,
    } = await supabase
      .from(
        'adv_document_deletion_requests'
      )
      .insert({
        document_id:
          document.id,

        requester_id:
          user.id,

        original_name:
          document.original_name,

        storage_path:
          document.storage_path,

        reason:
          reason.trim() ||
          null,
      })

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setMessage(
      'Solicitação de exclusão enviada ao administrador.'
    )

    await load()
  }


  async function downloadDocument(
    document: DocumentRow
  ) {
    const {
      data,
      error,
    } =
      await supabase.storage
        .from(
          'level-adv-documents'
        )
        .createSignedUrl(
          document.storage_path,
          60
        )

    if (
      error ||
      !data?.signedUrl
    ) {
      setMessage(
        error?.message ??
        'Não foi possível abrir o documento.'
      )

      return
    }

    window.open(
      data.signedUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }


  return (
    <div className="page">

      <div className="page-heading">
        <span className="eyebrow">
          ARQUIVOS
        </span>

        <h1>
          Documentos
        </h1>

        <p>
          Consulte seus arquivos e solicite a exclusão
          quando um documento não for mais necessário.
          Por segurança, apenas a administração pode
          concluir a exclusão definitiva.
        </p>
      </div>


      {message && (
        <div className="system-message">
          {message}
        </div>
      )}


      <section className="panel">

        {loading && (
          <div className="empty-state">
            Carregando...
          </div>
        )}


        {!loading &&
          documents.length === 0 && (
            <div className="empty-state">
              <FileText size={29} />

              <strong>
                Nenhum documento
              </strong>

              <span>
                PDFs e planilhas vinculados aos seus
                casos aparecerão aqui.
              </span>
            </div>
          )}


        <div className="document-list">

          {documents.map(
            (document) => {
              const pending =
                requestForDocument(
                  document.id
                )

              return (
                <article
                  key={document.id}
                  className="document-item"
                >

                  <div className="document-icon">
                    <FileText size={20} />
                  </div>


                  <div className="document-info">
                    <strong>
                      {document.original_name}
                    </strong>

                    <div className="document-meta">
                      <span>
                        {new Date(
                          document.created_at
                        ).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>

                      <span>
                        Leitura: {
                          document.extraction_status
                        }
                      </span>

                      {pending && (
                        <span className="delete-pending">
                          <Clock3 size={12} />

                          Exclusão aguardando aprovação
                        </span>
                      )}
                    </div>
                  </div>


                  <div className="document-actions">

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        void downloadDocument(
                          document
                        )
                      }
                    >
                      <Download size={15} />

                      Abrir
                    </button>


                    {!pending ? (
                      <button
                        type="button"
                        className="document-delete-request"
                        onClick={() =>
                          void requestDeletion(
                            document
                          )
                        }
                      >
                        <Trash2 size={15} />

                        Solicitar exclusão
                      </button>
                    ) : (
                      <div className="pending-button">
                        <ShieldAlert size={15} />

                        Pendente
                      </div>
                    )}

                  </div>

                </article>
              )
            }
          )}

        </div>

      </section>

    </div>
  )
}
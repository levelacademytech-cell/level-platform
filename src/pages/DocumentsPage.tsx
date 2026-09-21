import {
  FileText,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  supabase,
} from '../lib/supabase'

interface DocumentRow {
  id: string
  original_name: string
  extraction_status: string
  created_at: string
}

export function DocumentsPage() {
  const [
    documents,
    setDocuments,
  ] = useState<
    DocumentRow[]
  >([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    void supabase
      .from('adv_documents')
      .select(`
        id,
        original_name,
        extraction_status,
        created_at
      `)
      .order(
        'created_at',
        {
          ascending: false,
        }
      )
      .then(({ data }) => {
        setDocuments((data ?? []) as DocumentRow[])

        setLoading(false)
      })
  }, [])

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
          Arquivos enviados para os
          seus casos e analises.
        </p>
      </div>

      <section className="panel">
        {loading && (
          <div className="empty-state">
            Carregando...
          </div>
        )}

        {!loading &&
          documents.length ===
            0 && (
            <div className="empty-state">
              <FileText size={28} />

              <strong>
                Nenhum documento
              </strong>

              <span>
                PDFs e planilhas
                enviados aparecerao
                aqui.
              </span>
            </div>
          )}

        <div className="simple-list">
          {documents.map(
            (document) => (
              <article
                key={
                  document.id
                }
              >
                <div>
                  <strong>
                    {
                      document.original_name
                    }
                  </strong>

                  <span>
                    {
                      document.extraction_status
                    }
                  </span>
                </div>

                <span>
                  {new Date(
                    document.created_at
                  ).toLocaleDateString(
                    'pt-BR'
                  )}
                </span>
              </article>
            )
          )}
        </div>
      </section>
    </div>
  )
}
import {
  BriefcaseBusiness,
  ExternalLink,
  Trash2,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  supabase,
} from '../lib/supabase'


interface CaseRow {
  id: string

  client_name:
    string | null

  client_reference:
    string | null

  process_number:
    string | null

  bank_name:
    string | null

  original_debt:
    number

  status:
    string

  created_at:
    string

  updated_at:
    string
}


const money =
  new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',

      currency: 'BRL',
    }
  )


export function CasesPage() {
  const navigate =
    useNavigate()

  const [
    cases,
    setCases,
  ] =
    useState<CaseRow[]>(
      []
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    message,
    setMessage,
  ] =
    useState('')


  async function load() {
    setLoading(true)

    const {
      data,
      error,
    } =
      await supabase
        .from(
          'adv_cases'
        )
        .select(`
          id,
          client_name,
          client_reference,
          process_number,
          bank_name,
          original_debt,
          status,
          created_at,
          updated_at
        `)
        .order(
          'updated_at',
          {
            ascending:
              false,
          }
        )

    if (error) {
      setMessage(
        error.message
      )
    }

    setCases((data ?? []) as CaseRow[])

    setLoading(false)
  }


  useEffect(() => {
    void load()
  }, [])


  async function deleteCase(
    item: CaseRow
  ) {
    const name =
      item.client_name ||
      item.client_reference ||
      'este caso'

    const confirmed =
      window.confirm(
        `Excluir definitivamente ${name}?`
      )

    if (!confirmed) {
      return
    }

    const {
      error,
    } =
      await supabase
        .from(
          'adv_cases'
        )
        .delete()
        .eq(
          'id',
          item.id
        )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setMessage(
      'Caso excluído.'
    )

    await load()
  }


  return (
    <div className="page">

      <div className="page-heading">
        <span className="eyebrow">
          CASOS
        </span>

        <h1>
          Casos e análises
        </h1>

        <p>
          Reabra uma análise anterior, atualize os
          dados ou exclua casos que não são mais
          necessários.
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
          cases.length ===
            0 && (
            <div className="empty-state">

              <BriefcaseBusiness
                size={28}
              />

              <strong>
                Nenhum caso salvo
              </strong>

              <span>
                Os casos criados nas calculadoras
                aparecerão aqui.
              </span>

            </div>
          )}


        <div className="case-list">

          {cases.map(
            (item) => (
              <article
                key={item.id}
                className="case-list-item"
              >

                <div className="case-list-main">

                  <span className="case-type">
                    ROTATIVO DO CARTÃO
                  </span>

                  <strong>
                    {item.client_name ||
                      item.client_reference ||
                      'Caso sem identificação'}
                  </strong>

                  <div className="case-meta">

                    {item.bank_name && (
                      <span>
                        {item.bank_name}
                      </span>
                    )}

                    {item.process_number && (
                      <span>
                        Processo: {item.process_number}
                      </span>
                    )}

                    <span>
                      Atualizado em{' '}
                      {new Date(
                        item.updated_at ||
                        item.created_at
                      ).toLocaleDateString(
                        'pt-BR'
                      )}
                    </span>

                  </div>

                </div>


                <div className="case-list-value">

                  <span>
                    VALOR ORIGINAL
                  </span>

                  <strong>
                    {money.format(
                      Number(
                        item.original_debt
                      )
                    )}
                  </strong>

                </div>


                <div className="case-list-actions">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      navigate(
                        `/app/calculadoras/bancario/rotativo/${item.id}`
                      )
                    }
                  >
                    <ExternalLink
                      size={15}
                    />

                    Abrir
                  </button>


                  <button
                    type="button"
                    className="case-delete-button"
                    onClick={() =>
                      void deleteCase(
                        item
                      )
                    }
                  >
                    <Trash2
                      size={15}
                    />
                  </button>

                </div>

              </article>
            )
          )}

        </div>

      </section>

    </div>
  )
}
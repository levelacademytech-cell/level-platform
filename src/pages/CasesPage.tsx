import {
  BriefcaseBusiness,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  supabase,
} from '../lib/supabase'

interface CaseRow {
  id: string
  client_reference:
    string | null
  bank_name:
    string | null
  original_debt: number
  status: string
  created_at: string
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
  const [cases, setCases] =
    useState<CaseRow[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    void supabase
      .from('adv_cases')
      .select(`
        id,
        client_reference,
        bank_name,
        original_debt,
        status,
        created_at
      `)
      .order(
        'created_at',
        {
          ascending: false,
        }
      )
      .then(({ data }) => {
        setCases((data ?? []) as CaseRow[])

        setLoading(false)
      })
  }, [])

  return (
    <div className="page">
      <div className="page-heading">
        <span className="eyebrow">
          CASOS
        </span>

        <h1>
          Casos salvos
        </h1>

        <p>
          Analises registradas pelo
          usuario na plataforma.
        </p>
      </div>

      <section className="panel">
        {loading && (
          <div className="empty-state">
            Carregando...
          </div>
        )}

        {!loading &&
          cases.length === 0 && (
            <div className="empty-state">
              <BriefcaseBusiness
                size={28}
              />

              <strong>
                Nenhum caso salvo
              </strong>

              <span>
                Seus calculos salvos
                aparecerao aqui.
              </span>
            </div>
          )}

        <div className="simple-list">
          {cases.map((item) => (
            <article
              key={item.id}
            >
              <div>
                <strong>
                  {item.client_reference ||
                    'Caso sem referencia'}
                </strong>

                <span>
                  {item.bank_name ||
                    'Instituicao nao informada'}
                </span>
              </div>

              <div>
                <strong>
                  {money.format(
                    Number(
                      item.original_debt
                    )
                  )}
                </strong>

                <span>
                  {new Date(
                    item.created_at
                  ).toLocaleDateString(
                    'pt-BR'
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
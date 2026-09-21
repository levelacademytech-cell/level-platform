import {
  Bot,
  BriefcaseBusiness,
  Calculator,
  FileText,
  Plus,
  Sparkles,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  supabase,
} from '../lib/supabase'

export function DashboardPage() {
  const [cases, setCases] =
    useState(0)

  const [documents, setDocuments] =
    useState(0)

  const [requests, setRequests] =
    useState(0)

  useEffect(() => {
    void Promise.all([
      supabase
        .from('adv_cases')
        .select(
          'id',
          {
            count: 'exact',
            head: true,
          }
        ),

      supabase
        .from('adv_documents')
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
        .select(
          'id',
          {
            count: 'exact',
            head: true,
          }
        ),
    ]).then(
      ([
        caseResult,
        documentResult,
        requestResult,
      ]) => {
        setCases(
          caseResult.count ?? 0
        )

        setDocuments(
          documentResult.count ?? 0
        )

        setRequests(
          requestResult.count ?? 0
        )
      }
    )
  }, [])

  return (
    <div className="page">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">
            LEVEL ADV
          </span>

          <h1>
            Seu centro de
            inteligência jurídica.
          </h1>

          <p>
            Calcule, organize casos,
            analise documentos e
            centralize ferramentas
            para sua equipe.
          </p>

          <div className="hero-actions">
            <Link
              className="primary-button"
              to="/app/calculadoras/bancario/rotativo"
            >
              <Calculator size={17} />
              Nova análise
            </Link>

            <Link
              className="secondary-button"
              to="/app/calculadoras"
            >
              Ver calculadoras
            </Link>
          </div>
        </div>

        <div className="hero-mark">
          <Sparkles size={45} />
          <strong>ADV</strong>
        </div>
      </section>

      <section className="stats-grid">
        <article>
          <BriefcaseBusiness
            size={20}
          />

          <span>Casos</span>
          <strong>{cases}</strong>
        </article>

        <article>
          <FileText size={20} />

          <span>Documentos</span>
          <strong>
            {documents}
          </strong>
        </article>

        <article>
          <Bot size={20} />

          <span>
            Analises solicitadas
          </span>

          <strong>
            {requests}
          </strong>
        </article>

        <article className="gold-stat">
          <Plus size={20} />

          <span>
            Primeira ferramenta
          </span>

          <strong>
            Rotativo
          </strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <span className="eyebrow">
            CALCULADORA EM DESTAQUE
          </span>

          <h2>
            Cartão de crédito:
            rotativo e encargos
          </h2>

          <p>
            Lance os valores mês a
            mês ou importe uma
            planilha e obtenha uma
            visão consolidada dos
            encargos.
          </p>

          <Link
            to="/app/calculadoras/bancario/rotativo"
            className="text-link"
          >
            Abrir calculadora →
          </Link>
        </article>

        <article className="panel ai-panel">
          <span className="eyebrow">
            EM LANÇAMENTO
          </span>

          <h2>
            LEVEL IA
          </h2>

          <p>
            A inteligência jurídica
            da LEVEL será usada para
            auxiliar na leitura,
            organização e análise de
            documentos.
          </p>

          <Link
            to="/app/ia"
            className="text-link"
          >
            Conhecer LEVEL IA →
          </Link>
        </article>
      </section>
    </div>
  )
}
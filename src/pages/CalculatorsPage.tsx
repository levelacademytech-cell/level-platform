import {
  Banknote,
  BriefcaseBusiness,
  Calculator,
  Gavel,
  Landmark,
  ReceiptText,
  Scale,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

const categories = [
  {
    name: 'Bancario',
    description:
      'Juros, cartao, financiamentos, amortizacao e revisoes.',
    icon: Landmark,
    active: true,
    path:
      '/app/calculadoras/bancario',
  },
  {
    name: 'Previdenciario',
    description:
      'Beneficios, contribuicoes, tempo e planejamento.',
    icon: Scale,
    active: false,
  },
  {
    name: 'Trabalhista',
    description:
      'Rescisao, ferias, FGTS, horas extras e salarios.',
    icon: BriefcaseBusiness,
    active: false,
  },
  {
    name: 'Civel',
    description:
      'Atualizacao, indenizacoes, prazos e calculos judiciais.',
    icon: Gavel,
    active: false,
  },
  {
    name: 'Tributario',
    description:
      'Tributos, restituicoes, ICMS, IR e atualizacoes.',
    icon: ReceiptText,
    active: false,
  },
  {
    name: 'Penal',
    description:
      'Pena, regime, progressao e parametros de calculo.',
    icon: Calculator,
    active: false,
  },
  {
    name: 'Utilidades',
    description:
      'Ferramentas auxiliares para o trabalho juridico.',
    icon: Banknote,
    active: false,
  },
]

export function CalculatorsPage() {
  return (
    <div className="page">
      <div className="page-heading">
        <span className="eyebrow">
          FERRAMENTAS
        </span>

        <h1>
          Calculadoras
        </h1>

        <p>
          Ferramentas organizadas
          por área jurídica. Novos
          módulos serão liberados
          progressivamente.
        </p>
      </div>

      <div className="category-grid">
        {categories.map(
          (category) => {
            const Icon =
              category.icon

            const content = (
              <>
                <div className="category-icon">
                  <Icon size={22} />
                </div>

                <span
                  className={
                    category.active
                      ? 'status available'
                      : 'status'
                  }
                >
                  {category.active
                    ? 'DISPONIVEL'
                    : 'EM DESENVOLVIMENTO'}
                </span>

                <h2>
                  {category.name}
                </h2>

                <p>
                  {
                    category.description
                  }
                </p>

                <strong>
                  {category.active
                    ? 'Abrir categoria →'
                    : 'Em breve'}
                </strong>
              </>
            )

            if (
              category.active &&
              category.path
            ) {
              return (
                <Link
                  className="category-card active-card"
                  key={category.name}
                  to={category.path}
                >
                  {content}
                </Link>
              )
            }

            return (
              <article
                className="category-card disabled-card"
                key={category.name}
              >
                {content}
              </article>
            )
          }
        )}
      </div>
    </div>
  )
}
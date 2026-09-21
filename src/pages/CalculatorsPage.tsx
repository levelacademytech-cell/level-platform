import {
  BriefcaseBusiness,
  Calculator,
  Gavel,
  Landmark,
  ReceiptText,
  Scale,
  Wrench,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

const categories = [
  {
    id: 'bancario',
    title: 'Bancário',
    description:
      'Cartão, juros, financiamento, amortização, CET e comparação de taxas.',
    icon: Landmark,
  },
  {
    id: 'previdenciario',
    title: 'Previdenciário',
    description:
      'INSS, contribuição, pedágio, fator e honorários.',
    icon: Scale,
  },
  {
    id: 'trabalhista',
    title: 'Trabalhista',
    description:
      'Férias, rescisão, FGTS, horas extras, 13º e salário líquido.',
    icon: BriefcaseBusiness,
  },
  {
    id: 'tributario',
    title: 'Tributário',
    description:
      'IR, ITCMD e simulações de bases tributárias.',
    icon: ReceiptText,
  },
  {
    id: 'civel',
    title: 'Cível',
    description:
      'Pensão, execução, atualização e contagem de datas.',
    icon: Gavel,
  },
  {
    id: 'penal',
    title: 'Penal',
    description:
      'Simulações aritméticas de pena e progressão.',
    icon: Calculator,
  },
  {
    id: 'utilidades',
    title: 'Utilidades',
    description:
      'Percentuais, honorários e contagem de dias úteis.',
    icon: Wrench,
  },
]

export function CalculatorsPage() {
  return (
    <div className="page">

      <div className="page-heading">
        <span className="eyebrow">
          LEVEL ADV / FERRAMENTAS
        </span>

        <h1>
          Calculadoras
        </h1>

        <p>
          Escolha uma área jurídica.
          Todas as categorias abaixo
          já possuem ferramentas
          funcionais.
        </p>
      </div>


      <div className="category-grid">

        {categories.map(
          (category) => {
            const Icon =
              category.icon

            return (
              <Link
                key={
                  category.id
                }
                to={`/app/calculadoras/${category.id}`}
                className="category-card active-card"
              >
                <div className="category-icon">
                  <Icon size={22} />
                </div>

                <span className="status available">
                  DISPONÍVEL
                </span>

                <h2>
                  {
                    category.title
                  }
                </h2>

                <p>
                  {
                    category.description
                  }
                </p>

                <strong>
                  Ver calculadoras →
                </strong>
              </Link>
            )
          }
        )}

      </div>

    </div>
  )
}
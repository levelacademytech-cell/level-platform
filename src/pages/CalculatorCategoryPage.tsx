import {
  ArrowLeft,
  Calculator,
  CreditCard,
} from 'lucide-react'

import {
  Link,
  Navigate,
  useParams,
} from 'react-router-dom'

import {
  calculators,
  categoryLabels,
} from '../data/calculatorCatalog'


export function CalculatorCategoryPage() {
  const {
    category,
  } =
    useParams()

  if (
    !category ||
    !categoryLabels[category]
  ) {
    return (
      <Navigate
        to="/app/calculadoras"
        replace
      />
    )
  }

  const items =
    calculators.filter(
      (item) =>
        item.category ===
        category
    )

  return (
    <div className="page">

      <Link
        to="/app/calculadoras"
        className="calculator-back"
      >
        <ArrowLeft size={15} />
        Todas as categorias
      </Link>

      <div className="page-heading">
        <span className="eyebrow">
          CALCULADORAS
        </span>

        <h1>
          {categoryLabels[category]}
        </h1>

        <p>
          Selecione uma ferramenta
          para iniciar o cálculo.
        </p>
      </div>

      <div className="tools-grid">

        {category ===
          'bancario' && (
          <Link
            to="/app/calculadoras/bancario/rotativo"
            className="tool-card active-card"
          >
            <div className="tool-top">
              <div className="tool-icon">
                <CreditCard
                  size={20}
                />
              </div>

              <span className="status available">
                COMPLETA
              </span>
            </div>

            <h2>
              Rotativo do cartão
            </h2>

            <p>
              Analise faturas,
              juros, taxas,
              encargos e possível
              excedente.
            </p>

            <strong>
              Abrir calculadora →
            </strong>
          </Link>
        )}

        {items.map(
          (item) => (
            <Link
              key={item.id}
              to={`/app/calculadoras/${item.category}/${item.id}`}
              className="tool-card active-card"
            >
              <div className="tool-top">
                <div className="tool-icon">
                  <Calculator
                    size={20}
                  />
                </div>

                <span className="status available">
                  DISPONÍVEL
                </span>
              </div>

              <h2>
                {item.title}
              </h2>

              <p>
                {
                  item.description
                }
              </p>

              <strong>
                Calcular →
              </strong>
            </Link>
          )
        )}

      </div>

    </div>
  )
}
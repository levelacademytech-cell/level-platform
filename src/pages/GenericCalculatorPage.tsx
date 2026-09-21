import {
  ArrowLeft,
  Calculator,
  Info,
  Printer,
  RotateCcw,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  Navigate,
  useParams,
} from 'react-router-dom'

import {
  calculators,
} from '../data/calculatorCatalog'

import {
  calculate,
  type CalculationResult,
} from '../lib/calculatorEngine'


const money =
  new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )


function formatResult(
  result: CalculationResult
) {
  if (
    result.format ===
    'money'
  ) {
    return money.format(
      result.value
    )
  }

  if (
    result.format ===
    'percent'
  ) {
    return (
      result.value
        .toLocaleString(
          'pt-BR',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          }
        ) +
      '%'
    )
  }

  if (
    result.format ===
    'days'
  ) {
    return (
      result.value
        .toLocaleString(
          'pt-BR',
          {
            maximumFractionDigits: 2,
          }
        ) +
      ' dias'
    )
  }

  if (
    result.format ===
    'months'
  ) {
    return (
      result.value
        .toLocaleString(
          'pt-BR',
          {
            maximumFractionDigits: 2,
          }
        ) +
      ' meses'
    )
  }

  return result.value
    .toLocaleString(
      'pt-BR',
      {
        maximumFractionDigits: 6,
      }
    )
}


export function GenericCalculatorPage() {
  const {
    category,
    slug,
  } =
    useParams()

  const definition =
    useMemo(
      () =>
        calculators.find(
          (item) =>
            item.category ===
              category &&
            item.id === slug
        ),
      [
        category,
        slug,
      ]
    )

  const [
    values,
    setValues,
  ] =
    useState<
      Record<string, string>
    >({})


  const [
    results,
    setResults,
  ] =
    useState<
      CalculationResult[]
    >([])


  useEffect(() => {
    if (!definition) {
      return
    }

    const defaults:
      Record<
        string,
        string
      > = {}

    for (
      const field of
      definition.fields
    ) {
      defaults[field.key] =
        field.defaultValue ??
        ''
    }

    setValues(defaults)
    setResults([])
  }, [definition])


  if (!definition) {
    return (
      <Navigate
        to="/app/calculadoras"
        replace
      />
    )
  }


  function runCalculation() {
    setResults(
      calculate(
        definition!.id,
        values
      )
    )
  }


  function reset() {
    const defaults:
      Record<
        string,
        string
      > = {}

    for (
      const field of
      definition!.fields
    ) {
      defaults[field.key] =
        field.defaultValue ??
        ''
    }

    setValues(defaults)
    setResults([])
  }


  return (
    <div className="page">

      <Link
        to={`/app/calculadoras/${definition.category}`}
        className="calculator-back"
      >
        <ArrowLeft size={15} />

        Voltar para{' '}
        {
          definition.categoryLabel
        }
      </Link>


      <div className="page-heading">
        <span className="eyebrow">
          {
            definition.categoryLabel
          }
          {' / CALCULADORA'}
        </span>

        <h1>
          {definition.title}
        </h1>

        <p>
          {
            definition.description
          }
        </p>
      </div>


      <section className="generic-calculator-layout">

        <div className="panel">

          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                DADOS
              </span>

              <h2>
                Informações do cálculo
              </h2>
            </div>

            <Calculator
              size={23}
            />
          </div>


          <div className="generic-fields">

            {definition.fields.map(
              (field) => (
                <label
                  key={
                    field.key
                  }
                >
                  {field.label}

                  {field.type ===
                  'select' ? (
                    <select
                      value={
                        values[
                          field.key
                        ] ?? ''
                      }
                      onChange={(
                        event
                      ) =>
                        setValues(
                          (
                            current
                          ) => ({
                            ...current,

                            [field.key]:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                    >
                      {field.options?.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <input
                      type={
                        field.type ===
                        'date'
                          ? 'date'
                          : 'number'
                      }
                      step={
                        field.type ===
                        'date'
                          ? undefined
                          : '0.01'
                      }
                      value={
                        values[
                          field.key
                        ] ?? ''
                      }
                      placeholder={
                        field.placeholder
                      }
                      onChange={(
                        event
                      ) =>
                        setValues(
                          (
                            current
                          ) => ({
                            ...current,

                            [field.key]:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                    />
                  )}

                  {field.suffix && (
                    <small>
                      {field.suffix}
                    </small>
                  )}
                </label>
              )
            )}

          </div>


          <button
            type="button"
            className="primary-button generic-run"
            onClick={
              runCalculation
            }
          >
            <Calculator
              size={16}
            />

            Calcular
          </button>

        </div>


        <div className="panel generic-result-panel">

          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                RESULTADO
              </span>

              <h2>
                Memória do cálculo
              </h2>
            </div>
          </div>


          {results.length ===
            0 ? (
            <div className="generic-empty">
              Informe os dados e
              clique em calcular.
            </div>
          ) : (
            <div className="generic-results">

              {results.map(
                (
                  result,
                  index
                ) => (
                  <article
                    key={
                      `${result.label}-${index}`
                    }
                  >
                    <span>
                      {
                        result.label
                      }
                    </span>

                    <strong>
                      {formatResult(
                        result
                      )}
                    </strong>

                    {result.note && (
                      <small>
                        {
                          result.note
                        }
                      </small>
                    )}
                  </article>
                )
              )}

            </div>
          )}


          <div className="generic-result-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={reset}
            >
              <RotateCcw
                size={15}
              />

              Limpar
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                window.print()
              }
            >
              <Printer
                size={15}
              />

              Imprimir / PDF
            </button>

          </div>

        </div>

      </section>


      {definition.sourceNote && (
        <section className="legal-box">
          <Info size={21} />

          <div>
            <strong>
              Atenção
            </strong>

            <p>
              {
                definition.sourceNote
              }
            </p>
          </div>
        </section>
      )}


      <section className="legal-box">
        <Info size={21} />

        <div>
          <strong>
            Ferramenta de apoio
          </strong>

          <p>
            O resultado é matemático e
            depende integralmente dos
            dados informados. Em cálculos
            jurídicos sujeitos a índices,
            tabelas, legislação, decisões,
            convenções ou particularidades
            do caso, confirme os parâmetros
            aplicáveis antes de utilizar o
            resultado profissionalmente.
          </p>
        </div>
      </section>

    </div>
  )
}
import {
  BadgePercent,
  Banknote,
  Calculator,
  ChartNoAxesCombined,
  CreditCard,
  Landmark,
  Percent,
  Scale,
  WalletCards,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

const tools = [
  {
    title:
      'Rotativo do Cartao',
    description:
      'Analise juros, parcelamento, mora, multa e outros encargos mes a mes.',
    icon: CreditCard,
    available: true,
    path:
      '/app/calculadoras/bancario/rotativo',
  },
  {
    title:
      'Juros Simples e Compostos',
    description:
      'Calculo de capital, juros, taxas e periodos.',
    icon: Percent,
  },
  {
    title:
      'PRICE, SAC e SACRE',
    description:
      'Amortizacao, parcelas, juros e evolucao do saldo.',
    icon: Calculator,
  },
  {
    title:
      'Financiamentos e Emprestimos',
    description:
      'Analise contratos e evolucao financeira da operacao.',
    icon: Banknote,
  },
  {
    title:
      'Taxa Media BACEN',
    description:
      'Comparacao da taxa contratada com referencias do Banco Central.',
    icon: Landmark,
  },
  {
    title:
      'CET e Taxa Efetiva',
    description:
      'Analise do custo efetivo total e taxas equivalentes.',
    icon: BadgePercent,
  },
  {
    title:
      'Superendividamento',
    description:
      'Organizacao de dividas, comprometimento de renda e cenarios.',
    icon: WalletCards,
  },
  {
    title:
      'Revisional Bancaria',
    description:
      'Estrutura para revisao de contratos e encargos informados.',
    icon: Scale,
  },
  {
    title:
      'Evolucao da Divida',
    description:
      'Visualizacao da evolucao mensal do saldo e encargos.',
    icon: ChartNoAxesCombined,
  },
]

export function BankingPage() {
  return (
    <div className="page">
      <div className="page-heading">
        <span className="eyebrow">
          CALCULADORAS / BANCARIO
        </span>

        <h1>
          Ferramentas bancarias
        </h1>

        <p>
          Analises financeiras
          estruturadas para auxiliar
          a revisao documental e os
          calculos do escritorio.
        </p>
      </div>

      <div className="tools-grid">
        {tools.map((tool) => {
          const Icon = tool.icon

          const content = (
            <>
              <div className="tool-top">
                <div className="tool-icon">
                  <Icon size={20} />
                </div>

                <span
                  className={
                    tool.available
                      ? 'status available'
                      : 'status'
                  }
                >
                  {tool.available
                    ? 'DISPONIVEL'
                    : 'EM BREVE'}
                </span>
              </div>

              <h2>
                {tool.title}
              </h2>

              <p>
                {tool.description}
              </p>

              <strong>
                {tool.available
                  ? 'Abrir calculadora →'
                  : 'Em desenvolvimento'}
              </strong>
            </>
          )

          if (
            tool.available &&
            tool.path
          ) {
            return (
              <Link
                to={tool.path}
                key={tool.title}
                className="tool-card active-card"
              >
                {content}
              </Link>
            )
          }

          return (
            <article
              key={tool.title}
              className="tool-card disabled-card"
            >
              {content}
            </article>
          )
        })}
      </div>
    </div>
  )
}
export type CalculationResult = {
  label: string
  value: number
  format?: 'money' | 'percent' | 'number' | 'days' | 'months'
  note?: string
}

type Values = Record<string, string>

function n(
  values: Values,
  key: string
) {
  const value =
    Number(
      String(
        values[key] ?? '0'
      )
        .replace(',', '.')
    )

  return Number.isFinite(value)
    ? value
    : 0
}

function pricePayment(
  principal: number,
  monthlyRatePercent: number,
  months: number
) {
  if (
    principal <= 0 ||
    months <= 0
  ) {
    return 0
  }

  const rate =
    monthlyRatePercent / 100

  if (rate === 0) {
    return principal / months
  }

  return (
    principal *
    (
      rate *
      Math.pow(
        1 + rate,
        months
      )
    ) /
    (
      Math.pow(
        1 + rate,
        months
      ) - 1
    )
  )
}

function progressiveInss2026(
  salary: number
) {
  const capped =
    Math.min(
      Math.max(
        salary,
        0
      ),
      8475.55
    )

  const brackets = [
    {
      from: 0,
      to: 1621,
      rate: 0.075,
    },
    {
      from: 1621,
      to: 2902.84,
      rate: 0.09,
    },
    {
      from: 2902.84,
      to: 4354.27,
      rate: 0.12,
    },
    {
      from: 4354.27,
      to: 8475.55,
      rate: 0.14,
    },
  ]

  let total = 0

  for (
    const bracket of brackets
  ) {
    const taxable =
      Math.max(
        0,
        Math.min(
          capped,
          bracket.to
        ) -
        bracket.from
      )

    total +=
      taxable *
      bracket.rate
  }

  return total
}

function ir2026(
  base: number
) {
  const taxable =
    Math.max(
      base,
      0
    )

  let grossTax = 0

  if (
    taxable <= 2428.80
  ) {
    grossTax = 0
  } else if (
    taxable <= 2826.65
  ) {
    grossTax =
      taxable * 0.075 -
      182.16
  } else if (
    taxable <= 3751.05
  ) {
    grossTax =
      taxable * 0.15 -
      394.16
  } else if (
    taxable <= 4664.68
  ) {
    grossTax =
      taxable * 0.225 -
      675.49
  } else {
    grossTax =
      taxable * 0.275 -
      908.73
  }

  grossTax =
    Math.max(
      grossTax,
      0
    )

  let reduction = 0

  if (
    taxable <= 5000
  ) {
    reduction =
      grossTax
  } else if (
    taxable <= 7350
  ) {
    reduction =
      Math.min(
        grossTax,
        Math.max(
          0,
          978.62 -
          (
            0.133145 *
            taxable
          )
        )
      )
  }

  return Math.max(
    0,
    grossTax - reduction
  )
}

function businessDays(
  startValue: string,
  endValue: string
) {
  if (
    !startValue ||
    !endValue
  ) {
    return 0
  }

  const start =
    new Date(
      `${startValue}T12:00:00`
    )

  const end =
    new Date(
      `${endValue}T12:00:00`
    )

  if (
    Number.isNaN(
      start.getTime()
    ) ||
    Number.isNaN(
      end.getTime()
    ) ||
    end < start
  ) {
    return 0
  }

  let days = 0

  const cursor =
    new Date(start)

  while (
    cursor <= end
  ) {
    const weekday =
      cursor.getDay()

    if (
      weekday !== 0 &&
      weekday !== 6
    ) {
      days++
    }

    cursor.setDate(
      cursor.getDate() + 1
    )
  }

  return days
}

function calendarDays(
  startValue: string,
  endValue: string
) {
  if (
    !startValue ||
    !endValue
  ) {
    return 0
  }

  const start =
    new Date(
      `${startValue}T12:00:00`
    )

  const end =
    new Date(
      `${endValue}T12:00:00`
    )

  if (
    Number.isNaN(
      start.getTime()
    ) ||
    Number.isNaN(
      end.getTime()
    ) ||
    end < start
  ) {
    return 0
  }

  return Math.floor(
    (
      end.getTime() -
      start.getTime()
    ) /
    86400000
  ) + 1
}

function estimatedMonthlyIrr(
  received: number,
  installment: number,
  months: number
) {
  if (
    received <= 0 ||
    installment <= 0 ||
    months <= 0
  ) {
    return 0
  }

  let low = 0
  let high = 5

  for (
    let iteration = 0;
    iteration < 120;
    iteration++
  ) {
    const rate =
      (
        low + high
      ) / 2

    let presentValue = 0

    for (
      let month = 1;
      month <= months;
      month++
    ) {
      presentValue +=
        installment /
        Math.pow(
          1 + rate,
          month
        )
    }

    if (
      presentValue >
      received
    ) {
      low = rate
    } else {
      high = rate
    }
  }

  return (
    (
      low + high
    ) / 2
  ) * 100
}

export function calculate(
  id: string,
  values: Values
): CalculationResult[] {

  switch (id) {

    case 'juros': {
      const capital =
        n(values, 'capital')

      const rate =
        n(values, 'rate') /
        100

      const periods =
        n(values, 'periods')

      const method =
        values.method ??
        'compound'

      const future =
        method === 'simple'
          ? capital *
            (
              1 +
              rate *
              periods
            )
          : capital *
            Math.pow(
              1 + rate,
              periods
            )

      return [
        {
          label: 'Montante',
          value: future,
          format: 'money',
        },
        {
          label: 'Juros',
          value:
            future -
            capital,
          format: 'money',
        },
      ]
    }


    case 'price': {
      const principal =
        n(values, 'principal')

      const rate =
        n(values, 'rate')

      const months =
        n(values, 'months')

      const payment =
        pricePayment(
          principal,
          rate,
          months
        )

      const total =
        payment * months

      return [
        {
          label: 'Parcela',
          value: payment,
          format: 'money',
        },
        {
          label: 'Juros totais',
          value:
            total -
            principal,
          format: 'money',
        },
        {
          label: 'Total pago',
          value: total,
          format: 'money',
        },
      ]
    }


    case 'sac': {
      const principal =
        n(values, 'principal')

      const rate =
        n(values, 'rate') /
        100

      const months =
        n(values, 'months')

      if (
        months <= 0
      ) {
        return []
      }

      const amortization =
        principal /
        months

      const first =
        amortization +
        principal * rate

      const last =
        amortization +
        amortization *
        rate

      const totalInterest =
        rate *
        principal *
        (
          months + 1
        ) /
        2

      return [
        {
          label: 'Amortização mensal',
          value: amortization,
          format: 'money',
        },
        {
          label: 'Primeira parcela',
          value: first,
          format: 'money',
        },
        {
          label: 'Última parcela',
          value: last,
          format: 'money',
        },
        {
          label: 'Juros totais',
          value: totalInterest,
          format: 'money',
        },
        {
          label: 'Total estimado',
          value:
            principal +
            totalInterest,
          format: 'money',
        },
      ]
    }


    case 'financiamento': {
      const price =
        n(values, 'price')

      const down =
        n(values, 'down')

      const financed =
        Math.max(
          0,
          price - down
        )

      const rate =
        n(values, 'rate')

      const months =
        n(values, 'months')

      const payment =
        pricePayment(
          financed,
          rate,
          months
        )

      const financedTotal =
        payment * months

      return [
        {
          label: 'Saldo financiado',
          value: financed,
          format: 'money',
        },
        {
          label: 'Parcela',
          value: payment,
          format: 'money',
        },
        {
          label: 'Juros',
          value:
            financedTotal -
            financed,
          format: 'money',
        },
        {
          label: 'Desembolso total',
          value:
            down +
            financedTotal,
          format: 'money',
        },
      ]
    }


    case 'bacen': {
      const principal =
        n(values, 'principal')

      const contractRate =
        n(values, 'contractRate')

      const referenceRate =
        n(values, 'referenceRate')

      const months =
        n(values, 'months')

      const contractPayment =
        pricePayment(
          principal,
          contractRate,
          months
        )

      const referencePayment =
        pricePayment(
          principal,
          referenceRate,
          months
        )

      return [
        {
          label: 'Parcela na taxa contratada',
          value: contractPayment,
          format: 'money',
        },
        {
          label: 'Parcela na taxa de referência',
          value: referencePayment,
          format: 'money',
        },
        {
          label: 'Diferença mensal estimada',
          value:
            contractPayment -
            referencePayment,
          format: 'money',
        },
        {
          label: 'Diferença total estimada',
          value:
            (
              contractPayment -
              referencePayment
            ) *
            months,
          format: 'money',
        },
        {
          label: 'Diferença entre taxas',
          value:
            contractRate -
            referenceRate,
          format: 'percent',
        },
      ]
    }


    case 'cet': {
      const received =
        n(values, 'received')

      const installment =
        n(values, 'installment')

      const months =
        n(values, 'months')

      const monthly =
        estimatedMonthlyIrr(
          received,
          installment,
          months
        )

      const annual =
        (
          Math.pow(
            1 +
            monthly / 100,
            12
          ) - 1
        ) * 100

      return [
        {
          label: 'CET mensal estimado',
          value: monthly,
          format: 'percent',
        },
        {
          label: 'CET anual equivalente',
          value: annual,
          format: 'percent',
        },
        {
          label: 'Total das parcelas',
          value:
            installment *
            months,
          format: 'money',
        },
      ]
    }


    case 'reajuste': {
      const value =
        n(values, 'value')

      const index =
        n(values, 'index')

      const adjustment =
        value *
        index /
        100

      return [
        {
          label: 'Reajuste',
          value: adjustment,
          format: 'money',
        },
        {
          label: 'Novo valor',
          value:
            value +
            adjustment,
          format: 'money',
        },
      ]
    }


    case 'inss-2026': {
      const salary =
        n(values, 'salary')

      const contribution =
        progressiveInss2026(
          salary
        )

      return [
        {
          label: 'Contribuição',
          value: contribution,
          format: 'money',
        },
        {
          label: 'Alíquota efetiva',
          value:
            salary > 0
              ? (
                  contribution /
                  salary
                ) * 100
              : 0,
          format: 'percent',
        },
      ]
    }


    case 'hora-mensal': {
      const hourly =
        n(values, 'hourly')

      const weekly =
        n(values, 'weekly')

      const monthlyHours =
        weekly * 5

      return [
        {
          label: 'Horas mensais estimadas',
          value: monthlyHours,
          format: 'number',
        },
        {
          label: 'Salário mensal estimado',
          value:
            hourly *
            monthlyHours,
          format: 'money',
        },
      ]
    }


    case 'fator-previdenciario': {
      const age =
        n(values, 'age')

      const contribution =
        n(
          values,
          'contribution'
        )

      const lifeExpectancy =
        n(
          values,
          'lifeExpectancy'
        )

      const aliquot = 0.31

      const factor =
        lifeExpectancy > 0
          ? (
              contribution *
              aliquot /
              lifeExpectancy
            ) *
            (
              1 +
              (
                age +
                contribution *
                aliquot
              ) /
              100
            )
          : 0

      return [
        {
          label: 'Fator estimado',
          value: factor,
          format: 'number',
        },
      ]
    }


    case 'pedagio': {
      const missing =
        n(
          values,
          'missingMonths'
        )

      const rate =
        n(values, 'rate')

      const extra =
        missing *
        rate /
        100

      return [
        {
          label: 'Tempo originalmente faltante',
          value: missing,
          format: 'months',
        },
        {
          label: 'Pedágio adicional',
          value: extra,
          format: 'months',
        },
        {
          label: 'Total estimado',
          value:
            missing +
            extra,
          format: 'months',
        },
      ]
    }


    case 'honorarios-previdenciarios':
    case 'honorarios': {
      const base =
        n(values, 'base')

      const percent =
        n(values, 'percent')

      return [
        {
          label: 'Honorários',
          value:
            base *
            percent /
            100,
          format: 'money',
        },
      ]
    }


    case 'ferias': {
      const salary =
        n(values, 'salary')

      const extras =
        n(values, 'extras')

      const days =
        n(values, 'days')

      const base =
        (
          salary +
          extras
        ) *
        days /
        30

      const third =
        base / 3

      return [
        {
          label: 'Remuneração das férias',
          value: base,
          format: 'money',
        },
        {
          label: 'Adicional de 1/3',
          value: third,
          format: 'money',
        },
        {
          label: 'Total bruto',
          value:
            base +
            third,
          format: 'money',
        },
      ]
    }


    case 'horas-extras': {
      const salary =
        n(values, 'salary')

      const divisor =
        n(values, 'divisor')

      const hours =
        n(values, 'hours')

      const additional =
        n(
          values,
          'additional'
        )

      const hourly =
        divisor > 0
          ? salary /
            divisor
          : 0

      const overtimeHourly =
        hourly *
        (
          1 +
          additional /
          100
        )

      return [
        {
          label: 'Hora normal',
          value: hourly,
          format: 'money',
        },
        {
          label: 'Hora extra',
          value: overtimeHourly,
          format: 'money',
        },
        {
          label: 'Total das horas extras',
          value:
            overtimeHourly *
            hours,
          format: 'money',
        },
      ]
    }


    case 'decimo-terceiro': {
      const salary =
        n(values, 'salary')

      const months =
        Math.min(
          12,
          Math.max(
            0,
            n(values, 'months')
          )
        )

      return [
        {
          label: '13º bruto proporcional',
          value:
            salary *
            months /
            12,
          format: 'money',
        },
      ]
    }


    case 'fgts': {
      const salary =
        n(values, 'salary')

      const months =
        n(values, 'months')

      const depositRate =
        n(
          values,
          'depositRate'
        )

      const fineRate =
        n(
          values,
          'fineRate'
        )

      const deposits =
        salary *
        months *
        depositRate /
        100

      const fine =
        deposits *
        fineRate /
        100

      return [
        {
          label: 'Depósitos estimados',
          value: deposits,
          format: 'money',
        },
        {
          label: 'Multa estimada',
          value: fine,
          format: 'money',
        },
        {
          label: 'Total',
          value:
            deposits +
            fine,
          format: 'money',
        },
      ]
    }


    case 'salario-liquido': {
      const gross =
        n(values, 'gross')

      const dependents =
        n(
          values,
          'dependents'
        )

      const other =
        n(values, 'other')

      const inss =
        progressiveInss2026(
          gross
        )

      const dependentDeduction =
        dependents *
        189.59

      const taxable =
        Math.max(
          0,
          gross -
          inss -
          dependentDeduction
        )

      const ir =
        ir2026(taxable)

      return [
        {
          label: 'INSS estimado',
          value: inss,
          format: 'money',
        },
        {
          label: 'Base estimada do IR',
          value: taxable,
          format: 'money',
        },
        {
          label: 'IRRF estimado',
          value: ir,
          format: 'money',
        },
        {
          label: 'Salário líquido estimado',
          value:
            gross -
            inss -
            ir -
            other,
          format: 'money',
        },
      ]
    }


    case 'rescisao': {
      const salary =
        n(values, 'salary')

      const workedDays =
        n(
          values,
          'workedDays'
        )

      const vacationMonths =
        n(
          values,
          'vacationMonths'
        )

      const thirteenthMonths =
        n(
          values,
          'thirteenthMonths'
        )

      const noticeDays =
        n(
          values,
          'noticeDays'
        )

      const salaryBalance =
        salary *
        workedDays /
        30

      const vacation =
        salary *
        vacationMonths /
        12

      const vacationThird =
        vacation / 3

      const thirteenth =
        salary *
        thirteenthMonths /
        12

      const notice =
        salary *
        noticeDays /
        30

      const total =
        salaryBalance +
        vacation +
        vacationThird +
        thirteenth +
        notice

      return [
        {
          label: 'Saldo de salário',
          value: salaryBalance,
          format: 'money',
        },
        {
          label: 'Férias proporcionais',
          value: vacation,
          format: 'money',
        },
        {
          label: '1/3 de férias',
          value: vacationThird,
          format: 'money',
        },
        {
          label: '13º proporcional',
          value: thirteenth,
          format: 'money',
        },
        {
          label: 'Aviso informado',
          value: notice,
          format: 'money',
        },
        {
          label: 'Total bruto estimado',
          value: total,
          format: 'money',
        },
      ]
    }


    case 'irrf-2026': {
      const income =
        n(values, 'income')

      const deductions =
        n(
          values,
          'deductions'
        )

      const base =
        Math.max(
          0,
          income -
          deductions
        )

      return [
        {
          label: 'Base de cálculo',
          value: base,
          format: 'money',
        },
        {
          label: 'IR mensal estimado',
          value:
            ir2026(base),
          format: 'money',
        },
      ]
    }


    case 'itcmd': {
      const base =
        n(values, 'base')

      const rate =
        n(values, 'rate')

      return [
        {
          label: 'ITCMD estimado',
          value:
            base *
            rate /
            100,
          format: 'money',
        },
        {
          label: 'Alíquota informada',
          value: rate,
          format: 'percent',
        },
      ]
    }


    case 'icms-piscofins': {
      const icms =
        n(values, 'icms')

      const pis =
        n(values, 'pis')

      const cofins =
        n(values, 'cofins')

      return [
        {
          label: 'Impacto PIS',
          value:
            icms *
            pis /
            100,
          format: 'money',
        },
        {
          label: 'Impacto COFINS',
          value:
            icms *
            cofins /
            100,
          format: 'money',
        },
        {
          label: 'Total matemático estimado',
          value:
            icms *
            (
              pis +
              cofins
            ) /
            100,
          format: 'money',
        },
      ]
    }


    case 'iss-piscofins': {
      const iss =
        n(values, 'iss')

      const pis =
        n(values, 'pis')

      const cofins =
        n(values, 'cofins')

      return [
        {
          label: 'Impacto matemático',
          value:
            iss *
            (
              pis +
              cofins
            ) /
            100,
          format: 'money',
        },
      ]
    }


    case 'pensao': {
      const income =
        n(values, 'income')

      const percent =
        n(values, 'percent')

      const beneficiaries =
        Math.max(
          1,
          n(
            values,
            'beneficiaries'
          )
        )

      const total =
        income *
        percent /
        100

      return [
        {
          label: 'Valor total simulado',
          value: total,
          format: 'money',
        },
        {
          label: 'Valor por beneficiário',
          value:
            total /
            beneficiaries,
          format: 'money',
        },
      ]
    }


    case 'honorarios-excesso': {
      const claimed =
        n(values, 'claimed')

      const recognized =
        n(
          values,
          'recognized'
        )

      const percent =
        n(values, 'percent')

      const excess =
        Math.max(
          0,
          claimed -
          recognized
        )

      return [
        {
          label: 'Excesso',
          value: excess,
          format: 'money',
        },
        {
          label: 'Honorários',
          value:
            excess *
            percent /
            100,
          format: 'money',
        },
      ]
    }


    case 'correcao': {
      const principal =
        n(
          values,
          'principal'
        )

      const index =
        n(values, 'index')

      const interest =
        n(
          values,
          'interest'
        )

      const corrected =
        principal *
        (
          1 +
          index /
          100
        )

      const interestValue =
        corrected *
        interest /
        100

      return [
        {
          label: 'Valor corrigido',
          value: corrected,
          format: 'money',
        },
        {
          label: 'Juros',
          value: interestValue,
          format: 'money',
        },
        {
          label: 'Total',
          value:
            corrected +
            interestValue,
          format: 'money',
        },
      ]
    }


    case 'dias':
    case 'dias-uteis': {
      const start =
        values.start ?? ''

      const end =
        values.end ?? ''

      return [
        {
          label: 'Dias corridos',
          value:
            calendarDays(
              start,
              end
            ),
          format: 'days',
        },
        {
          label: 'Dias úteis',
          value:
            businessDays(
              start,
              end
            ),
          format: 'days',
        },
      ]
    }


    case 'dosimetria': {
      const base =
        n(values, 'months')

      const phase2 =
        n(values, 'phase2')

      const phase3 =
        n(values, 'phase3')

      const after2 =
        base *
        (
          1 +
          phase2 /
          100
        )

      const after3 =
        after2 *
        (
          1 +
          phase3 /
          100
        )

      return [
        {
          label: 'Pena após 2ª fase',
          value: after2,
          format: 'months',
        },
        {
          label: 'Pena final aritmética',
          value: after3,
          format: 'months',
        },
      ]
    }


    case 'progressao': {
      const sentence =
        n(
          values,
          'sentenceDays'
        )

      const fraction =
        n(
          values,
          'fraction'
        )

      const served =
        n(values, 'served')

      const requirement =
        sentence *
        fraction /
        100

      return [
        {
          label: 'Requisito objetivo',
          value: requirement,
          format: 'days',
        },
        {
          label: 'Restante estimado',
          value:
            Math.max(
              0,
              requirement -
              served
            ),
          format: 'days',
        },
      ]
    }


    case 'porcentagem': {
      const value =
        n(values, 'value')

      const percent =
        n(values, 'percent')

      const amount =
        value *
        percent /
        100

      return [
        {
          label: 'Valor do percentual',
          value: amount,
          format: 'money',
        },
        {
          label: 'Com acréscimo',
          value:
            value +
            amount,
          format: 'money',
        },
        {
          label: 'Com redução',
          value:
            value -
            amount,
          format: 'money',
        },
      ]
    }


    default:
      return []
  }
}
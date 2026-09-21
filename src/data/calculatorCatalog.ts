export type CalculatorField = {
  key: string
  label: string
  type?: 'number' | 'select' | 'date'
  placeholder?: string
  suffix?: string
  defaultValue?: string
  options?: Array<{
    value: string
    label: string
  }>
}

export type CalculatorDefinition = {
  id: string
  category: string
  categoryLabel: string
  title: string
  description: string
  sourceNote?: string
  updatedAt?: string
  fields: CalculatorField[]
}

export const categoryLabels: Record<string, string> = {
  bancario: 'Bancário',
  previdenciario: 'Previdenciário',
  trabalhista: 'Trabalhista',
  tributario: 'Tributário',
  civel: 'Cível',
  penal: 'Penal',
  utilidades: 'Utilidades',
}

export const calculators: CalculatorDefinition[] = [

  // ==========================================================
  // BANCARIO
  // ==========================================================

  {
    id: 'juros',
    category: 'bancario',
    categoryLabel: 'Bancário',
    title: 'Juros simples e compostos',
    description:
      'Calcule juros, montante e evolução de capital.',
    fields: [
      {
        key: 'capital',
        label: 'Capital inicial',
        type: 'number',
      },
      {
        key: 'rate',
        label: 'Taxa por período (%)',
        type: 'number',
      },
      {
        key: 'periods',
        label: 'Número de períodos',
        type: 'number',
      },
      {
        key: 'method',
        label: 'Método',
        type: 'select',
        defaultValue: 'compound',
        options: [
          {
            value: 'compound',
            label: 'Juros compostos',
          },
          {
            value: 'simple',
            label: 'Juros simples',
          },
        ],
      },
    ],
  },

  {
    id: 'price',
    category: 'bancario',
    categoryLabel: 'Bancário',
    title: 'Tabela Price',
    description:
      'Calcule parcela fixa, juros totais e total financiado.',
    fields: [
      {
        key: 'principal',
        label: 'Valor financiado',
        type: 'number',
      },
      {
        key: 'rate',
        label: 'Taxa mensal (%)',
        type: 'number',
      },
      {
        key: 'months',
        label: 'Número de parcelas',
        type: 'number',
      },
    ],
  },

  {
    id: 'sac',
    category: 'bancario',
    categoryLabel: 'Bancário',
    title: 'Sistema SAC',
    description:
      'Calcule amortização constante, primeira e última parcela.',
    fields: [
      {
        key: 'principal',
        label: 'Valor financiado',
        type: 'number',
      },
      {
        key: 'rate',
        label: 'Taxa mensal (%)',
        type: 'number',
      },
      {
        key: 'months',
        label: 'Número de parcelas',
        type: 'number',
      },
    ],
  },

  {
    id: 'financiamento',
    category: 'bancario',
    categoryLabel: 'Bancário',
    title: 'Financiamento e empréstimo',
    description:
      'Simule entrada, saldo financiado, parcela e custo total.',
    fields: [
      {
        key: 'price',
        label: 'Valor da operação',
        type: 'number',
      },
      {
        key: 'down',
        label: 'Entrada',
        type: 'number',
      },
      {
        key: 'rate',
        label: 'Taxa mensal (%)',
        type: 'number',
      },
      {
        key: 'months',
        label: 'Parcelas',
        type: 'number',
      },
    ],
  },

  {
    id: 'bacen',
    category: 'bancario',
    categoryLabel: 'Bancário',
    title: 'Comparador de taxa BACEN',
    description:
      'Compare a taxa contratada com uma taxa média oficial informada.',
    sourceNote:
      'Informe a taxa BACEN correspondente à modalidade e ao período pesquisado.',
    fields: [
      {
        key: 'principal',
        label: 'Valor financiado',
        type: 'number',
      },
      {
        key: 'contractRate',
        label: 'Taxa contratada (% a.m.)',
        type: 'number',
      },
      {
        key: 'referenceRate',
        label: 'Taxa média BACEN (% a.m.)',
        type: 'number',
      },
      {
        key: 'months',
        label: 'Prazo em meses',
        type: 'number',
      },
    ],
  },

  {
    id: 'cet',
    category: 'bancario',
    categoryLabel: 'Bancário',
    title: 'Estimador de CET',
    description:
      'Estime a taxa efetiva considerando valor líquido recebido e parcelas.',
    fields: [
      {
        key: 'received',
        label: 'Valor líquido recebido',
        type: 'number',
      },
      {
        key: 'installment',
        label: 'Valor da parcela',
        type: 'number',
      },
      {
        key: 'months',
        label: 'Número de parcelas',
        type: 'number',
      },
    ],
  },

  {
    id: 'reajuste',
    category: 'bancario',
    categoryLabel: 'Bancário',
    title: 'Reajuste por índice',
    description:
      'Aplique um índice percentual acumulado sobre um valor.',
    fields: [
      {
        key: 'value',
        label: 'Valor atual',
        type: 'number',
      },
      {
        key: 'index',
        label: 'Índice acumulado (%)',
        type: 'number',
      },
    ],
  },


  // ==========================================================
  // PREVIDENCIARIO
  // ==========================================================

  {
    id: 'inss-2026',
    category: 'previdenciario',
    categoryLabel: 'Previdenciário',
    title: 'Contribuição INSS 2026',
    description:
      'Calcule a contribuição progressiva do empregado em 2026.',
    sourceNote:
      'Tabela válida a partir da competência janeiro de 2026.',
    updatedAt: '2026',
    fields: [
      {
        key: 'salary',
        label: 'Salário de contribuição',
        type: 'number',
      },
    ],
  },

  {
    id: 'hora-mensal',
    category: 'previdenciario',
    categoryLabel: 'Previdenciário',
    title: 'Salário por hora para mensal',
    description:
      'Converta remuneração horária em remuneração mensal estimada.',
    fields: [
      {
        key: 'hourly',
        label: 'Valor da hora',
        type: 'number',
      },
      {
        key: 'weekly',
        label: 'Horas semanais',
        type: 'number',
        defaultValue: '44',
      },
    ],
  },

  {
    id: 'fator-previdenciario',
    category: 'previdenciario',
    categoryLabel: 'Previdenciário',
    title: 'Fator previdenciário',
    description:
      'Simulação aritmética do fator com expectativa de sobrevida informada.',
    sourceNote:
      'Confira a expectativa de sobrevida aplicável antes da utilização profissional.',
    fields: [
      {
        key: 'age',
        label: 'Idade',
        type: 'number',
      },
      {
        key: 'contribution',
        label: 'Tempo de contribuição em anos',
        type: 'number',
      },
      {
        key: 'lifeExpectancy',
        label: 'Expectativa de sobrevida',
        type: 'number',
      },
    ],
  },

  {
    id: 'pedagio',
    category: 'previdenciario',
    categoryLabel: 'Previdenciário',
    title: 'Pedágio previdenciário',
    description:
      'Estime o período adicional a partir do tempo faltante e percentual de pedágio.',
    fields: [
      {
        key: 'missingMonths',
        label: 'Meses que faltavam na data-base',
        type: 'number',
      },
      {
        key: 'rate',
        label: 'Pedágio (%)',
        type: 'number',
        defaultValue: '50',
      },
    ],
  },

  {
    id: 'honorarios-previdenciarios',
    category: 'previdenciario',
    categoryLabel: 'Previdenciário',
    title: 'Honorários previdenciários',
    description:
      'Calcule honorários percentuais sobre a base econômica informada.',
    fields: [
      {
        key: 'base',
        label: 'Base de cálculo',
        type: 'number',
      },
      {
        key: 'percent',
        label: 'Honorários (%)',
        type: 'number',
      },
    ],
  },


  // ==========================================================
  // TRABALHISTA
  // ==========================================================

  {
    id: 'ferias',
    category: 'trabalhista',
    categoryLabel: 'Trabalhista',
    title: 'Férias',
    description:
      'Calcule remuneração proporcional de férias e adicional constitucional.',
    fields: [
      {
        key: 'salary',
        label: 'Remuneração mensal',
        type: 'number',
      },
      {
        key: 'days',
        label: 'Dias de férias',
        type: 'number',
        defaultValue: '30',
      },
      {
        key: 'extras',
        label: 'Média de adicionais',
        type: 'number',
        defaultValue: '0',
      },
    ],
  },

  {
    id: 'horas-extras',
    category: 'trabalhista',
    categoryLabel: 'Trabalhista',
    title: 'Horas extras',
    description:
      'Calcule valor-hora e adicional de horas extraordinárias.',
    fields: [
      {
        key: 'salary',
        label: 'Salário mensal',
        type: 'number',
      },
      {
        key: 'divisor',
        label: 'Divisor mensal',
        type: 'number',
        defaultValue: '220',
      },
      {
        key: 'hours',
        label: 'Horas extras',
        type: 'number',
      },
      {
        key: 'additional',
        label: 'Adicional (%)',
        type: 'number',
        defaultValue: '50',
      },
    ],
  },

  {
    id: 'decimo-terceiro',
    category: 'trabalhista',
    categoryLabel: 'Trabalhista',
    title: 'Décimo terceiro',
    description:
      'Calcule o valor bruto proporcional aos meses trabalhados.',
    fields: [
      {
        key: 'salary',
        label: 'Remuneração',
        type: 'number',
      },
      {
        key: 'months',
        label: 'Meses computáveis',
        type: 'number',
        defaultValue: '12',
      },
    ],
  },

  {
    id: 'fgts',
    category: 'trabalhista',
    categoryLabel: 'Trabalhista',
    title: 'FGTS e multa rescisória',
    description:
      'Estime depósitos mensais e multa rescisória sobre o saldo.',
    sourceNote:
      'Empregados CLT em geral: depósito de 8%. Situações específicas podem possuir percentual diferente.',
    fields: [
      {
        key: 'salary',
        label: 'Remuneração mensal',
        type: 'number',
      },
      {
        key: 'months',
        label: 'Meses',
        type: 'number',
      },
      {
        key: 'depositRate',
        label: 'Depósito FGTS (%)',
        type: 'number',
        defaultValue: '8',
      },
      {
        key: 'fineRate',
        label: 'Multa sobre saldo (%)',
        type: 'number',
        defaultValue: '40',
      },
    ],
  },

  {
    id: 'salario-liquido',
    category: 'trabalhista',
    categoryLabel: 'Trabalhista',
    title: 'Salário líquido 2026',
    description:
      'Estimativa de INSS e IRRF com as tabelas federais de 2026.',
    sourceNote:
      'Estimativa. Outros descontos e situações específicas devem ser adicionados separadamente.',
    updatedAt: '2026',
    fields: [
      {
        key: 'gross',
        label: 'Salário bruto',
        type: 'number',
      },
      {
        key: 'dependents',
        label: 'Dependentes para IR',
        type: 'number',
        defaultValue: '0',
      },
      {
        key: 'other',
        label: 'Outros descontos',
        type: 'number',
        defaultValue: '0',
      },
    ],
  },

  {
    id: 'rescisao',
    category: 'trabalhista',
    categoryLabel: 'Trabalhista',
    title: 'Estimativa de rescisão',
    description:
      'Some saldo salarial, férias proporcionais, 13º e aviso prévio informado.',
    sourceNote:
      'Calculadora de triagem. A modalidade de rescisão e outras verbas podem alterar o resultado.',
    fields: [
      {
        key: 'salary',
        label: 'Salário',
        type: 'number',
      },
      {
        key: 'workedDays',
        label: 'Dias trabalhados no mês',
        type: 'number',
      },
      {
        key: 'vacationMonths',
        label: 'Avos de férias',
        type: 'number',
      },
      {
        key: 'thirteenthMonths',
        label: 'Avos de 13º',
        type: 'number',
      },
      {
        key: 'noticeDays',
        label: 'Dias de aviso indenizado',
        type: 'number',
        defaultValue: '0',
      },
    ],
  },


  // ==========================================================
  // TRIBUTARIO
  // ==========================================================

  {
    id: 'irrf-2026',
    category: 'tributario',
    categoryLabel: 'Tributário',
    title: 'IRRF mensal 2026',
    description:
      'Estime o imposto mensal conforme a tabela federal de 2026.',
    updatedAt: '2026',
    fields: [
      {
        key: 'income',
        label: 'Rendimento tributável',
        type: 'number',
      },
      {
        key: 'deductions',
        label: 'Deduções',
        type: 'number',
        defaultValue: '0',
      },
    ],
  },

  {
    id: 'itcmd',
    category: 'tributario',
    categoryLabel: 'Tributário',
    title: 'Simulador parametrizado de ITCMD',
    description:
      'Calcule o imposto usando a alíquota correspondente ao estado e situação analisada.',
    sourceNote:
      'O ITCMD possui regras estaduais. Informe a alíquota efetivamente aplicável.',
    fields: [
      {
        key: 'base',
        label: 'Base tributável',
        type: 'number',
      },
      {
        key: 'rate',
        label: 'Alíquota aplicável (%)',
        type: 'number',
      },
    ],
  },

  {
    id: 'icms-piscofins',
    category: 'tributario',
    categoryLabel: 'Tributário',
    title: 'Exclusão de ICMS de PIS/COFINS',
    description:
      'Simule o impacto matemático da exclusão do ICMS da base informada.',
    fields: [
      {
        key: 'icms',
        label: 'ICMS a excluir da base',
        type: 'number',
      },
      {
        key: 'pis',
        label: 'Alíquota PIS (%)',
        type: 'number',
      },
      {
        key: 'cofins',
        label: 'Alíquota COFINS (%)',
        type: 'number',
      },
    ],
  },

  {
    id: 'iss-piscofins',
    category: 'tributario',
    categoryLabel: 'Tributário',
    title: 'Exclusão de ISS de PIS/COFINS',
    description:
      'Simule o impacto matemático da exclusão do ISS da base informada.',
    fields: [
      {
        key: 'iss',
        label: 'ISS a excluir da base',
        type: 'number',
      },
      {
        key: 'pis',
        label: 'Alíquota PIS (%)',
        type: 'number',
      },
      {
        key: 'cofins',
        label: 'Alíquota COFINS (%)',
        type: 'number',
      },
    ],
  },


  // ==========================================================
  // CIVEL
  // ==========================================================

  {
    id: 'pensao',
    category: 'civel',
    categoryLabel: 'Cível',
    title: 'Simulador de pensão',
    description:
      'Simule um percentual informado sobre a renda-base.',
    sourceNote:
      'Não existe percentual legal único. O valor é apenas uma simulação parametrizada.',
    fields: [
      {
        key: 'income',
        label: 'Renda-base',
        type: 'number',
      },
      {
        key: 'percent',
        label: 'Percentual simulado (%)',
        type: 'number',
      },
      {
        key: 'beneficiaries',
        label: 'Número de beneficiários',
        type: 'number',
        defaultValue: '1',
      },
    ],
  },

  {
    id: 'honorarios-excesso',
    category: 'civel',
    categoryLabel: 'Cível',
    title: 'Honorários sobre excesso de execução',
    description:
      'Calcule a diferença entre valor executado e valor reconhecido e aplique percentual.',
    fields: [
      {
        key: 'claimed',
        label: 'Valor executado',
        type: 'number',
      },
      {
        key: 'recognized',
        label: 'Valor reconhecido',
        type: 'number',
      },
      {
        key: 'percent',
        label: 'Honorários (%)',
        type: 'number',
      },
    ],
  },

  {
    id: 'correcao',
    category: 'civel',
    categoryLabel: 'Cível',
    title: 'Correção monetária parametrizada',
    description:
      'Atualize um valor usando índice acumulado e juros informados.',
    fields: [
      {
        key: 'principal',
        label: 'Valor original',
        type: 'number',
      },
      {
        key: 'index',
        label: 'Correção acumulada (%)',
        type: 'number',
      },
      {
        key: 'interest',
        label: 'Juros acumulados (%)',
        type: 'number',
        defaultValue: '0',
      },
    ],
  },

  {
    id: 'dias',
    category: 'civel',
    categoryLabel: 'Cível',
    title: 'Dias entre datas',
    description:
      'Conte dias corridos e dias úteis sem feriados cadastrados.',
    fields: [
      {
        key: 'start',
        label: 'Data inicial',
        type: 'date',
      },
      {
        key: 'end',
        label: 'Data final',
        type: 'date',
      },
    ],
  },


  // ==========================================================
  // PENAL
  // ==========================================================

  {
    id: 'dosimetria',
    category: 'penal',
    categoryLabel: 'Penal',
    title: 'Simulador aritmético de dosimetria',
    description:
      'Aplique percentuais sucessivos sobre uma pena-base informada.',
    sourceNote:
      'Ferramenta exclusivamente aritmética. A escolha de frações e critérios depende da análise jurídica do caso.',
    fields: [
      {
        key: 'months',
        label: 'Pena-base em meses',
        type: 'number',
      },
      {
        key: 'phase2',
        label: 'Acréscimo/redução da 2ª fase (%)',
        type: 'number',
        defaultValue: '0',
      },
      {
        key: 'phase3',
        label: 'Acréscimo/redução da 3ª fase (%)',
        type: 'number',
        defaultValue: '0',
      },
    ],
  },

  {
    id: 'progressao',
    category: 'penal',
    categoryLabel: 'Penal',
    title: 'Progressão de regime parametrizada',
    description:
      'Calcule requisito objetivo usando a fração percentual informada.',
    sourceNote:
      'O percentual deve ser definido pelo profissional de acordo com a hipótese jurídica aplicável.',
    fields: [
      {
        key: 'sentenceDays',
        label: 'Pena total em dias',
        type: 'number',
      },
      {
        key: 'fraction',
        label: 'Percentual para progressão (%)',
        type: 'number',
      },
      {
        key: 'served',
        label: 'Dias já cumpridos',
        type: 'number',
        defaultValue: '0',
      },
    ],
  },


  // ==========================================================
  // UTILIDADES
  // ==========================================================

  {
    id: 'porcentagem',
    category: 'utilidades',
    categoryLabel: 'Utilidades',
    title: 'Percentual sobre valor',
    description:
      'Calcule percentual, acréscimo e redução.',
    fields: [
      {
        key: 'value',
        label: 'Valor-base',
        type: 'number',
      },
      {
        key: 'percent',
        label: 'Percentual (%)',
        type: 'number',
      },
    ],
  },

  {
    id: 'honorarios',
    category: 'utilidades',
    categoryLabel: 'Utilidades',
    title: 'Honorários percentuais',
    description:
      'Calcule honorários sobre qualquer base econômica.',
    fields: [
      {
        key: 'base',
        label: 'Base',
        type: 'number',
      },
      {
        key: 'percent',
        label: 'Percentual (%)',
        type: 'number',
      },
    ],
  },

  {
    id: 'dias-uteis',
    category: 'utilidades',
    categoryLabel: 'Utilidades',
    title: 'Contador de dias úteis',
    description:
      'Conte dias úteis entre duas datas, excluindo sábados e domingos.',
    sourceNote:
      'Feriados locais, estaduais e nacionais não são descontados nesta versão.',
    fields: [
      {
        key: 'start',
        label: 'Data inicial',
        type: 'date',
      },
      {
        key: 'end',
        label: 'Data final',
        type: 'date',
      },
    ],
  },
]
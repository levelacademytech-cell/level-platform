export type TemplateField = {
  key: string
  label: string
  placeholder: string
}

export type DocumentTemplate = {
  id: string
  title: string
  category: string
  description: string
  action: string
  fields: TemplateField[]
  sections: string[]
}

const personFields: TemplateField[] = [
  {
    key: 'client_name',
    label: 'Nome completo',
    placeholder: 'Nome da pessoa',
  },
  {
    key: 'client_document',
    label: 'CPF / CNPJ',
    placeholder: '000.000.000-00',
  },
  {
    key: 'client_rg',
    label: 'RG',
    placeholder: 'Documento de identidade',
  },
  {
    key: 'client_address',
    label: 'Endereço',
    placeholder: 'Endereço completo',
  },
]

const lawyerFields: TemplateField[] = [
  {
    key: 'lawyer_name',
    label: 'Advogado(a)',
    placeholder: 'Nome do advogado',
  },
  {
    key: 'lawyer_oab',
    label: 'OAB',
    placeholder: 'OAB/UF 00000',
  },
]

const processFields: TemplateField[] = [
  {
    key: 'court',
    label: 'Juízo / Vara',
    placeholder: 'Juízo competente',
  },
  {
    key: 'process_number',
    label: 'Processo',
    placeholder: '0000000-00.0000.0.00.0000',
  },
]

function merge(
  ...groups: TemplateField[][]
) {
  return groups.flat()
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'fraude-inss-associacao',
    title: 'Fraude no INSS - Associação e Sindicato',
    category: 'Previdenciário',
    description: 'Modelo-base para organizar uma demanda sobre descontos associativos questionados em benefício previdenciário.',
    action: 'Criar petição',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'benefit_number',
          label: 'Número do benefício',
          placeholder: 'NB',
        },
        {
          key: 'association_name',
          label: 'Associação / sindicato',
          placeholder: 'Entidade relacionada',
        },
        {
          key: 'discount_period',
          label: 'Período dos descontos',
          placeholder: 'Período identificado',
        },
      ]
    ),
    sections: [
      'DOS FATOS',
      'DOS DESCONTOS QUESTIONADOS',
      'DOS DOCUMENTOS DISPONÍVEIS',
      'DA FUNDAMENTAÇÃO A SER REVISADA',
      'DOS PEDIDOS',
    ],
  },
  {
    id: 'fraude-inss-consignado',
    title: 'Fraude no INSS - Empréstimo Consignado',
    category: 'Previdenciário',
    description: 'Estrutura para registrar contrato, instituição, descontos e elementos de eventual contratação não reconhecida.',
    action: 'Criar petição',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'benefit_number',
          label: 'Número do benefício',
          placeholder: 'NB',
        },
        {
          key: 'bank_name',
          label: 'Banco',
          placeholder: 'Instituição financeira',
        },
        {
          key: 'contract_number',
          label: 'Contrato',
          placeholder: 'Número do contrato',
        },
        {
          key: 'loan_value',
          label: 'Valor do empréstimo',
          placeholder: 'R$ 0,00',
        },
      ]
    ),
    sections: [
      'DOS FATOS',
      'DA CONTRATAÇÃO QUESTIONADA',
      'DOS DESCONTOS',
      'DOS DOCUMENTOS E PROVAS',
      'DA FUNDAMENTAÇÃO A SER REVISADA',
      'DOS PEDIDOS',
    ],
  },
  {
    id: 'procuracao',
    title: 'Procuração Rápida',
    category: 'Cível',
    description: 'Procuração editável com qualificação do outorgante, advogado, poderes e local de assinatura.',
    action: 'Criar procuração',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'city_date',
          label: 'Cidade e data',
          placeholder: 'Cidade/UF, data',
        },
      ]
    ),
    sections: [
      'PODERES',
      'PODERES ESPECIAIS',
      'ASSINATURA DO OUTORGANTE',
    ],
  },
  {
    id: 'contrato-honorarios',
    title: 'Contrato de Honorários Advocatícios',
    category: 'Cível',
    description: 'Contrato editável para registrar escopo, remuneração, forma de pagamento, despesas e condições da contratação.',
    action: 'Criar contrato',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'service_scope',
          label: 'Objeto do serviço',
          placeholder: 'Descrição do serviço',
        },
        {
          key: 'fees',
          label: 'Honorários',
          placeholder: 'R$ 0,00 / percentual',
        },
        {
          key: 'payment_terms',
          label: 'Pagamento',
          placeholder: 'Forma e vencimentos',
        },
      ]
    ),
    sections: [
      'DO OBJETO',
      'DOS HONORÁRIOS',
      'DAS DESPESAS',
      'DAS OBRIGAÇÕES DAS PARTES',
      'DA RESCISÃO',
      'DO FORO',
      'ASSINATURAS',
    ],
  },
  {
    id: 'declaracao-hipossuficiencia',
    title: 'Declaração de Hipossuficiência',
    category: 'Cível',
    description: 'Declaração editável com dados do declarante e espaço para contextualização econômica.',
    action: 'Criar declaração',
    fields: merge(
      personFields,
      [
        {
          key: 'civil_status',
          label: 'Estado civil',
          placeholder: 'Estado civil',
        },
        {
          key: 'occupation',
          label: 'Profissão',
          placeholder: 'Profissão',
        },
        {
          key: 'income',
          label: 'Renda informada',
          placeholder: 'R$ 0,00',
        },
        {
          key: 'city_date',
          label: 'Cidade e data',
          placeholder: 'Cidade/UF, data',
        },
      ]
    ),
    sections: [
      'DECLARAÇÃO',
      'JUSTIFICATIVA ECONÔMICA',
      'ASSINATURA',
    ],
  },
  {
    id: 'justica-gratuita',
    title: 'Petição Intermediária de Justiça Gratuita',
    category: 'Processual',
    description: 'Modelo-base para organizar pedido de gratuidade em processo já em andamento.',
    action: 'Criar petição',
    fields: merge(
      personFields,
      lawyerFields,
      processFields,
      [
        {
          key: 'income',
          label: 'Renda',
          placeholder: 'R$ 0,00',
        },
      ]
    ),
    sections: [
      'DA SITUAÇÃO ECONÔMICA',
      'DOS DOCUMENTOS',
      'DA FUNDAMENTAÇÃO A SER REVISADA',
      'DO PEDIDO',
    ],
  },
  {
    id: 'substabelecimento-reserva',
    title: 'Substabelecimento com Reservas de Poderes',
    category: 'Processual',
    description: 'Substabelecimento editável com advogado substabelecente, substabelecido, processo e poderes.',
    action: 'Criar substabelecimento',
    fields: merge(
      lawyerFields,
      processFields,
      [
        {
          key: 'new_lawyer',
          label: 'Advogado substabelecido',
          placeholder: 'Nome do novo advogado',
        },
        {
          key: 'new_oab',
          label: 'OAB do substabelecido',
          placeholder: 'OAB/UF 00000',
        },
        {
          key: 'city_date',
          label: 'Cidade e data',
          placeholder: 'Cidade/UF, data',
        },
      ]
    ),
    sections: [
      'SUBSTABELECIMENTO',
      'PODERES',
      'ASSINATURA',
    ],
  },
  {
    id: 'entrevista-bancaria',
    title: 'Entrevista de Ação Bancária',
    category: 'Bancário',
    description: 'Questionário editável para reunir dados de contratos, cobranças, pagamentos, documentos e objetivos do cliente.',
    action: 'Criar entrevista',
    fields: merge(
      personFields,
      [
        {
          key: 'bank_name',
          label: 'Instituição financeira',
          placeholder: 'Banco / financeira',
        },
        {
          key: 'product',
          label: 'Produto',
          placeholder: 'Cartão, empréstimo, financiamento...',
        },
        {
          key: 'contract_number',
          label: 'Contrato',
          placeholder: 'Número do contrato',
        },
        {
          key: 'claimed_value',
          label: 'Valor discutido',
          placeholder: 'R$ 0,00',
        },
      ]
    ),
    sections: [
      'RESUMO DO ATENDIMENTO',
      'CONTRATAÇÃO',
      'PAGAMENTOS E COBRANÇAS',
      'PONTOS QUESTIONADOS',
      'DOCUMENTOS DISPONÍVEIS',
      'OBJETIVO DO CLIENTE',
      'OBSERVAÇÕES DO ADVOGADO',
    ],
  },
  {
    id: 'habilitacao-processual',
    title: 'Petição de Habilitação Processual',
    category: 'Processual',
    description: 'Modelo editável para organizar a habilitação de advogado em processo existente.',
    action: 'Criar petição',
    fields: merge(
      personFields,
      lawyerFields,
      processFields
    ),
    sections: [
      'DA REPRESENTAÇÃO',
      'DO PEDIDO DE HABILITAÇÃO',
      'DAS PUBLICAÇÕES E INTIMAÇÕES',
      'REQUERIMENTOS',
    ],
  },
  {
    id: 'execucao-honorarios',
    title: 'Petição de Execução de Contrato de Honorários Advocatícios',
    category: 'Cível',
    description: 'Estrutura de apoio para organizar contrato, obrigação, vencimento e valores de honorários.',
    action: 'Criar petição',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'debtor_name',
          label: 'Devedor',
          placeholder: 'Nome do devedor',
        },
        {
          key: 'contract_date',
          label: 'Data do contrato',
          placeholder: 'Data',
        },
        {
          key: 'debt_value',
          label: 'Valor indicado',
          placeholder: 'R$ 0,00',
        },
      ]
    ),
    sections: [
      'DOS FATOS',
      'DO CONTRATO',
      'DO INADIMPLEMENTO',
      'DO VALOR',
      'DA FUNDAMENTAÇÃO A SER REVISADA',
      'DOS PEDIDOS',
    ],
  },
  {
    id: 'notificacao-aluguel',
    title: 'Notificação Extrajudicial - Atraso no pagamento de aluguel',
    category: 'Cível',
    description: 'Notificação editável com dados da locação, parcelas em atraso e prazo indicado pelo advogado.',
    action: 'Criar notificação',
    fields: [
      {
        key: 'landlord_name',
        label: 'Locador',
        placeholder: 'Nome do locador',
      },
      {
        key: 'tenant_name',
        label: 'Locatário',
        placeholder: 'Nome do locatário',
      },
      {
        key: 'property_address',
        label: 'Imóvel',
        placeholder: 'Endereço do imóvel',
      },
      {
        key: 'rent_value',
        label: 'Aluguel',
        placeholder: 'R$ 0,00',
      },
      {
        key: 'overdue_period',
        label: 'Período em atraso',
        placeholder: 'Meses / vencimentos',
      },
      {
        key: 'deadline',
        label: 'Prazo para regularização',
        placeholder: 'Prazo indicado',
      },
    ],
    sections: [
      'DA LOCAÇÃO',
      'DOS VALORES EM ABERTO',
      'DA NOTIFICAÇÃO',
      'DO PRAZO',
      'ASSINATURA',
    ],
  },
  {
    id: 'acao-alimentos',
    title: 'Petição de Ação de Alimentos',
    category: 'Família',
    description: 'Modelo-base editável para estruturar informações do alimentando, responsável, alimentante e necessidades.',
    action: 'Criar petição',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'child_name',
          label: 'Alimentando',
          placeholder: 'Nome',
        },
        {
          key: 'respondent_name',
          label: 'Alimentante',
          placeholder: 'Nome',
        },
        {
          key: 'requested_support',
          label: 'Alimentos pretendidos',
          placeholder: 'Valor / percentual',
        },
      ]
    ),
    sections: [
      'DOS FATOS',
      'DAS NECESSIDADES',
      'DA CAPACIDADE CONTRIBUTIVA',
      'DA FUNDAMENTAÇÃO A SER REVISADA',
      'DOS PEDIDOS',
    ],
  },
  {
    id: 'renuncia-mandato',
    title: 'Petição de Renúncia de Mandato',
    category: 'Processual',
    description: 'Petição editável com processo, cliente, advogado e registro da comunicação da renúncia.',
    action: 'Criar petição',
    fields: merge(
      personFields,
      lawyerFields,
      processFields,
      [
        {
          key: 'notice_date',
          label: 'Data da comunicação',
          placeholder: 'Data',
        },
      ]
    ),
    sections: [
      'DA RENÚNCIA',
      'DA COMUNICAÇÃO AO MANDANTE',
      'DOS REQUERIMENTOS',
    ],
  },
  {
    id: 'entrevista-superendividamento',
    title: 'Entrevista de Ação de Superendividamento',
    category: 'Bancário',
    description: 'Questionário para organizar renda, despesas essenciais, credores, contratos e contexto de superendividamento.',
    action: 'Criar entrevista',
    fields: merge(
      personFields,
      [
        {
          key: 'monthly_income',
          label: 'Renda mensal',
          placeholder: 'R$ 0,00',
        },
        {
          key: 'essential_expenses',
          label: 'Despesas essenciais',
          placeholder: 'R$ 0,00',
        },
        {
          key: 'creditors',
          label: 'Credores',
          placeholder: 'Liste os principais credores',
        },
      ]
    ),
    sections: [
      'PERFIL FINANCEIRO',
      'RENDA E DESPESAS ESSENCIAIS',
      'CREDORES E CONTRATOS',
      'EVENTOS QUE AGRAVARAM A SITUAÇÃO',
      'NEGOCIAÇÕES JÁ REALIZADAS',
      'DOCUMENTOS DISPONÍVEIS',
      'OBJETIVOS DO CLIENTE',
    ],
  },
  {
    id: 'entrevista-tributaria-pj',
    title: 'Entrevista de Ação Tributária para Pessoa Jurídica',
    category: 'Tributário',
    description: 'Questionário editável para levantar tributos, períodos, autuações, pagamentos e documentos de empresa.',
    action: 'Criar entrevista',
    fields: [
      {
        key: 'company_name',
        label: 'Razão social',
        placeholder: 'Empresa',
      },
      {
        key: 'cnpj',
        label: 'CNPJ',
        placeholder: '00.000.000/0000-00',
      },
      {
        key: 'tax_regime',
        label: 'Regime tributário',
        placeholder: 'Regime',
      },
      {
        key: 'taxes',
        label: 'Tributos envolvidos',
        placeholder: 'Tributos',
      },
      {
        key: 'period',
        label: 'Período',
        placeholder: 'Competências',
      },
    ],
    sections: [
      'IDENTIFICAÇÃO DA EMPRESA',
      'TRIBUTOS E PERÍODOS',
      'AUTUAÇÕES / COBRANÇAS',
      'PAGAMENTOS E COMPENSAÇÕES',
      'DOCUMENTOS DISPONÍVEIS',
      'OBJETIVO DA ANÁLISE',
    ],
  },
  {
    id: 'entrevista-tributaria-pf',
    title: 'Entrevista de Ação Tributária para Pessoa Física',
    category: 'Tributário',
    description: 'Questionário para organizar situação fiscal, tributos, períodos, pagamentos e documentos de pessoa física.',
    action: 'Criar entrevista',
    fields: merge(
      personFields,
      [
        {
          key: 'taxes',
          label: 'Tributos envolvidos',
          placeholder: 'IR, IPTU, ITCMD...',
        },
        {
          key: 'period',
          label: 'Período',
          placeholder: 'Período discutido',
        },
      ]
    ),
    sections: [
      'SITUAÇÃO FISCAL',
      'TRIBUTOS E PERÍODOS',
      'COBRANÇAS / AUTUAÇÕES',
      'PAGAMENTOS',
      'DOCUMENTOS DISPONÍVEIS',
      'OBJETIVO DO CLIENTE',
    ],
  },
  {
    id: 'contrato-locacao',
    title: 'Contrato de Locação de Imóvel',
    category: 'Cível',
    description: 'Contrato-base editável com partes, imóvel, aluguel, prazo, garantia, reajuste e demais cláusulas.',
    action: 'Criar contrato',
    fields: [
      {
        key: 'landlord_name',
        label: 'Locador',
        placeholder: 'Nome do locador',
      },
      {
        key: 'tenant_name',
        label: 'Locatário',
        placeholder: 'Nome do locatário',
      },
      {
        key: 'property_address',
        label: 'Imóvel',
        placeholder: 'Endereço completo',
      },
      {
        key: 'rent_value',
        label: 'Aluguel',
        placeholder: 'R$ 0,00',
      },
      {
        key: 'term',
        label: 'Prazo',
        placeholder: 'Prazo da locação',
      },
      {
        key: 'guarantee',
        label: 'Garantia',
        placeholder: 'Modalidade de garantia',
      },
    ],
    sections: [
      'DO OBJETO',
      'DO PRAZO',
      'DO ALUGUEL E ENCARGOS',
      'DO REAJUSTE',
      'DA GARANTIA',
      'DAS OBRIGAÇÕES',
      'DA RESCISÃO',
      'DO FORO',
      'ASSINATURAS',
    ],
  },
  {
    id: 'aposentadoria-tempo-contribuicao',
    title: 'Petição Inicial de Concessão de Aposentadoria por Tempo de Contribuição',
    category: 'Previdenciário',
    description: 'Modelo-base editável para organizar DER, benefício, períodos contributivos, decisão administrativa e pedidos.',
    action: 'Criar petição',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'der',
          label: 'DER',
          placeholder: 'Data de entrada do requerimento',
        },
        {
          key: 'benefit_number',
          label: 'NB',
          placeholder: 'Número do benefício',
        },
        {
          key: 'contribution_time',
          label: 'Tempo apurado',
          placeholder: 'Tempo de contribuição',
        },
      ]
    ),
    sections: [
      'DOS FATOS',
      'DO REQUERIMENTO ADMINISTRATIVO',
      'DOS PERÍODOS CONTRIBUTIVOS',
      'DA FUNDAMENTAÇÃO A SER REVISADA',
      'DOS PEDIDOS',
    ],
  },
  {
    id: 'entrevista-previdenciaria',
    title: 'Entrevista Previdenciária',
    category: 'Previdenciário',
    description: 'Questionário editável para levantar vínculos, contribuições, benefícios, requerimentos e documentos.',
    action: 'Criar entrevista',
    fields: merge(
      personFields,
      [
        {
          key: 'nis',
          label: 'NIS / PIS',
          placeholder: 'Número',
        },
        {
          key: 'benefit_number',
          label: 'NB',
          placeholder: 'Número do benefício, se houver',
        },
        {
          key: 'der',
          label: 'DER',
          placeholder: 'Data, se houver',
        },
      ]
    ),
    sections: [
      'HISTÓRICO PROFISSIONAL',
      'VÍNCULOS E CONTRIBUIÇÕES',
      'BENEFÍCIOS E REQUERIMENTOS',
      'PERÍODOS ESPECIAIS / RURAIS, SE APLICÁVEL',
      'DOCUMENTOS DISPONÍVEIS',
      'OBJETIVO DO CLIENTE',
      'OBSERVAÇÕES',
    ],
  },
  {
    id: 'proposta-honorarios',
    title: 'Proposta de Honorários de Serviços Advocatícios',
    category: 'Gestão',
    description: 'Proposta editável para apresentar escopo, etapas, honorários, despesas, validade e condições comerciais.',
    action: 'Criar proposta',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'service_scope',
          label: 'Serviço',
          placeholder: 'Descrição do escopo',
        },
        {
          key: 'fees',
          label: 'Honorários',
          placeholder: 'R$ 0,00 / percentual',
        },
        {
          key: 'validity',
          label: 'Validade da proposta',
          placeholder: 'Data / prazo',
        },
      ]
    ),
    sections: [
      'ESCOPO DOS SERVIÇOS',
      'ETAPAS DO TRABALHO',
      'HONORÁRIOS',
      'DESPESAS',
      'CONDIÇÕES DE PAGAMENTO',
      'VALIDADE DA PROPOSTA',
      'ACEITE',
    ],
  },
  {
    id: 'documento-em-branco',
    title: 'Documento em branco',
    category: 'Geral',
    description: 'Folha jurídica totalmente editável para criar qualquer documento a partir do zero.',
    action: 'Criar documento',
    fields: [],
    sections: [
      'DIGITE AQUI O TÍTULO DO DOCUMENTO',
      'Inicie a redação livre neste espaço.',
    ],
  },
]

export function getTemplate(
  id: string
) {
  return documentTemplates.find(
    (item) =>
      item.id === id
  )
}

export function getTemplateHtml(
  template: DocumentTemplate
) {
  const fieldRows =
    template.fields
      .map(
        (field) => `
          <tr>
            <th>${field.label}</th>
            <td>
              <mark data-field="${field.key}">
                ${field.placeholder}
              </mark>
            </td>
          </tr>
        `
      )
      .join('')

  const sections =
    template.sections
      .map(
        (section, index) => {
          if (
            template.id ===
              'documento-em-branco' &&
            index === 1
          ) {
            return `
              <p>
                ${section}
              </p>
            `
          }

          return `
            <h2>${section}</h2>
            <p>
              [Edite este trecho conforme
              os fatos, documentos,
              estratégia e fundamentação
              aplicáveis ao caso concreto.]
            </p>
          `
        }
      )
      .join('')

  return `
    <div class="legal-document-sheet">
      <h1>${template.title}</h1>

      ${
        fieldRows
          ? `
            <table>
              <tbody>
                ${fieldRows}
              </tbody>
            </table>
          `
          : ''
      }

      ${sections}

      <p class="document-review-note">
        Modelo-base editável. Revise o
        conteúdo, a legislação e a
        adequação ao caso concreto antes
        da utilização profissional.
      </p>
    </div>
  `
}
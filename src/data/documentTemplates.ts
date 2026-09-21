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
    label: 'EndereÃ§o',
    placeholder: 'EndereÃ§o completo',
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
    label: 'JuÃ­zo / Vara',
    placeholder: 'JuÃ­zo competente',
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
    title: 'Fraude no INSS - AssociaÃ§Ã£o e Sindicato',
    category: 'PrevidenciÃ¡rio',
    description: 'Modelo-base para organizar uma demanda sobre descontos associativos questionados em benefÃ­cio previdenciÃ¡rio.',
    action: 'Criar petiÃ§Ã£o',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'benefit_number',
          label: 'NÃºmero do benefÃ­cio',
          placeholder: 'NB',
        },
        {
          key: 'association_name',
          label: 'AssociaÃ§Ã£o / sindicato',
          placeholder: 'Entidade relacionada',
        },
        {
          key: 'discount_period',
          label: 'PerÃ­odo dos descontos',
          placeholder: 'PerÃ­odo identificado',
        },
      ]
    ),
    sections: [
      'DOS FATOS',
      'DOS DESCONTOS QUESTIONADOS',
      'DOS DOCUMENTOS DISPONÃVEIS',
      'DA FUNDAMENTAÃ‡ÃƒO A SER REVISADA',
      'DOS PEDIDOS',
    ],
  },
  {
    id: 'fraude-inss-consignado',
    title: 'Fraude no INSS - EmprÃ©stimo Consignado',
    category: 'PrevidenciÃ¡rio',
    description: 'Estrutura para registrar contrato, instituiÃ§Ã£o, descontos e elementos de eventual contrataÃ§Ã£o nÃ£o reconhecida.',
    action: 'Criar petiÃ§Ã£o',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'benefit_number',
          label: 'NÃºmero do benefÃ­cio',
          placeholder: 'NB',
        },
        {
          key: 'bank_name',
          label: 'Banco',
          placeholder: 'InstituiÃ§Ã£o financeira',
        },
        {
          key: 'contract_number',
          label: 'Contrato',
          placeholder: 'NÃºmero do contrato',
        },
        {
          key: 'loan_value',
          label: 'Valor do emprÃ©stimo',
          placeholder: 'R$ 0,00',
        },
      ]
    ),
    sections: [
      'DOS FATOS',
      'DA CONTRATAÃ‡ÃƒO QUESTIONADA',
      'DOS DESCONTOS',
      'DOS DOCUMENTOS E PROVAS',
      'DA FUNDAMENTAÃ‡ÃƒO A SER REVISADA',
      'DOS PEDIDOS',
    ],
  },
  {
    id: 'procuracao',
    title: 'ProcuraÃ§Ã£o RÃ¡pida',
    category: 'CÃ­vel',
    description: 'ProcuraÃ§Ã£o editÃ¡vel com qualificaÃ§Ã£o do outorgante, advogado, poderes e local de assinatura.',
    action: 'Criar procuraÃ§Ã£o',
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
    title: 'Contrato de HonorÃ¡rios AdvocatÃ­cios',
    category: 'CÃ­vel',
    description: 'Contrato editÃ¡vel para registrar escopo, remuneraÃ§Ã£o, forma de pagamento, despesas e condiÃ§Ãµes da contrataÃ§Ã£o.',
    action: 'Criar contrato',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'service_scope',
          label: 'Objeto do serviÃ§o',
          placeholder: 'DescriÃ§Ã£o do serviÃ§o',
        },
        {
          key: 'fees',
          label: 'HonorÃ¡rios',
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
      'DOS HONORÃRIOS',
      'DAS DESPESAS',
      'DAS OBRIGAÃ‡Ã•ES DAS PARTES',
      'DA RESCISÃƒO',
      'DO FORO',
      'ASSINATURAS',
    ],
  },
  {
    id: 'declaracao-hipossuficiencia',
    title: 'DeclaraÃ§Ã£o de HipossuficiÃªncia',
    category: 'CÃ­vel',
    description: 'DeclaraÃ§Ã£o editÃ¡vel com dados do declarante e espaÃ§o para contextualizaÃ§Ã£o econÃ´mica.',
    action: 'Criar declaraÃ§Ã£o',
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
          label: 'ProfissÃ£o',
          placeholder: 'ProfissÃ£o',
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
      'DECLARAÃ‡ÃƒO',
      'JUSTIFICATIVA ECONÃ”MICA',
      'ASSINATURA',
    ],
  },
  {
    id: 'justica-gratuita',
    title: 'PetiÃ§Ã£o IntermediÃ¡ria de JustiÃ§a Gratuita',
    category: 'Processual',
    description: 'Modelo-base para organizar pedido de gratuidade em processo jÃ¡ em andamento.',
    action: 'Criar petiÃ§Ã£o',
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
      'DA SITUAÃ‡ÃƒO ECONÃ”MICA',
      'DOS DOCUMENTOS',
      'DA FUNDAMENTAÃ‡ÃƒO A SER REVISADA',
      'DO PEDIDO',
    ],
  },
  {
    id: 'substabelecimento-reserva',
    title: 'Substabelecimento com Reservas de Poderes',
    category: 'Processual',
    description: 'Substabelecimento editÃ¡vel com advogado substabelecente, substabelecido, processo e poderes.',
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
    title: 'Entrevista de AÃ§Ã£o BancÃ¡ria',
    category: 'BancÃ¡rio',
    description: 'QuestionÃ¡rio editÃ¡vel para reunir dados de contratos, cobranÃ§as, pagamentos, documentos e objetivos do cliente.',
    action: 'Criar entrevista',
    fields: merge(
      personFields,
      [
        {
          key: 'bank_name',
          label: 'InstituiÃ§Ã£o financeira',
          placeholder: 'Banco / financeira',
        },
        {
          key: 'product',
          label: 'Produto',
          placeholder: 'CartÃ£o, emprÃ©stimo, financiamento...',
        },
        {
          key: 'contract_number',
          label: 'Contrato',
          placeholder: 'NÃºmero do contrato',
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
      'CONTRATAÃ‡ÃƒO',
      'PAGAMENTOS E COBRANÃ‡AS',
      'PONTOS QUESTIONADOS',
      'DOCUMENTOS DISPONÃVEIS',
      'OBJETIVO DO CLIENTE',
      'OBSERVAÃ‡Ã•ES DO ADVOGADO',
    ],
  },
  {
    id: 'habilitacao-processual',
    title: 'PetiÃ§Ã£o de HabilitaÃ§Ã£o Processual',
    category: 'Processual',
    description: 'Modelo editÃ¡vel para organizar a habilitaÃ§Ã£o de advogado em processo existente.',
    action: 'Criar petiÃ§Ã£o',
    fields: merge(
      personFields,
      lawyerFields,
      processFields
    ),
    sections: [
      'DA REPRESENTAÃ‡ÃƒO',
      'DO PEDIDO DE HABILITAÃ‡ÃƒO',
      'DAS PUBLICAÃ‡Ã•ES E INTIMAÃ‡Ã•ES',
      'REQUERIMENTOS',
    ],
  },
  {
    id: 'execucao-honorarios',
    title: 'PetiÃ§Ã£o de ExecuÃ§Ã£o de Contrato de HonorÃ¡rios AdvocatÃ­cios',
    category: 'CÃ­vel',
    description: 'Estrutura de apoio para organizar contrato, obrigaÃ§Ã£o, vencimento e valores de honorÃ¡rios.',
    action: 'Criar petiÃ§Ã£o',
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
      'DA FUNDAMENTAÃ‡ÃƒO A SER REVISADA',
      'DOS PEDIDOS',
    ],
  },
  {
    id: 'notificacao-aluguel',
    title: 'NotificaÃ§Ã£o Extrajudicial - Atraso no pagamento de aluguel',
    category: 'CÃ­vel',
    description: 'NotificaÃ§Ã£o editÃ¡vel com dados da locaÃ§Ã£o, parcelas em atraso e prazo indicado pelo advogado.',
    action: 'Criar notificaÃ§Ã£o',
    fields: [
      {
        key: 'landlord_name',
        label: 'Locador',
        placeholder: 'Nome do locador',
      },
      {
        key: 'tenant_name',
        label: 'LocatÃ¡rio',
        placeholder: 'Nome do locatÃ¡rio',
      },
      {
        key: 'property_address',
        label: 'ImÃ³vel',
        placeholder: 'EndereÃ§o do imÃ³vel',
      },
      {
        key: 'rent_value',
        label: 'Aluguel',
        placeholder: 'R$ 0,00',
      },
      {
        key: 'overdue_period',
        label: 'PerÃ­odo em atraso',
        placeholder: 'Meses / vencimentos',
      },
      {
        key: 'deadline',
        label: 'Prazo para regularizaÃ§Ã£o',
        placeholder: 'Prazo indicado',
      },
    ],
    sections: [
      'DA LOCAÃ‡ÃƒO',
      'DOS VALORES EM ABERTO',
      'DA NOTIFICAÃ‡ÃƒO',
      'DO PRAZO',
      'ASSINATURA',
    ],
  },
  {
    id: 'acao-alimentos',
    title: 'PetiÃ§Ã£o de AÃ§Ã£o de Alimentos',
    category: 'FamÃ­lia',
    description: 'Modelo-base editÃ¡vel para estruturar informaÃ§Ãµes do alimentando, responsÃ¡vel, alimentante e necessidades.',
    action: 'Criar petiÃ§Ã£o',
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
      'DA FUNDAMENTAÃ‡ÃƒO A SER REVISADA',
      'DOS PEDIDOS',
    ],
  },
  {
    id: 'renuncia-mandato',
    title: 'PetiÃ§Ã£o de RenÃºncia de Mandato',
    category: 'Processual',
    description: 'PetiÃ§Ã£o editÃ¡vel com processo, cliente, advogado e registro da comunicaÃ§Ã£o da renÃºncia.',
    action: 'Criar petiÃ§Ã£o',
    fields: merge(
      personFields,
      lawyerFields,
      processFields,
      [
        {
          key: 'notice_date',
          label: 'Data da comunicaÃ§Ã£o',
          placeholder: 'Data',
        },
      ]
    ),
    sections: [
      'DA RENÃšNCIA',
      'DA COMUNICAÃ‡ÃƒO AO MANDANTE',
      'DOS REQUERIMENTOS',
    ],
  },
  {
    id: 'entrevista-superendividamento',
    title: 'Entrevista de AÃ§Ã£o de Superendividamento',
    category: 'BancÃ¡rio',
    description: 'QuestionÃ¡rio para organizar renda, despesas essenciais, credores, contratos e contexto de superendividamento.',
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
      'EVENTOS QUE AGRAVARAM A SITUAÃ‡ÃƒO',
      'NEGOCIAÃ‡Ã•ES JÃ REALIZADAS',
      'DOCUMENTOS DISPONÃVEIS',
      'OBJETIVOS DO CLIENTE',
    ],
  },
  {
    id: 'entrevista-tributaria-pj',
    title: 'Entrevista de AÃ§Ã£o TributÃ¡ria para Pessoa JurÃ­dica',
    category: 'TributÃ¡rio',
    description: 'QuestionÃ¡rio editÃ¡vel para levantar tributos, perÃ­odos, autuaÃ§Ãµes, pagamentos e documentos de empresa.',
    action: 'Criar entrevista',
    fields: [
      {
        key: 'company_name',
        label: 'RazÃ£o social',
        placeholder: 'Empresa',
      },
      {
        key: 'cnpj',
        label: 'CNPJ',
        placeholder: '00.000.000/0000-00',
      },
      {
        key: 'tax_regime',
        label: 'Regime tributÃ¡rio',
        placeholder: 'Regime',
      },
      {
        key: 'taxes',
        label: 'Tributos envolvidos',
        placeholder: 'Tributos',
      },
      {
        key: 'period',
        label: 'PerÃ­odo',
        placeholder: 'CompetÃªncias',
      },
    ],
    sections: [
      'IDENTIFICAÃ‡ÃƒO DA EMPRESA',
      'TRIBUTOS E PERÃODOS',
      'AUTUAÃ‡Ã•ES / COBRANÃ‡AS',
      'PAGAMENTOS E COMPENSAÃ‡Ã•ES',
      'DOCUMENTOS DISPONÃVEIS',
      'OBJETIVO DA ANÃLISE',
    ],
  },
  {
    id: 'entrevista-tributaria-pf',
    title: 'Entrevista de AÃ§Ã£o TributÃ¡ria para Pessoa FÃ­sica',
    category: 'TributÃ¡rio',
    description: 'QuestionÃ¡rio para organizar situaÃ§Ã£o fiscal, tributos, perÃ­odos, pagamentos e documentos de pessoa fÃ­sica.',
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
          label: 'PerÃ­odo',
          placeholder: 'PerÃ­odo discutido',
        },
      ]
    ),
    sections: [
      'SITUAÃ‡ÃƒO FISCAL',
      'TRIBUTOS E PERÃODOS',
      'COBRANÃ‡AS / AUTUAÃ‡Ã•ES',
      'PAGAMENTOS',
      'DOCUMENTOS DISPONÃVEIS',
      'OBJETIVO DO CLIENTE',
    ],
  },
  {
    id: 'contrato-locacao',
    title: 'Contrato de LocaÃ§Ã£o de ImÃ³vel',
    category: 'CÃ­vel',
    description: 'Contrato-base editÃ¡vel com partes, imÃ³vel, aluguel, prazo, garantia, reajuste e demais clÃ¡usulas.',
    action: 'Criar contrato',
    fields: [
      {
        key: 'landlord_name',
        label: 'Locador',
        placeholder: 'Nome do locador',
      },
      {
        key: 'tenant_name',
        label: 'LocatÃ¡rio',
        placeholder: 'Nome do locatÃ¡rio',
      },
      {
        key: 'property_address',
        label: 'ImÃ³vel',
        placeholder: 'EndereÃ§o completo',
      },
      {
        key: 'rent_value',
        label: 'Aluguel',
        placeholder: 'R$ 0,00',
      },
      {
        key: 'term',
        label: 'Prazo',
        placeholder: 'Prazo da locaÃ§Ã£o',
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
      'DAS OBRIGAÃ‡Ã•ES',
      'DA RESCISÃƒO',
      'DO FORO',
      'ASSINATURAS',
    ],
  },
  {
    id: 'aposentadoria-tempo-contribuicao',
    title: 'PetiÃ§Ã£o Inicial de ConcessÃ£o de Aposentadoria por Tempo de ContribuiÃ§Ã£o',
    category: 'PrevidenciÃ¡rio',
    description: 'Modelo-base editÃ¡vel para organizar DER, benefÃ­cio, perÃ­odos contributivos, decisÃ£o administrativa e pedidos.',
    action: 'Criar petiÃ§Ã£o',
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
          placeholder: 'NÃºmero do benefÃ­cio',
        },
        {
          key: 'contribution_time',
          label: 'Tempo apurado',
          placeholder: 'Tempo de contribuiÃ§Ã£o',
        },
      ]
    ),
    sections: [
      'DOS FATOS',
      'DO REQUERIMENTO ADMINISTRATIVO',
      'DOS PERÃODOS CONTRIBUTIVOS',
      'DA FUNDAMENTAÃ‡ÃƒO A SER REVISADA',
      'DOS PEDIDOS',
    ],
  },
  {
    id: 'entrevista-previdenciaria',
    title: 'Entrevista PrevidenciÃ¡ria',
    category: 'PrevidenciÃ¡rio',
    description: 'QuestionÃ¡rio editÃ¡vel para levantar vÃ­nculos, contribuiÃ§Ãµes, benefÃ­cios, requerimentos e documentos.',
    action: 'Criar entrevista',
    fields: merge(
      personFields,
      [
        {
          key: 'nis',
          label: 'NIS / PIS',
          placeholder: 'NÃºmero',
        },
        {
          key: 'benefit_number',
          label: 'NB',
          placeholder: 'NÃºmero do benefÃ­cio, se houver',
        },
        {
          key: 'der',
          label: 'DER',
          placeholder: 'Data, se houver',
        },
      ]
    ),
    sections: [
      'HISTÃ“RICO PROFISSIONAL',
      'VÃNCULOS E CONTRIBUIÃ‡Ã•ES',
      'BENEFÃCIOS E REQUERIMENTOS',
      'PERÃODOS ESPECIAIS / RURAIS, SE APLICÃVEL',
      'DOCUMENTOS DISPONÃVEIS',
      'OBJETIVO DO CLIENTE',
      'OBSERVAÃ‡Ã•ES',
    ],
  },
  {
    id: 'proposta-honorarios',
    title: 'Proposta de HonorÃ¡rios de ServiÃ§os AdvocatÃ­cios',
    category: 'GestÃ£o',
    description: 'Proposta editÃ¡vel para apresentar escopo, etapas, honorÃ¡rios, despesas, validade e condiÃ§Ãµes comerciais.',
    action: 'Criar proposta',
    fields: merge(
      personFields,
      lawyerFields,
      [
        {
          key: 'service_scope',
          label: 'ServiÃ§o',
          placeholder: 'DescriÃ§Ã£o do escopo',
        },
        {
          key: 'fees',
          label: 'HonorÃ¡rios',
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
      'ESCOPO DOS SERVIÃ‡OS',
      'ETAPAS DO TRABALHO',
      'HONORÃRIOS',
      'DESPESAS',
      'CONDIÃ‡Ã•ES DE PAGAMENTO',
      'VALIDADE DA PROPOSTA',
      'ACEITE',
    ],
  },
  {
    id: 'documento-em-branco',
    title: 'Documento em branco',
    category: 'Geral',
    description: 'Folha jurÃ­dica totalmente editÃ¡vel para criar qualquer documento a partir do zero.',
    action: 'Criar documento',
    fields: [],
    sections: [
      'DIGITE AQUI O TÃTULO DO DOCUMENTO',
      'Inicie a redaÃ§Ã£o livre neste espaÃ§o.',
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
              estratÃ©gia e fundamentaÃ§Ã£o
              aplicÃ¡veis ao caso concreto.]
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
        Modelo-base editÃ¡vel. Revise o
        conteÃºdo, a legislaÃ§Ã£o e a
        adequaÃ§Ã£o ao caso concreto antes
        da utilizaÃ§Ã£o profissional.
      </p>
    </div>
  `
}
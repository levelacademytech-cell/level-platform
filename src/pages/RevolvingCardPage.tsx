import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Plus,
  Printer,
  Save,
  Scale,
  Send,
  Trash2,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import * as XLSX from 'xlsx'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'


type InterestMode =
  | 'charged'
  | 'rate'


type PeriodRow = {
  id: string

  competence: string

  financedBalance: number

  statedMonthlyRate: number

  chargedRevolvingInterest: number

  installmentInterest: number

  lateInterest: number

  fine: number

  otherCharges: number
}


function createRow(): PeriodRow {
  return {
    id: crypto.randomUUID(),

    competence: '',

    financedBalance: 0,

    statedMonthlyRate: 0,

    chargedRevolvingInterest: 0,

    installmentInterest: 0,

    lateInterest: 0,

    fine: 0,

    otherCharges: 0,
  }
}


const money =
  new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',

      currency: 'BRL',
    }
  )


const percentage =
  new Intl.NumberFormat(
    'pt-BR',
    {
      minimumFractionDigits: 2,

      maximumFractionDigits: 4,
    }
  )


function numeric(
  value: unknown
) {
  if (
    typeof value ===
    'number'
  ) {
    return Number.isFinite(
      value
    )
      ? value
      : 0
  }

  if (
    typeof value !==
    'string'
  ) {
    return 0
  }

  const raw =
    value
      .trim()
      .replace(
        /[R$\s]/g,
        ''
      )

  if (!raw) {
    return 0
  }

  const normalized =
    raw.includes(',')
      ? raw
          .replace(
            /\./g,
            ''
          )
          .replace(
            ',',
            '.'
          )
      : raw

  const parsed =
    Number(normalized)

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0
}


function normalizeKey(
  value: string
) {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '_'
    )
    .replace(
      /^_|_$/g,
      ''
    )
}


function normalizeCompetence(
  value: unknown
) {
  if (
    typeof value ===
    'number'
  ) {
    const parsed =
      XLSX.SSF.parse_date_code(
        value
      )

    if (parsed) {
      return `${parsed.y}-${String(
        parsed.m
      ).padStart(
        2,
        '0'
      )}`
    }
  }

  const raw =
    String(
      value ?? ''
    ).trim()

  const iso =
    raw.match(
      /^(\d{4})-(\d{1,2})/
    )

  if (iso) {
    return `${iso[1]}-${iso[2].padStart(
      2,
      '0'
    )}`
  }

  const brazilian =
    raw.match(
      /^(\d{1,2})[\/-](\d{4})$/
    )

  if (brazilian) {
    return `${brazilian[2]}-${brazilian[1].padStart(
      2,
      '0'
    )}`
  }

  return raw
}


function calculatedMonthlyInterest(
  row: PeriodRow
) {
  return (
    row.financedBalance *
    (
      row.statedMonthlyRate /
      100
    )
  )
}


function annualEquivalentRate(
  monthlyRate: number
) {
  if (
    monthlyRate <= 0
  ) {
    return 0
  }

  return (
    (
      Math.pow(
        1 +
        monthlyRate / 100,
        12
      ) - 1
    ) * 100
  )
}


export function RevolvingCardPage() {
  const {
    caseId,
  } = useParams()

  const navigate =
    useNavigate()

  const {
    user,
  } = useAuth()


  const [
    clientName,
    setClientName,
  ] = useState('')


  const [
    clientDocument,
    setClientDocument,
  ] = useState('')


  const [
    processNumber,
    setProcessNumber,
  ] = useState('')


  const [
    clientReference,
    setClientReference,
  ] = useState('')


  const [
    contractReference,
    setContractReference,
  ] = useState('')


  const [
    bankName,
    setBankName,
  ] = useState('')


  const [
    operationDate,
    setOperationDate,
  ] = useState('')


  const [
    originalDebt,
    setOriginalDebt,
  ] = useState(0)


  const [
    totalPaid,
    setTotalPaid,
  ] = useState(0)


  const [
    interestMode,
    setInterestMode,
  ] =
    useState<InterestMode>(
      'charged'
    )


  const [
    notes,
    setNotes,
  ] = useState('')


  const [
    rows,
    setRows,
  ] =
    useState<PeriodRow[]>([
      createRow(),
    ])


  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null
    )


  const [
    selectedFileName,
    setSelectedFileName,
  ] =
    useState('')


  const [
    documentId,
    setDocumentId,
  ] =
    useState<
      string | null
    >(null)


  const [
    savedCaseId,
    setSavedCaseId,
  ] =
    useState<
      string | null
    >(
      caseId ??
      null
    )


  const [
    message,
    setMessage,
  ] =
    useState('')


  const [
    working,
    setWorking,
  ] =
    useState(false)


  const [
    loadingCase,
    setLoadingCase,
  ] =
    useState(
      Boolean(caseId)
    )


  useEffect(() => {
    if (!caseId) {
      return
    }

    async function loadCase() {
      setLoadingCase(true)

      const [
        caseResult,
        periodsResult,
        documentsResult,
      ] =
        await Promise.all([
          supabase
            .from(
              'adv_cases'
            )
            .select(`
              id,
              client_name,
              client_document,
              process_number,
              client_reference,
              contract_reference,
              bank_name,
              operation_date,
              original_debt,
              total_paid,
              interest_mode,
              notes
            `)
            .eq(
              'id',
              caseId
            )
            .single(),

          supabase
            .from(
              'adv_case_periods'
            )
            .select(`
              id,
              competence,
              financed_balance,
              stated_monthly_rate,
              charged_revolving_interest,
              revolving_interest,
              installment_interest,
              late_interest,
              fine,
              other_charges
            `)
            .eq(
              'case_id',
              caseId
            )
            .order(
              'competence'
            ),

          supabase
            .from(
              'adv_documents'
            )
            .select(`
              id,
              original_name
            `)
            .eq(
              'case_id',
              caseId
            )
            .order(
              'created_at',
              {
                ascending:
                  false,
              }
            )
            .limit(1),
        ])

      if (
        caseResult.error
      ) {
        setMessage(
          caseResult
            .error.message
        )

        setLoadingCase(
          false
        )

        return
      }

      const item =
        caseResult.data

      setClientName(
        item.client_name ??
        ''
      )

      setClientDocument(
        item.client_document ??
        ''
      )

      setProcessNumber(
        item.process_number ??
        ''
      )

      setClientReference(
        item.client_reference ??
        ''
      )

      setContractReference(
        item.contract_reference ??
        ''
      )

      setBankName(
        item.bank_name ??
        ''
      )

      setOperationDate(
        item.operation_date ??
        ''
      )

      setOriginalDebt(
        Number(
          item.original_debt ??
          0
        )
      )

      setTotalPaid(
        Number(
          item.total_paid ??
          0
        )
      )

      setInterestMode(
        item.interest_mode ===
          'rate'
          ? 'rate'
          : 'charged'
      )

      setNotes(
        item.notes ??
        ''
      )

      const databaseRows =
        periodsResult.data ??
        []

      if (
        databaseRows.length >
        0
      ) {
        setRows(
          databaseRows.map(
            (row) => ({
              id:
                row.id,

              competence:
                row.competence ??
                '',

              financedBalance:
                Number(
                  row.financed_balance ??
                  0
                ),

              statedMonthlyRate:
                Number(
                  row.stated_monthly_rate ??
                  0
                ),

              chargedRevolvingInterest:
                Number(
                  row.charged_revolving_interest ??
                  row.revolving_interest ??
                  0
                ),

              installmentInterest:
                Number(
                  row.installment_interest ??
                  0
                ),

              lateInterest:
                Number(
                  row.late_interest ??
                  0
                ),

              fine:
                Number(
                  row.fine ??
                  0
                ),

              otherCharges:
                Number(
                  row.other_charges ??
                  0
                ),
            })
          )
        )
      }

      const document =
        documentsResult
          .data?.[0]

      if (document) {
        setDocumentId(
          document.id
        )

        setSelectedFileName(
          document.original_name
        )
      }

      setSavedCaseId(
        caseId ?? null
      )

      setLoadingCase(
        false
      )
    }

    void loadCase()
  }, [caseId])


  function updateRow(
    id: string,
    field:
      keyof PeriodRow,
    value: string
  ) {
    setRows(
      (current) =>
        current.map(
          (row) => {
            if (
              row.id !== id
            ) {
              return row
            }

            return {
              ...row,

              [field]:
                field ===
                'competence'
                  ? value
                  : numeric(
                      value
                    ),
            }
          }
        )
    )
  }


  function removeRow(
    id: string
  ) {
    if (
      rows.length === 1
    ) {
      return
    }

    setRows(
      (current) =>
        current.filter(
          (row) =>
            row.id !== id
        )
    )
  }


  function interestUsed(
    row: PeriodRow
  ) {
    if (
      interestMode ===
      'rate'
    ) {
      return calculatedMonthlyInterest(
        row
      )
    }

    return row
      .chargedRevolvingInterest
  }


  function rowTotal(
    row: PeriodRow
  ) {
    return (
      interestUsed(row) +
      row.installmentInterest +
      row.lateInterest +
      row.fine +
      row.otherCharges
    )
  }


  const result =
    useMemo(
      () => {
        const expectedInterest =
          rows.reduce(
            (
              total,
              row
            ) =>
              total +
              calculatedMonthlyInterest(
                row
              ),
            0
          )

        const chargedInterest =
          rows.reduce(
            (
              total,
              row
            ) =>
              total +
              row
                .chargedRevolvingInterest,
            0
          )

        const revolvingUsed =
          interestMode ===
          'rate'
            ? expectedInterest
            : chargedInterest

        const nonRevolvingCharges =
          rows.reduce(
            (
              total,
              row
            ) =>
              total +
              row
                .installmentInterest +
              row
                .lateInterest +
              row.fine +
              row
                .otherCharges,
            0
          )

        const charges =
          revolvingUsed +
          nonRevolvingCharges

        const applicable =
          Boolean(
            operationDate
          ) &&
          operationDate >=
            '2024-01-03'

        const capPercentage =
          originalDebt > 0
            ? (
                charges /
                originalDebt
              ) * 100
            : 0

        const excess =
          applicable
            ? Math.max(
                0,
                charges -
                  originalDebt
              )
            : 0

        const remainingCap =
          applicable
            ? Math.max(
                0,
                originalDebt -
                  charges
              )
            : 0

        const totalDebt =
          originalDebt +
          charges

        const arithmeticBalance =
          Math.max(
            0,
            totalDebt -
              totalPaid
          )

        const rateDifference =
          chargedInterest -
          expectedInterest

        return {
          expectedInterest,

          chargedInterest,

          revolvingUsed,

          nonRevolvingCharges,

          charges,

          applicable,

          capPercentage,

          excess,

          remainingCap,

          totalDebt,

          arithmeticBalance,

          rateDifference,
        }
      },
      [
        rows,
        interestMode,
        operationDate,
        originalDebt,
        totalPaid,
      ]
    )


  function conclusionText() {
    if (
      !operationDate
    ) {
      return (
        'Data da operação não informada. A análise automática do limite legal não foi concluída.'
      )
    }

    if (
      !result.applicable
    ) {
      return (
        'A operação informada é anterior a 03/01/2024. A ferramenta não aplicou automaticamente o teto de 100%, sendo necessária análise específica da operação e dos documentos.'
      )
    }

    if (
      result.excess > 0
    ) {
      return (
        `Na análise aritmética simplificada, os juros e encargos informados totalizaram ${money.format(result.charges)}, indicando possível excedente de ${money.format(result.excess)} em relação ao valor original informado da dívida. O resultado deve ser confirmado à luz da natureza de cada operação, contrato e fatura.`
      )
    }

    return (
      `Na análise aritmética simplificada, não foi identificado excedente em relação ao teto considerado nesta ferramenta. Os juros e encargos informados totalizaram ${money.format(result.charges)}, equivalentes a ${result.capPercentage.toFixed(2)}% do valor original informado. Isso não representa conclusão sobre a regularidade das demais cobranças ou cláusulas contratuais.`
    )
  }


  function downloadTemplate() {
    const headers = [
      {
        competencia: '',

        saldo_financiado:
          '',

        taxa_mensal:
          '',

        juros_cobrados:
          '',

        juros_parcelamento:
          '',

        juros_mora:
          '',

        multa:
          '',

        outros_encargos:
          '',
      },
    ]

    const worksheet =
      XLSX.utils.json_to_sheet(
        headers
      )

    worksheet[
      '!cols'
    ] = [
      { wch: 17 },
      { wch: 20 },
      { wch: 17 },
      { wch: 20 },
      { wch: 23 },
      { wch: 17 },
      { wch: 14 },
      { wch: 20 },
    ]

    const instructionRows = [
      [
        'LEVEL ADV - Modelo para análise de rotativo',
      ],

      [
        '',
      ],

      [
        'competencia',
        'Use AAAA-MM ou MM/AAAA.',
      ],

      [
        'saldo_financiado',
        'Saldo sobre o qual a taxa foi aplicada.',
      ],

      [
        'taxa_mensal',
        'Percentual mensal. Exemplo: 15,90.',
      ],

      [
        'juros_cobrados',
        'Valor efetivamente identificado na fatura.',
      ],

      [
        'juros_parcelamento',
        'Encargo referente ao parcelamento do saldo.',
      ],

      [
        'juros_mora',
        'Juros de mora identificados.',
      ],

      [
        'multa',
        'Valor de multa identificado.',
      ],

      [
        'outros_encargos',
        'Demais encargos financeiros analisados.',
      ],

      [
        '',
      ],

      [
        'IMPORTANTE',
        'Revise os dados importados antes de utilizar o resultado em uma análise jurídica.',
      ],
    ]

    const instructions =
      XLSX.utils
        .aoa_to_sheet(
          instructionRows
        )

    instructions[
      '!cols'
    ] = [
      { wch: 25 },
      { wch: 80 },
    ]

    const workbook =
      XLSX.utils
        .book_new()

    XLSX.utils
      .book_append_sheet(
        workbook,
        worksheet,
        'Lancamentos'
      )

    XLSX.utils
      .book_append_sheet(
        workbook,
        instructions,
        'Instrucoes'
      )

    XLSX.writeFile(
      workbook,
      'modelo-level-adv-rotativo.xlsx'
    )
  }


  async function importSpreadsheet(
    file: File
  ) {
    try {
      const buffer =
        await file
          .arrayBuffer()

      const workbook =
        XLSX.read(
          buffer
        )

      const sheet =
        workbook.Sheets[
          workbook
            .SheetNames[0]
        ]

      const rawRows =
        XLSX.utils
          .sheet_to_json<
            Record<
              string,
              unknown
            >
          >(
            sheet,
            {
              defval: '',
            }
          )

      const parsed =
        rawRows
          .map(
            (raw) => {
              const data:
                Record<
                  string,
                  unknown
                > = {}

              for (
                const [
                  key,
                  value,
                ] of Object.entries(
                  raw
                )
              ) {
                data[
                  normalizeKey(
                    key
                  )
                ] = value
              }

              return {
                id:
                  crypto.randomUUID(),

                competence:
                  normalizeCompetence(
                    data.competencia ??
                    data.mes ??
                    ''
                  ),

                financedBalance:
                  numeric(
                    data.saldo_financiado ??
                    data.saldo ??
                    0
                  ),

                statedMonthlyRate:
                  numeric(
                    data.taxa_mensal ??
                    data.taxa ??
                    0
                  ),

                chargedRevolvingInterest:
                  numeric(
                    data.juros_cobrados ??
                    data.juros_rotativo ??
                    data.rotativo ??
                    0
                  ),

                installmentInterest:
                  numeric(
                    data.juros_parcelamento ??
                    data.parcelamento ??
                    0
                  ),

                lateInterest:
                  numeric(
                    data.juros_mora ??
                    data.mora ??
                    0
                  ),

                fine:
                  numeric(
                    data.multa ??
                    0
                  ),

                otherCharges:
                  numeric(
                    data.outros_encargos ??
                    data.outros ??
                    0
                  ),
              }
            }
          )
          .filter(
            (row) =>
              row.competence ||
              row.financedBalance ||
              row
                .statedMonthlyRate ||
              row
                .chargedRevolvingInterest ||
              row
                .installmentInterest ||
              row
                .lateInterest ||
              row.fine ||
              row
                .otherCharges
          )

      if (
        parsed.length === 0
      ) {
        setMessage(
          'A planilha foi aberta, mas nenhum lançamento reconhecido foi encontrado.'
        )

        return
      }

      setRows(parsed)

      setMessage(
        `${parsed.length} período(s) importado(s). Revise todos os valores antes de salvar.`
      )
    } catch {
      setMessage(
        'Não foi possível interpretar esta planilha. Utilize o modelo da LEVEL ADV.'
      )
    }
  }


  async function selectDocument(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target
        .files?.[0]

    if (!file) {
      return
    }

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase()

    const allowed =
      [
        'pdf',
        'xlsx',
        'xls',
        'csv',
      ].includes(
        extension ?? ''
      )

    if (!allowed) {
      setMessage(
        'Formato não permitido. Utilize PDF, XLSX, XLS ou CSV.'
      )

      return
    }

    if (
      file.size >
      20 * 1024 * 1024
    ) {
      setMessage(
        'O arquivo deve ter no máximo 20 MB.'
      )

      return
    }

    setSelectedFile(
      file
    )

    setSelectedFileName(
      file.name
    )

    if (
      [
        'xlsx',
        'xls',
        'csv',
      ].includes(
        extension ?? ''
      )
    ) {
      await importSpreadsheet(
        file
      )

      return
    }

    setMessage(
      'PDF selecionado. Ele poderá ser anexado ao caso. A leitura automática será feita pelo módulo LEVEL IA.'
    )
  }


  async function saveCase() {
    if (!user) {
      return null
    }

    if (
      originalDebt <= 0
    ) {
      setMessage(
        'Informe o valor original da dívida antes de salvar.'
      )

      return null
    }

    setWorking(true)
    setMessage('')

    const payload = {
      user_id:
        user.id,

      client_name:
        clientName.trim() ||
        null,

      client_document:
        clientDocument.trim() ||
        null,

      process_number:
        processNumber.trim() ||
        null,

      client_reference:
        clientReference.trim() ||
        null,

      contract_reference:
        contractReference.trim() ||
        null,

      bank_name:
        bankName.trim() ||
        null,

      operation_date:
        operationDate ||
        null,

      original_debt:
        originalDebt,

      total_paid:
        totalPaid,

      interest_mode:
        interestMode,

      notes:
        notes.trim() ||
        null,

      technical_conclusion:
        conclusionText(),

      status:
        'completed',

      updated_at:
        new Date()
          .toISOString(),
    }

    let currentCaseId =
      savedCaseId

    if (currentCaseId) {
      const {
        error,
      } =
        await supabase
          .from(
            'adv_cases'
          )
          .update(
            payload
          )
          .eq(
            'id',
            currentCaseId
          )

      if (error) {
        setMessage(
          error.message
        )

        setWorking(false)

        return null
      }

      const {
        error:
          deletePeriodsError,
      } =
        await supabase
          .from(
            'adv_case_periods'
          )
          .delete()
          .eq(
            'case_id',
            currentCaseId
          )

      if (
        deletePeriodsError
      ) {
        setMessage(
          deletePeriodsError
            .message
        )

        setWorking(false)

        return null
      }
    } else {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            'adv_cases'
          )
          .insert(
            payload
          )
          .select('id')
          .single()

      if (error) {
        setMessage(
          error.message
        )

        setWorking(false)

        return null
      }

      currentCaseId =
        data.id

      setSavedCaseId(
        data.id
      )
    }

    const validRows =
      rows.filter(
        (row) =>
          row.competence ||
          row.financedBalance ||
          row.statedMonthlyRate ||
          row
            .chargedRevolvingInterest ||
          row
            .installmentInterest ||
          row
            .lateInterest ||
          row.fine ||
          row.otherCharges
      )

    if (
      validRows.length >
      0
    ) {
      const {
        error,
      } =
        await supabase
          .from(
            'adv_case_periods'
          )
          .insert(
            validRows.map(
              (row) => {
                const calculated =
                  calculatedMonthlyInterest(
                    row
                  )

                const used =
                  interestMode ===
                  'rate'
                    ? calculated
                    : row
                        .chargedRevolvingInterest

                return {
                  case_id:
                    currentCaseId,

                  competence:
                    row.competence ||
                    null,

                  financed_balance:
                    row.financedBalance,

                  stated_monthly_rate:
                    row.statedMonthlyRate,

                  annual_equivalent_rate:
                    annualEquivalentRate(
                      row
                        .statedMonthlyRate
                    ),

                  calculated_revolving_interest:
                    calculated,

                  charged_revolving_interest:
                    row
                      .chargedRevolvingInterest,

                  revolving_interest:
                    used,

                  installment_interest:
                    row
                      .installmentInterest,

                  late_interest:
                    row
                      .lateInterest,

                  fine:
                    row.fine,

                  other_charges:
                    row
                      .otherCharges,
                }
              }
            )
          )

      if (error) {
        setMessage(
          error.message
        )

        setWorking(false)

        return null
      }
    }

    setMessage(
      savedCaseId
        ? 'Caso atualizado com sucesso.'
        : 'Caso salvo com sucesso na LEVEL ADV.'
    )

    setWorking(false)

    if (
      !caseId &&
      currentCaseId
    ) {
      navigate(
        `/app/calculadoras/bancario/rotativo/${currentCaseId}`,
        {
          replace: true,
        }
      )
    }

    return currentCaseId
  }


  async function uploadDocument() {
    if (
      !selectedFile ||
      !user
    ) {
      return
    }

    let currentCaseId =
      savedCaseId

    if (!currentCaseId) {
      currentCaseId =
        await saveCase()
    }

    if (!currentCaseId) {
      return
    }

    setWorking(true)

    const safeName =
      selectedFile.name
        .replace(
          /[^a-zA-Z0-9._-]/g,
          '_'
        )

    const path =
      `${user.id}/${currentCaseId}/${Date.now()}-${safeName}`

    const {
      error:
        uploadError,
    } =
      await supabase
        .storage
        .from(
          'level-adv-documents'
        )
        .upload(
          path,
          selectedFile,
          {
            upsert: false,
          }
        )

    if (uploadError) {
      setMessage(
        uploadError.message
      )

      setWorking(false)

      return
    }

    const {
      data,
      error,
    } =
      await supabase
        .from(
          'adv_documents'
        )
        .insert({
          user_id:
            user.id,

          case_id:
            currentCaseId,

          original_name:
            selectedFile.name,

          storage_path:
            path,

          mime_type:
            selectedFile.type ||
            null,

          file_size:
            selectedFile.size,

          extraction_status:
            'pending',
        })
        .select('id')
        .single()

    if (error) {
      setMessage(
        error.message
      )
    } else {
      setDocumentId(
        data.id
      )

      setSelectedFile(
        null
      )

      setMessage(
        'Documento anexado ao caso com sucesso.'
      )
    }

    setWorking(false)
  }


  async function requestAnalysis() {
    if (!user) {
      return
    }

    let currentCaseId =
      savedCaseId

    if (!currentCaseId) {
      currentCaseId =
        await saveCase()
    }

    if (!currentCaseId) {
      return
    }

    setWorking(true)

    const monthStart =
      new Date()

    monthStart.setDate(1)

    monthStart.setHours(
      0,
      0,
      0,
      0
    )

    const {
      count,
      error:
        countError,
    } =
      await supabase
        .from(
          'adv_analysis_requests'
        )
        .select(
          'id',
          {
            count: 'exact',

            head: true,
          }
        )
        .gte(
          'requested_at',
          monthStart
            .toISOString()
        )

    if (countError) {
      setMessage(
        countError.message
      )

      setWorking(false)

      return
    }

    if (
      (count ?? 0) >=
      3
    ) {
      setMessage(
        'O limite inicial de 3 solicitações aprofundadas neste mês foi atingido.'
      )

      setWorking(false)

      return
    }

    const {
      error,
    } =
      await supabase
        .from(
          'adv_analysis_requests'
        )
        .insert({
          user_id:
            user.id,

          case_id:
            currentCaseId,

          document_id:
            documentId,

          title:
            `Análise aprofundada${clientName ? ` - ${clientName}` : ''}${bankName ? ` / ${bankName}` : ''}`,

          description:
            `Solicitação de revisão aprofundada do caso. Resultado preliminar: ${conclusionText()}`,
        })

    if (error) {
      setMessage(
        error.message
      )
    } else {
      setMessage(
        'Solicitação enviada para a administração da LEVEL ADV.'
      )
    }

    setWorking(false)
  }


  function newAnalysis() {
    navigate(
      '/app/calculadoras/bancario/rotativo'
    )

    setClientName('')
    setClientDocument('')
    setProcessNumber('')
    setClientReference('')
    setContractReference('')
    setBankName('')
    setOperationDate('')
    setOriginalDebt(0)
    setTotalPaid(0)

    setInterestMode(
      'charged'
    )

    setNotes('')

    setRows([
      createRow(),
    ])

    setSelectedFile(null)
    setSelectedFileName('')
    setDocumentId(null)
    setSavedCaseId(null)
    setMessage('')
  }


  if (loadingCase) {
    return (
      <div className="page">
        <div className="empty-state">
          Carregando análise...
        </div>
      </div>
    )
  }


  return (
    <div className="page calculator-page">

      <Link
        to="/app/calculadoras/bancario"
        className="calculator-back"
      >
        <ArrowLeft size={15} />

        Voltar para Bancário
      </Link>


      <div className="page-heading">
        <span className="eyebrow">
          BANCARIO / CARTAO DE CREDITO
        </span>

        <h1>
          Análise de Rotativo
        </h1>

        <p>
          Compare a cobrança efetivamente
          encontrada nas faturas com o
          resultado matemático da taxa
          informada e organize todos os
          encargos da operação.
        </p>
      </div>


      {message && (
        <div className="system-message">
          {message}
        </div>
      )}


      <section className="panel case-identification">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              IDENTIFICAÇÃO
            </span>

            <h2>
              Dados do caso
            </h2>
          </div>
        </div>

        <div className="case-fields case-fields-v2">

          <label>
            Cliente

            <input
              value={clientName}
              onChange={(event) =>
                setClientName(
                  event.target.value
                )
              }
              placeholder="Nome do cliente"
            />
          </label>


          <label>
            CPF / CNPJ
            <small>
              Opcional
            </small>

            <input
              value={
                clientDocument
              }
              onChange={(event) =>
                setClientDocument(
                  event.target.value
                )
              }
              placeholder="Somente se necessário"
            />
          </label>


          <label>
            Processo

            <input
              value={processNumber}
              onChange={(event) =>
                setProcessNumber(
                  event.target.value
                )
              }
              placeholder="Número do processo"
            />
          </label>


          <label>
            Referência interna

            <input
              value={
                clientReference
              }
              onChange={(event) =>
                setClientReference(
                  event.target.value
                )
              }
              placeholder="Ex.: CASO-001"
            />
          </label>


          <label>
            Banco / instituição

            <input
              value={bankName}
              onChange={(event) =>
                setBankName(
                  event.target.value
                )
              }
              placeholder="Ex.: Banco XYZ"
            />
          </label>


          <label>
            Contrato / referência
            <small>
              Não informe número completo do cartão
            </small>

            <input
              value={
                contractReference
              }
              onChange={(event) =>
                setContractReference(
                  event.target.value
                )
              }
              placeholder="Contrato ou referência"
            />
          </label>


          <label>
            Início da operação

            <input
              type="date"
              value={operationDate}
              onChange={(event) =>
                setOperationDate(
                  event.target.value
                )
              }
            />
          </label>


          <label>
            Valor original da dívida

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                originalDebt ||
                ''
              }
              onChange={(event) =>
                setOriginalDebt(
                  numeric(
                    event.target.value
                  )
                )
              }
              placeholder="0,00"
            />
          </label>


          <label>
            Total pago informado

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                totalPaid ||
                ''
              }
              onChange={(event) =>
                setTotalPaid(
                  numeric(
                    event.target.value
                  )
                )
              }
              placeholder="0,00"
            />
          </label>

        </div>
      </section>


      <section className="panel interest-mode-panel">

        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              MODO DE CÁLCULO
            </span>

            <h2>
              Como analisar os juros?
            </h2>

            <p>
              Você pode analisar o valor efetivamente
              cobrado pelo banco ou deixar a LEVEL
              calcular o juro matemático com base no
              saldo e na taxa mensal.
            </p>
          </div>

          <Calculator size={26} />
        </div>


        <div className="interest-mode-selector">

          <button
            type="button"
            className={
              interestMode ===
              'charged'
                ? 'interest-mode active'
                : 'interest-mode'
            }
            onClick={() =>
              setInterestMode(
                'charged'
              )
            }
          >
            <strong>
              Comparar cobrança do banco
            </strong>

            <span>
              Informe saldo, taxa e o valor
              efetivamente cobrado. A LEVEL mostra
              a diferença.
            </span>
          </button>


          <button
            type="button"
            className={
              interestMode ===
              'rate'
                ? 'interest-mode active'
                : 'interest-mode'
            }
            onClick={() =>
              setInterestMode(
                'rate'
              )
            }
          >
            <strong>
              Calcular pela taxa
            </strong>

            <span>
              A LEVEL usa saldo × taxa mensal para
              calcular automaticamente os juros do
              período.
            </span>
          </button>

        </div>
      </section>


      <section className="panel upload-panel">

        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              IMPORTAÇÃO
            </span>

            <h2>
              Documento ou planilha
            </h2>

            <p>
              Utilize o modelo oficial da LEVEL ADV
              para importar períodos automaticamente.
              PDFs ficam vinculados ao caso para
              análise posterior.
            </p>
          </div>

          <FileSpreadsheet
            size={26}
          />
        </div>


        <div className="template-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={
              downloadTemplate
            }
          >
            <Download size={17} />

            Baixar modelo XLSX
          </button>


          <label className="file-picker">
            <FileUp size={19} />

            <span>
              {selectedFileName ||
                'Selecionar PDF ou planilha'}
            </span>

            <input
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,application/pdf"
              onChange={
                selectDocument
              }
            />
          </label>


          <button
            type="button"
            className="secondary-button"
            disabled={
              !selectedFile ||
              working
            }
            onClick={() =>
              void uploadDocument()
            }
          >
            Enviar arquivo
          </button>

        </div>


        <div className="spreadsheet-hint">
          <code>
            competencia
          </code>

          <code>
            saldo_financiado
          </code>

          <code>
            taxa_mensal
          </code>

          <code>
            juros_cobrados
          </code>

          <code>
            juros_parcelamento
          </code>

          <code>
            juros_mora
          </code>

          <code>
            multa
          </code>

          <code>
            outros_encargos
          </code>
        </div>

      </section>


      <section className="panel">

        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              FATURAS / PERÍODOS
            </span>

            <h2>
              Evolução mês a mês
            </h2>
          </div>


          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setRows(
                (current) => [
                  ...current,

                  createRow(),
                ]
              )
            }
          >
            <Plus size={16} />

            Adicionar mês
          </button>
        </div>


        <div className="finance-table-wrap">

          <div className="finance-table finance-table-v2">

            <div className="finance-head finance-head-v2">
              <span>Mês</span>

              <span>
                Saldo financiado
              </span>

              <span>
                Taxa % a.m.
              </span>

              <span>
                Taxa % a.a.
              </span>

              <span>
                Juro pela taxa
              </span>

              <span>
                Juro cobrado
              </span>

              <span>
                Diferença
              </span>

              <span>
                Parcelamento
              </span>

              <span>
                Mora
              </span>

              <span>
                Multa
              </span>

              <span>
                Outros
              </span>

              <span>
                Total analisado
              </span>

              <span />
            </div>


            {rows.map(
              (row) => {
                const calculated =
                  calculatedMonthlyInterest(
                    row
                  )

                const annual =
                  annualEquivalentRate(
                    row.statedMonthlyRate
                  )

                const difference =
                  row
                    .chargedRevolvingInterest -
                  calculated

                return (
                  <div
                    className="finance-row finance-row-v2"
                    key={row.id}
                  >

                    <input
                      type="month"
                      value={
                        row.competence
                      }
                      onChange={(event) =>
                        updateRow(
                          row.id,
                          'competence',
                          event.target.value
                        )
                      }
                    />


                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        row.financedBalance ||
                        ''
                      }
                      onChange={(event) =>
                        updateRow(
                          row.id,
                          'financedBalance',
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                    />


                    <input
                      type="number"
                      min="0"
                      step="0.0001"
                      value={
                        row.statedMonthlyRate ||
                        ''
                      }
                      onChange={(event) =>
                        updateRow(
                          row.id,
                          'statedMonthlyRate',
                          event.target.value
                        )
                      }
                      placeholder="0,0000"
                    />


                    <div className="calculated-cell">
                      {percentage.format(
                        annual
                      )}
                      %
                    </div>


                    <div className="calculated-cell gold-cell">
                      {money.format(
                        calculated
                      )}
                    </div>


                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={
                        interestMode ===
                        'rate'
                      }
                      value={
                        row
                          .chargedRevolvingInterest ||
                        ''
                      }
                      onChange={(event) =>
                        updateRow(
                          row.id,
                          'chargedRevolvingInterest',
                          event.target.value
                        )
                      }
                      placeholder={
                        interestMode ===
                        'rate'
                          ? 'Automático'
                          : '0,00'
                      }
                    />


                    <div
                      className={
                        difference > 0
                          ? 'calculated-cell difference-positive'
                          : difference < 0
                            ? 'calculated-cell difference-negative'
                            : 'calculated-cell'
                      }
                    >
                      {interestMode ===
                      'rate'
                        ? '—'
                        : money.format(
                            difference
                          )}
                    </div>


                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        row
                          .installmentInterest ||
                        ''
                      }
                      onChange={(event) =>
                        updateRow(
                          row.id,
                          'installmentInterest',
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                    />


                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        row.lateInterest ||
                        ''
                      }
                      onChange={(event) =>
                        updateRow(
                          row.id,
                          'lateInterest',
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                    />


                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        row.fine ||
                        ''
                      }
                      onChange={(event) =>
                        updateRow(
                          row.id,
                          'fine',
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                    />


                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        row.otherCharges ||
                        ''
                      }
                      onChange={(event) =>
                        updateRow(
                          row.id,
                          'otherCharges',
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                    />


                    <strong className="row-total">
                      {money.format(
                        rowTotal(row)
                      )}
                    </strong>


                    <button
                      type="button"
                      className="icon-button danger"
                      disabled={
                        rows.length ===
                        1
                      }
                      onClick={() =>
                        removeRow(
                          row.id
                        )
                      }
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>
                )
              }
            )}

          </div>
        </div>
      </section>


      <section className="comparison-panel">

        <div className="comparison-heading">
          <span className="eyebrow">
            COMPARAÇÃO
          </span>

          <h2>
            Taxa informada × cobrança encontrada
          </h2>
        </div>


        <div className="comparison-grid">

          <article>
            <span>
              JURO CALCULADO PELA TAXA
            </span>

            <strong>
              {money.format(
                result.expectedInterest
              )}
            </strong>
          </article>


          <article>
            <span>
              JURO INFORMADO COMO COBRADO
            </span>

            <strong>
              {money.format(
                result.chargedInterest
              )}
            </strong>
          </article>


          <article
            className={
              result.rateDifference >
              0
                ? 'comparison-alert'
                : ''
            }
          >
            <span>
              DIFERENÇA
            </span>

            <strong>
              {interestMode ===
              'charged'
                ? money.format(
                    result.rateDifference
                  )
                : '—'}
            </strong>

            <small>
              Cobrado menos cálculo simples da taxa
              mensal informada.
            </small>
          </article>

        </div>
      </section>


      <section className="result-grid result-grid-v2">

        <article>
          <span>
            VALOR ORIGINAL
          </span>

          <strong>
            {money.format(
              originalDebt
            )}
          </strong>
        </article>


        <article>
          <span>
            JUROS + ENCARGOS ANALISADOS
          </span>

          <strong>
            {money.format(
              result.charges
            )}
          </strong>

          <small>
            {result.capPercentage.toFixed(
              2
            )}
            % do valor original
          </small>
        </article>


        <article>
          <span>
            DÍVIDA + ENCARGOS
          </span>

          <strong>
            {money.format(
              result.totalDebt
            )}
          </strong>
        </article>


        <article>
          <span>
            PAGAMENTOS INFORMADOS
          </span>

          <strong>
            {money.format(
              totalPaid
            )}
          </strong>
        </article>


        <article>
          <span>
            SALDO ARITMÉTICO DO CENÁRIO
          </span>

          <strong>
            {money.format(
              result.arithmeticBalance
            )}
          </strong>
        </article>


        <article
          className={
            result.applicable &&
            result.excess >
              0
              ? 'result-danger'
              : 'result-highlight'
          }
        >
          <span>
            POSSÍVEL EXCEDENTE
          </span>

          <strong>
            {result.applicable
              ? money.format(
                  result.excess
                )
              : 'Revisar'}
          </strong>
        </article>

      </section>


      {!operationDate && (
        <section className="analysis-box neutral">
          <AlertTriangle size={22} />

          <div>
            <strong>
              Informe a data da operação
            </strong>

            <p>
              A data é necessária para selecionar
              corretamente o critério automático
              desta versão.
            </p>
          </div>
        </section>
      )}


      {operationDate &&
        !result.applicable && (
          <section className="analysis-box warning">
            <AlertTriangle size={22} />

            <div>
              <strong>
                Operação anterior a 03/01/2024
              </strong>

              <p>
                A LEVEL não aplicou automaticamente
                o teto de 100%. O caso exige análise
                específica da operação e dos
                documentos.
              </p>
            </div>
          </section>
        )}


      {result.applicable &&
        result.excess ===
          0 && (
          <section className="analysis-box success">
            <CheckCircle2 size={22} />

            <div>
              <strong>
                Sem excedente identificado nesta regra
              </strong>

              <p>
                Restam{' '}
                {money.format(
                  result.remainingCap
                )}{' '}
                até o limite aritmético utilizado por
                esta análise. Isso não significa que
                todas as demais cobranças sejam
                necessariamente regulares.
              </p>
            </div>
          </section>
        )}


      {result.applicable &&
        result.excess >
          0 && (
          <section className="analysis-box danger">
            <AlertTriangle size={22} />

            <div>
              <strong>
                Possível excedente identificado
              </strong>

              <p>
                Os juros e encargos informados
                ultrapassaram o valor original da
                dívida em{' '}
                {money.format(
                  result.excess
                )}.
              </p>
            </div>
          </section>
        )}


      <section className="panel conclusion-panel">

        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              CONCLUSÃO PRELIMINAR
            </span>

            <h2>
              Resultado técnico automático
            </h2>
          </div>
        </div>

        <p>
          {conclusionText()}
        </p>

        <label>
          Observações do advogado

          <textarea
            rows={5}
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value
              )
            }
            placeholder="Registre aqui observações, divergências encontradas, informações do contrato ou pontos que precisam de revisão."
          />
        </label>

      </section>


      <section className="legal-box">

        <Scale size={22} />

        <div>
          <strong>
            Critério e limites da ferramenta
          </strong>

          <p>
            A LEVEL ADV realiza cálculos de apoio com
            base nos dados inseridos ou importados.
            A aplicação do limite de juros e encargos
            depende da correta identificação da
            operação, do valor original da dívida,
            das datas e da natureza das cobranças.
            Revise os documentos antes de utilizar o
            resultado profissionalmente.
          </p>
        </div>

      </section>


      <div className="calculator-actions">

        <button
          type="button"
          className="secondary-button"
          onClick={
            newAnalysis
          }
        >
          Nova análise
        </button>


        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            window.print()
          }
        >
          <Printer size={16} />

          Imprimir / salvar PDF
        </button>


        <button
          type="button"
          className="secondary-button"
          disabled={working}
          onClick={() =>
            void saveCase()
          }
        >
          <Save size={16} />

          {savedCaseId
            ? 'Atualizar caso'
            : 'Salvar caso'}
        </button>


        <button
          type="button"
          className="primary-button"
          disabled={working}
          onClick={() =>
            void requestAnalysis()
          }
        >
          <Send size={16} />

          Solicitar análise aprofundada
        </button>

      </div>

    </div>
  )
}
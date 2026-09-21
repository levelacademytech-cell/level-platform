import {
  AlertTriangle,
  CheckCircle2,
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
  useMemo,
  useState,
  type ChangeEvent,
} from 'react'

import * as XLSX from 'xlsx'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'

type PeriodRow = {
  id: string
  competence: string
  financedBalance: number
  statedMonthlyRate: number
  revolvingInterest: number
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
    revolvingInterest: 0,
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

function numeric(
  value: unknown
) {
  if (
    typeof value === 'number'
  ) {
    return Number.isFinite(value)
      ? value
      : 0
  }

  if (
    typeof value !== 'string'
  ) {
    return 0
  }

  const raw =
    value
      .trim()
      .replace(/[R$\s]/g, '')

  if (!raw) return 0

  const normalized =
    raw.includes(',')
      ? raw
          .replace(/\./g, '')
          .replace(',', '.')
      : raw

  const parsed =
    Number(normalized)

  return Number.isFinite(parsed)
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
    typeof value === 'number'
  ) {
    const date =
      XLSX.SSF
        .parse_date_code(value)

    if (date) {
      return `${date.y}-${String(
        date.m
      ).padStart(2, '0')}`
    }
  }

  const raw =
    String(value ?? '')
      .trim()

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

  const br =
    raw.match(
      /^(\d{1,2})[\/-](\d{4})$/
    )

  if (br) {
    return `${br[2]}-${br[1].padStart(
      2,
      '0'
    )}`
  }

  return raw
}

export function RevolvingCardPage() {
  const { user } = useAuth()

  const [
    clientReference,
    setClientReference,
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

  const [rows, setRows] =
    useState<PeriodRow[]>([
      createRow(),
    ])

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(
    null
  )

  const [
    documentId,
    setDocumentId,
  ] = useState<
    string | null
  >(null)

  const [
    savedCaseId,
    setSavedCaseId,
  ] = useState<
    string | null
  >(null)

  const [message, setMessage] =
    useState('')

  const [working, setWorking] =
    useState(false)

  const result = useMemo(
    () => {
      const charges =
        rows.reduce(
          (total, row) =>
            total +
            row.revolvingInterest +
            row.installmentInterest +
            row.lateInterest +
            row.fine +
            row.otherCharges,
          0
        )

      const applicable =
        Boolean(operationDate) &&
        operationDate >=
          '2024-01-03'

      const percentage =
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

      const remaining =
        applicable
          ? Math.max(
              0,
              originalDebt -
                charges
            )
          : 0

      return {
        charges,
        applicable,
        percentage,
        excess,
        remaining,
        totalDebt:
          originalDebt +
          charges,
      }
    },
    [
      rows,
      operationDate,
      originalDebt,
    ]
  )

  function updateRow(
    id: string,
    field: keyof PeriodRow,
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

  function rowTotal(
    row: PeriodRow
  ) {
    return (
      row.revolvingInterest +
      row.installmentInterest +
      row.lateInterest +
      row.fine +
      row.otherCharges
    )
  }

  async function importSpreadsheet(
    file: File
  ) {
    try {
      const buffer =
        await file.arrayBuffer()

      const workbook =
        XLSX.read(buffer)

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
          >(sheet, {
            defval: '',
          })

      const parsed =
        rawRows.map(
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

              revolvingInterest:
                numeric(
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

      if (
        parsed.length > 0
      ) {
        setRows(parsed)

        setMessage(
          `${parsed.length} periodo(s) importado(s) da planilha. Revise os valores antes de concluir a analise.`
        )
      }
    } catch {
      setMessage(
        'Nao foi possivel interpretar esta planilha. Verifique o formato das colunas.'
      )
    }
  }

  async function selectDocument(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0]

    if (!file) return

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
        'Formato nao permitido. Utilize PDF, XLSX, XLS ou CSV.'
      )

      return
    }

    if (
      file.size >
      20 * 1024 * 1024
    ) {
      setMessage(
        'O arquivo deve ter no maximo 20 MB.'
      )

      return
    }

    setSelectedFile(file)
    setDocumentId(null)

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
    } else {
      setMessage(
        'PDF selecionado. Nesta primeira versao ele sera armazenado com seguranca; a leitura automatica por IA sera adicionada no modulo LEVEL IA.'
      )
    }
  }

  async function uploadDocument() {
    if (
      !selectedFile ||
      !user
    ) {
      return
    }

    setWorking(true)
    setMessage('')

    const safeName =
      selectedFile.name
        .replace(
          /[^a-zA-Z0-9._-]/g,
          '_'
        )

    const path =
      `${user.id}/${Date.now()}-${safeName}`

    const {
      error: uploadError,
    } =
      await supabase.storage
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
            savedCaseId,

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

      setMessage(
        'Documento enviado com sucesso.'
      )
    }

    setWorking(false)
  }

  async function saveCase() {
    if (
      !user ||
      originalDebt <= 0
    ) {
      setMessage(
        'Informe o valor original da divida antes de salvar.'
      )

      return
    }

    setWorking(true)
    setMessage('')

    const {
      data: caseData,
      error: caseError,
    } =
      await supabase
        .from('adv_cases')
        .insert({
          user_id:
            user.id,

          client_reference:
            clientReference.trim() ||
            null,

          bank_name:
            bankName.trim() ||
            null,

          operation_date:
            operationDate ||
            null,

          original_debt:
            originalDebt,

          status:
            'completed',
        })
        .select('id')
        .single()

    if (caseError) {
      setMessage(
        caseError.message
      )

      setWorking(false)
      return
    }

    const validRows =
      rows.filter(
        (row) =>
          row.competence ||
          row.financedBalance ||
          row.revolvingInterest ||
          row.installmentInterest ||
          row.lateInterest ||
          row.fine ||
          row.otherCharges
      )

    if (
      validRows.length > 0
    ) {
      const { error } =
        await supabase
          .from(
            'adv_case_periods'
          )
          .insert(
            validRows.map(
              (row) => ({
                case_id:
                  caseData.id,

                competence:
                  row.competence ||
                  null,

                financed_balance:
                  row.financedBalance,

                stated_monthly_rate:
                  row.statedMonthlyRate,

                revolving_interest:
                  row.revolvingInterest,

                installment_interest:
                  row.installmentInterest,

                late_interest:
                  row.lateInterest,

                fine:
                  row.fine,

                other_charges:
                  row.otherCharges,
              })
            )
          )

      if (error) {
        setMessage(
          error.message
        )

        setWorking(false)
        return
      }
    }

    if (documentId) {
      await supabase
        .from(
          'adv_documents'
        )
        .update({
          case_id:
            caseData.id,
        })
        .eq(
          'id',
          documentId
        )
    }

    setSavedCaseId(
      caseData.id
    )

    setMessage(
      'Caso salvo com sucesso na LEVEL ADV.'
    )

    setWorking(false)
  }

  async function requestAnalysis() {
    if (!user) return

    if (
      !savedCaseId &&
      !documentId
    ) {
      setMessage(
        'Salve o caso ou envie um documento antes de solicitar uma analise aprofundada.'
      )

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

    if (
      (count ?? 0) >= 3
    ) {
      setMessage(
        'O limite inicial de 3 solicitacoes de analise neste mes foi atingido.'
      )

      setWorking(false)
      return
    }

    const { error } =
      await supabase
        .from(
          'adv_analysis_requests'
        )
        .insert({
          user_id:
            user.id,

          case_id:
            savedCaseId,

          document_id:
            documentId,

          title:
            `Analise aprofundada${bankName ? ` - ${bankName}` : ''}`,

          description:
            'Solicitacao de revisao aprofundada dos dados e documentos do caso.',
        })

    if (error) {
      setMessage(
        error.message
      )
    } else {
      setMessage(
        'Solicitacao enviada para analise.'
      )
    }

    setWorking(false)
  }

  function reset() {
    setClientReference('')
    setBankName('')
    setOperationDate('')
    setOriginalDebt(0)

    setRows([
      createRow(),
    ])

    setSelectedFile(null)
    setDocumentId(null)
    setSavedCaseId(null)
    setMessage('')
  }

  return (
    <div className="page calculator-page">
      <div className="page-heading">
        <span className="eyebrow">
          BANCARIO / CARTAO DE CREDITO
        </span>

        <h1>
          Analise de Rotativo
        </h1>

        <p>
          Organize a evolucao da
          divida, informe os encargos
          cobrados e compare os
          valores com a regra
          aplicavel.
        </p>
      </div>

      {message && (
        <div className="system-message">
          {message}
        </div>
      )}

      <section className="case-fields">
        <label>
          Cliente / referencia

          <input
            value={
              clientReference
            }
            onChange={(event) =>
              setClientReference(
                event.target.value
              )
            }
            placeholder="Ex.: Cliente 001"
          />
        </label>

        <label>
          Banco / instituicao

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
          Inicio da operacao

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
          Valor original da divida

          <input
            type="number"
            min="0"
            step="0.01"
            value={
              originalDebt || ''
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
      </section>

      <section className="panel upload-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              IMPORTACAO
            </span>

            <h2>
              Documento ou planilha
            </h2>

            <p>
              PDF, XLSX, XLS ou CSV.
              Planilhas podem preencher
              automaticamente os
              periodos quando utilizam
              as colunas indicadas.
            </p>
          </div>

          <FileSpreadsheet
            size={26}
          />
        </div>

        <div className="upload-row">
          <label className="file-picker">
            <FileUp size={19} />

            <span>
              {selectedFile
                ? selectedFile.name
                : 'Selecionar arquivo'}
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
            Enviar documento
          </button>
        </div>

        <div className="spreadsheet-hint">
          Colunas reconhecidas:
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
            juros_rotativo
          </code>
          <code>
            juros_parcelamento
          </code>
          <code>
            juros_mora
          </code>
          <code>multa</code>
          <code>
            outros_encargos
          </code>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              FATURAS / PERIODOS
            </span>

            <h2>
              Lancamentos mensais
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
            Adicionar mes
          </button>
        </div>

        <div className="finance-table-wrap">
          <div className="finance-table">
            <div className="finance-head">
              <span>Mes</span>
              <span>
                Saldo financiado
              </span>
              <span>
                Taxa % a.m.
              </span>
              <span>
                Juros rotativo
              </span>
              <span>
                Parcelamento
              </span>
              <span>
                Juros mora
              </span>
              <span>Multa</span>
              <span>
                Outros
              </span>
              <span>Total</span>
              <span />
            </div>

            {rows.map(
              (row) => (
                <div
                  className="finance-row"
                  key={row.id}
                >
                  <input
                    type="month"
                    value={
                      row.competence
                    }
                    onChange={(
                      event
                    ) =>
                      updateRow(
                        row.id,
                        'competence',
                        event.target
                          .value
                      )
                    }
                  />

                  <input
                    type="number"
                    step="0.01"
                    value={
                      row.financedBalance ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateRow(
                        row.id,
                        'financedBalance',
                        event.target
                          .value
                      )
                    }
                  />

                  <input
                    type="number"
                    step="0.0001"
                    value={
                      row.statedMonthlyRate ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateRow(
                        row.id,
                        'statedMonthlyRate',
                        event.target
                          .value
                      )
                    }
                  />

                  <input
                    type="number"
                    step="0.01"
                    value={
                      row.revolvingInterest ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateRow(
                        row.id,
                        'revolvingInterest',
                        event.target
                          .value
                      )
                    }
                  />

                  <input
                    type="number"
                    step="0.01"
                    value={
                      row.installmentInterest ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateRow(
                        row.id,
                        'installmentInterest',
                        event.target
                          .value
                      )
                    }
                  />

                  <input
                    type="number"
                    step="0.01"
                    value={
                      row.lateInterest ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateRow(
                        row.id,
                        'lateInterest',
                        event.target
                          .value
                      )
                    }
                  />

                  <input
                    type="number"
                    step="0.01"
                    value={
                      row.fine ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateRow(
                        row.id,
                        'fine',
                        event.target
                          .value
                      )
                    }
                  />

                  <input
                    type="number"
                    step="0.01"
                    value={
                      row.otherCharges ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateRow(
                        row.id,
                        'otherCharges',
                        event.target
                          .value
                      )
                    }
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
                    <Trash2
                      size={15}
                    />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="result-grid">
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
            JUROS + ENCARGOS
          </span>

          <strong>
            {money.format(
              result.charges
            )}
          </strong>

          <small>
            {result.percentage.toFixed(
              2
            )}
            % do principal
          </small>
        </article>

        <article>
          <span>
            DIVIDA + ENCARGOS
          </span>

          <strong>
            {money.format(
              result.totalDebt
            )}
          </strong>
        </article>

        <article
          className={
            result.applicable &&
            result.excess > 0
              ? 'result-danger'
              : 'result-highlight'
          }
        >
          <span>
            POSSIVEL EXCEDENTE
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
          <AlertTriangle
            size={22}
          />

          <div>
            <strong>
              Informe a data da
              operacao
            </strong>

            <p>
              A data e necessaria
              para determinar se o
              limite automatico sera
              aplicado.
            </p>
          </div>
        </section>
      )}

      {operationDate &&
        !result.applicable && (
          <section className="analysis-box warning">
            <AlertTriangle
              size={22}
            />

            <div>
              <strong>
                Analise juridica
                especifica
              </strong>

              <p>
                Esta operacao e
                anterior a
                03/01/2024. A LEVEL
                nao aplica
                automaticamente o
                teto de 100% neste
                caso.
              </p>
            </div>
          </section>
        )}

      {result.applicable &&
        result.excess === 0 && (
          <section className="analysis-box success">
            <CheckCircle2
              size={22}
            />

            <div>
              <strong>
                Nenhum excedente
                identificado nesta
                regra
              </strong>

              <p>
                Os encargos
                informados permanecem
                abaixo do teto
                calculado. Isso nao
                substitui a analise
                das demais clausulas
                e cobrancas.
              </p>
            </div>
          </section>
        )}

      {result.applicable &&
        result.excess > 0 && (
          <section className="analysis-box danger">
            <AlertTriangle
              size={22}
            />

            <div>
              <strong>
                Possivel excedente
                identificado
              </strong>

              <p>
                O total informado
                supera o limite
                analisado em{' '}
                {money.format(
                  result.excess
                )}.
              </p>
            </div>
          </section>
        )}

      <section className="legal-box">
        <Scale size={22} />

        <div>
          <strong>
            Criterio desta
            calculadora
          </strong>

          <p>
            Para operacoes de cartao
            abrangidas a partir de
            03/01/2024, esta versao
            compara os juros e
            encargos financeiros
            informados com o valor
            original da divida. A
            ferramenta fornece apoio
            tecnico e nao substitui a
            analise juridica,
            contratual ou documental.
          </p>
        </div>
      </section>

      <div className="calculator-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={reset}
        >
          Nova analise
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            window.print()
          }
        >
          <Printer size={16} />
          Imprimir / PDF
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
          Salvar caso
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
          Solicitar analise
        </button>
      </div>
    </div>
  )
}
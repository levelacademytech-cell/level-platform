import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  FileText,
  Italic,
  List,
  ListOrdered,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Underline,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import html2canvas
from 'html2canvas'

import {
  jsPDF,
} from 'jspdf'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'

import {
  documentTemplates,
  getTemplate,
  getTemplateHtml,
} from '../data/documentTemplates'

import type {
  DocumentTemplate,
} from '../data/documentTemplates'

type SavedDocument = {
  id: string
  owner_id: string
  template_id: string
  title: string
  client_name: string | null
  case_id: string | null
  content_html: string
  status: 'draft' | 'final'
  created_at: string
  updated_at: string
}

type CaseOption = {
  id: string
  client_name: string
  client_reference: string | null
}

const categories = [
  'Todos',
  'Previdenciário',
  'Bancário',
  'Cível',
  'Processual',
  'Família',
  'Tributário',
  'Gestão',
  'Geral',
]

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleString(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}

function safeFileName(
  value: string
) {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[^a-zA-Z0-9_-]+/g,
      '-'
    )
    .replace(
      /-+/g,
      '-'
    )
}

export function DocumentGeneratorPage() {
  const {
    templateId,
    documentId,
  } =
    useParams()

  const {
    user,
  } =
    useAuth()

  const navigate =
    useNavigate()

  const editorRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const [
    savedDocuments,
    setSavedDocuments,
  ] =
    useState<SavedDocument[]>([])

  const [
    cases,
    setCases,
  ] =
    useState<CaseOption[]>([])

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<
      'templates' |
      'saved'
    >('templates')

  const [
    search,
    setSearch,
  ] =
    useState('')

  const [
    category,
    setCategory,
  ] =
    useState('Todos')

  const [
    currentTemplate,
    setCurrentTemplate,
  ] =
    useState<DocumentTemplate | null>(
      null
    )

  const [
    currentDocumentId,
    setCurrentDocumentId,
  ] =
    useState<string | null>(
      null
    )

  const [
    title,
    setTitle,
  ] =
    useState('')

  const [
    clientName,
    setClientName,
  ] =
    useState('')

  const [
    caseId,
    setCaseId,
  ] =
    useState('')

  const [
    status,
    setStatus,
  ] =
    useState<
      'draft' |
      'final'
    >('draft')

  const [
    editorHtml,
    setEditorHtml,
  ] =
    useState('')

  const [
    fieldValues,
    setFieldValues,
  ] =
    useState<
      Record<string,string>
    >({})

  const [
    message,
    setMessage,
  ] =
    useState('')

  const [
    busy,
    setBusy,
  ] =
    useState(false)

  async function loadSavedDocuments() {
    if (!user) {
      return
    }

    const {
      data,
      error,
    } =
      await supabase
        .from(
          'adv_generated_documents'
        )
        .select('*')
        .order(
          'updated_at',
          {
            ascending: false,
          }
        )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setSavedDocuments((data ?? []) as SavedDocument[])
  }

  async function loadCases() {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          'adv_cases'
        )
        .select(
          'id,client_name,client_reference'
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        )

    if (error) {
      return
    }

    setCases((data ?? []) as CaseOption[])
  }

  useEffect(() => {
    void loadSavedDocuments()
    void loadCases()
  }, [user?.id])

  useEffect(() => {
    if (documentId) {
      void supabase
        .from(
          'adv_generated_documents'
        )
        .select('*')
        .eq(
          'id',
          documentId
        )
        .single()
        .then(({
          data,
          error,
        }) => {
          if (error) {
            setMessage(
              error.message
            )

            return
          }

          const item =
            data as SavedDocument

          const template =
            getTemplate(
              item.template_id
            ) ?? null

          setCurrentTemplate(
            template
          )

          setCurrentDocumentId(
            item.id
          )

          setTitle(
            item.title
          )

          setClientName(
            item.client_name ??
            ''
          )

          setCaseId(
            item.case_id ??
            ''
          )

          setStatus(
            item.status
          )

          setEditorHtml(
            item.content_html
          )
        })

      return
    }

    if (templateId) {
      const template =
        getTemplate(
          templateId
        )

      if (!template) {
        setMessage(
          'Modelo não encontrado.'
        )

        return
      }

      setCurrentTemplate(
        template
      )

      setCurrentDocumentId(
        null
      )

      setTitle(
        template.title
      )

      setClientName('')
      setCaseId('')
      setStatus('draft')
      setFieldValues({})

      setEditorHtml(
        getTemplateHtml(
          template
        )
      )

      return
    }

    setCurrentTemplate(null)
    setCurrentDocumentId(null)
  }, [
    templateId,
    documentId,
  ])

  const filteredTemplates =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase()

        return documentTemplates
          .filter(
            (item) =>
              category ===
                'Todos' ||
              item.category ===
                category
          )
          .filter(
            (item) =>
              !query ||
              item.title
                .toLowerCase()
                .includes(
                  query
                ) ||
              item.description
                .toLowerCase()
                .includes(
                  query
                )
          )
      },
      [
        search,
        category,
      ]
    )

  function applyFieldValue(
    key: string,
    value: string,
    placeholder: string
  ) {
    setFieldValues(
      (current) => ({
        ...current,
        [key]:
          value,
      })
    )

    const editor =
      editorRef.current

    if (!editor) {
      return
    }

    editor
      .querySelectorAll(
        `[data-field="${key}"]`
      )
      .forEach(
        (element) => {
          element.textContent =
            value ||
            placeholder
        }
      )

    setEditorHtml(
      editor.innerHTML
    )
  }

  function command(
    name: string
  ) {
    editorRef
      .current
      ?.focus()

    document.execCommand(
      name
    )
  }

  function resetDocument() {
    if (!currentTemplate) {
      return
    }

    const confirmed =
      window.confirm(
        'Restaurar o conteúdo original deste modelo?'
      )

    if (!confirmed) {
      return
    }

    setFieldValues({})

    setEditorHtml(
      getTemplateHtml(
        currentTemplate
      )
    )
  }

  async function saveDocument(
    nextStatus:
      'draft' |
      'final' =
        status
  ) {
    if (
      !user ||
      !currentTemplate
    ) {
      return
    }

    const html =
      editorRef
        .current
        ?.innerHTML ??
      editorHtml

    if (!title.trim()) {
      setMessage(
        'Informe o título do documento.'
      )

      return
    }

    setBusy(true)
    setMessage('')

    if (currentDocumentId) {
      const {
        error,
      } =
        await supabase
          .from(
            'adv_generated_documents'
          )
          .update({
            title:
              title.trim(),
            client_name:
              clientName.trim() ||
              null,
            case_id:
              caseId ||
              null,
            content_html:
              html,
            status:
              nextStatus,
          })
          .eq(
            'id',
            currentDocumentId
          )

      setBusy(false)

      if (error) {
        setMessage(
          error.message
        )

        return
      }

      setStatus(
        nextStatus
      )

      setMessage(
        'Documento atualizado.'
      )

      await loadSavedDocuments()

      return
    }

    const {
      data,
      error,
    } =
      await supabase
        .from(
          'adv_generated_documents'
        )
        .insert({
          owner_id:
            user.id,
          template_id:
            currentTemplate.id,
          title:
            title.trim(),
          client_name:
            clientName.trim() ||
            null,
          case_id:
            caseId ||
            null,
          content_html:
            html,
          status:
            nextStatus,
        })
        .select('id')
        .single()

    setBusy(false)

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setCurrentDocumentId(
      data.id
    )

    setStatus(
      nextStatus
    )

    await loadSavedDocuments()

    navigate(
      `/app/gerador-documentos/documento/${data.id}`,
      {
        replace: true,
      }
    )

    setMessage(
      'Documento salvo.'
    )
  }

  async function duplicateDocument() {
    if (
      !user ||
      !currentTemplate
    ) {
      return
    }

    const html =
      editorRef
        .current
        ?.innerHTML ??
      editorHtml

    const {
      data,
      error,
    } =
      await supabase
        .from(
          'adv_generated_documents'
        )
        .insert({
          owner_id:
            user.id,
          template_id:
            currentTemplate.id,
          title:
            `Cópia - ${title}`,
          client_name:
            clientName.trim() ||
            null,
          case_id:
            caseId ||
            null,
          content_html:
            html,
          status:
            'draft',
        })
        .select('id')
        .single()

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    await loadSavedDocuments()

    navigate(
      `/app/gerador-documentos/documento/${data.id}`
    )
  }

  async function deleteDocument(
    id:
      string =
        currentDocumentId ??
        ''
  ) {
    if (!id) {
      return
    }

    const confirmed =
      window.confirm(
        'Excluir definitivamente este documento salvo?'
      )

    if (!confirmed) {
      return
    }

    const {
      error,
    } =
      await supabase
        .from(
          'adv_generated_documents'
        )
        .delete()
        .eq(
          'id',
          id
        )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    await loadSavedDocuments()

    navigate(
      '/app/gerador-documentos'
    )
  }

  async function generatePdf() {
    const editor =
      editorRef.current

    if (!editor) {
      return
    }

    setBusy(true)
    setMessage(
      'Gerando PDF...'
    )

    try {
      const canvas =
        await html2canvas(
          editor,
          {
            scale: 2,
            backgroundColor:
              '#ffffff',
            useCORS: true,
          }
        )

      const image =
        canvas.toDataURL(
          'image/png'
        )

      const pdf =
        new jsPDF(
          'p',
          'mm',
          'a4'
        )

      const pageWidth = 210
      const pageHeight = 297
      const margin = 12
      const usableWidth =
        pageWidth -
        margin * 2

      const usableHeight =
        pageHeight -
        margin * 2

      const imageHeight =
        canvas.height *
        usableWidth /
        canvas.width

      let remaining =
        imageHeight

      let position =
        margin

      pdf.addImage(
        image,
        'PNG',
        margin,
        position,
        usableWidth,
        imageHeight
      )

      remaining -=
        usableHeight

      while (
        remaining > 0
      ) {
        pdf.addPage()

        position =
          margin -
          (
            imageHeight -
            remaining
          )

        pdf.addImage(
          image,
          'PNG',
          margin,
          position,
          usableWidth,
          imageHeight
        )

        remaining -=
          usableHeight
      }

      pdf.save(
        `${safeFileName(
          title ||
          'documento-level'
        )}.pdf`
      )

      setMessage(
        'PDF gerado com sucesso.'
      )
    } catch (
      error
    ) {
      setMessage(
        error
          instanceof Error
          ? error.message
          : 'Não foi possível gerar o PDF.'
      )
    }

    setBusy(false)
  }

  if (currentTemplate) {
    return (
      <div className="page docgen-page">
        <button
          type="button"
          className="calculator-back"
          onClick={() =>
            navigate(
              '/app/gerador-documentos'
            )
          }
        >
          <ArrowLeft size={15} />
          Voltar aos modelos
        </button>

        <div className="docgen-editor-heading">
          <div>
            <span className="eyebrow">
              GERADOR DE DOCUMENTOS
            </span>

            <h1>
              {currentTemplate.title}
            </h1>

            <p>
              Edite livremente o
              conteúdo, salve no sistema
              e gere o PDF quando quiser.
            </p>
          </div>

          <div className="docgen-main-actions">
            {currentDocumentId && (
              <>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    void duplicateDocument()
                  }
                >
                  <Copy size={15} />
                  Duplicar
                </button>

                <button
                  type="button"
                  className="secondary-button danger"
                  onClick={() =>
                    void deleteDocument()
                  }
                >
                  <Trash2 size={15} />
                  Excluir
                </button>
              </>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                void saveDocument(
                  'draft'
                )
              }
              disabled={busy}
            >
              <Save size={15} />
              Salvar
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                void generatePdf()
              }
              disabled={busy}
            >
              <Download size={15} />
              Gerar PDF
            </button>
          </div>
        </div>

        {message && (
          <div className="system-message">
            {message}
          </div>
        )}

        <section className="docgen-workspace">
          <aside className="docgen-fields">
            <div className="docgen-fields-title">
              <span className="eyebrow">
                DADOS RÁPIDOS
              </span>

              <strong>
                Preenchimento
              </strong>
            </div>

            <label>
              Título do arquivo

              <input
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Cliente

              <input
                value={clientName}
                onChange={(event) =>
                  setClientName(
                    event.target.value
                  )
                }
                placeholder="Nome para organizar"
              />
            </label>

            <label>
              Vincular a caso

              <select
                value={caseId}
                onChange={(event) =>
                  setCaseId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Não vincular
                </option>

                {cases.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.client_name}
                      {item.client_reference
                        ? ` - ${item.client_reference}`
                        : ''}
                    </option>
                  )
                )}
              </select>
            </label>

            {currentTemplate
              .fields
              .map(
                (field) => (
                  <label
                    key={field.key}
                  >
                    {field.label}

                    <input
                      value={
                        fieldValues[
                          field.key
                        ] ?? ''
                      }
                      onChange={(event) =>
                        applyFieldValue(
                          field.key,
                          event
                            .target
                            .value,
                          field
                            .placeholder
                        )
                      }
                      placeholder={
                        field
                          .placeholder
                      }
                    />
                  </label>
                )
              )}

            <button
              type="button"
              className="secondary-button full-button"
              onClick={
                resetDocument
              }
            >
              <RotateCcw size={15} />
              Restaurar modelo
            </button>
          </aside>

          <section className="docgen-document-area">
            <div className="docgen-toolbar">
              <button
                type="button"
                onClick={() =>
                  command('bold')
                }
                title="Negrito"
              >
                <Bold size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  command('italic')
                }
                title="Itálico"
              >
                <Italic size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  command(
                    'underline'
                  )
                }
                title="Sublinhado"
              >
                <Underline size={16} />
              </button>

              <span />

              <button
                type="button"
                onClick={() =>
                  command(
                    'justifyLeft'
                  )
                }
              >
                <AlignLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  command(
                    'justifyCenter'
                  )
                }
              >
                <AlignCenter size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  command(
                    'justifyRight'
                  )
                }
              >
                <AlignRight size={16} />
              </button>

              <span />

              <button
                type="button"
                onClick={() =>
                  command(
                    'insertUnorderedList'
                  )
                }
              >
                <List size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  command(
                    'insertOrderedList'
                  )
                }
              >
                <ListOrdered size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  command('undo')
                }
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="docgen-paper-shell">
              <div
                ref={editorRef}
                className="docgen-paper"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{
                  __html:
                    editorHtml,
                }}
                onInput={(event) =>
                  setEditorHtml(
                    event
                      .currentTarget
                      .innerHTML
                  )
                }
              />
            </div>

            <div className="docgen-bottom-actions">
              <div>
                <span>
                  Status
                </span>

                <strong
                  className={
                    status ===
                    'final'
                      ? 'final'
                      : ''
                  }
                >
                  {status ===
                  'final'
                    ? 'Finalizado'
                    : 'Rascunho'}
                </strong>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  void saveDocument(
                    'final'
                  )
                }
              >
                <CheckCircle2
                  size={15}
                />
                Salvar como final
              </button>
            </div>
          </section>
        </section>
      </div>
    )
  }

  return (
    <div className="page docgen-page">
      <div className="page-heading docgen-heading">
        <div>
          <span className="eyebrow">
            PRODUTIVIDADE
          </span>

          <h1>
            Gerador de documentos
          </h1>

          <p>
            Modelos jurídicos editáveis,
            organizados e prontos para
            salvar, revisar e gerar em PDF.
          </p>
        </div>

        <div className="docgen-counter">
          <FileText size={18} />

          <div>
            <strong>
              {documentTemplates.length}
            </strong>

            <span>
              modelos disponíveis
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className="system-message">
          {message}
        </div>
      )}

      <section className="docgen-tabs">
        <button
          type="button"
          className={
            activeTab ===
            'templates'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'templates'
            )
          }
        >
          Modelos
        </button>

        <button
          type="button"
          className={
            activeTab ===
            'saved'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'saved'
            )
          }
        >
          Meus documentos
          <span>
            {
              savedDocuments.length
            }
          </span>
        </button>
      </section>

      {activeTab ===
      'templates' ? (
        <>
          <section className="docgen-filters">
            <div>
              <Search size={16} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Buscar procuração, entrevista, contrato..."
              />
            </div>

            <div className="docgen-category-pills">
              {categories.map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      category ===
                      item
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setCategory(
                        item
                      )
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </section>

          <section className="docgen-grid">
            {filteredTemplates.map(
              (template) => (
                <article
                  key={
                    template.id
                  }
                  className="docgen-card"
                >
                  <div className="docgen-card-icon">
                    <FileText size={18} />
                  </div>

                  <span>
                    {template.category}
                  </span>

                  <h2>
                    {template.title}
                  </h2>

                  <p>
                    {
                      template.description
                    }
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/app/gerador-documentos/modelo/${template.id}`
                      )
                    }
                  >
                    {
                      template.action
                    }
                  </button>
                </article>
              )
            )}
          </section>
        </>
      ) : (
        <section className="docgen-saved-list">
          {savedDocuments.length ===
            0 && (
            <div className="docgen-empty">
              <FileText size={30} />

              <strong>
                Nenhum documento salvo
              </strong>

              <span>
                Escolha um modelo e salve
                seu primeiro documento.
              </span>
            </div>
          )}

          {savedDocuments.map(
            (item) => (
              <article
                key={item.id}
                className="docgen-saved-card"
              >
                <div className="docgen-card-icon">
                  <FileText size={18} />
                </div>

                <div>
                  <span>
                    {getTemplate(
                      item.template_id
                    )?.title ??
                    'Documento'}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.client_name ||
                      'Sem cliente informado'}
                    {' • '}
                    Atualizado em
                    {' '}
                    {formatDate(
                      item.updated_at
                    )}
                  </p>
                </div>

                <strong
                  className={
                    item.status ===
                    'final'
                      ? 'final'
                      : ''
                  }
                >
                  {item.status ===
                  'final'
                    ? 'Final'
                    : 'Rascunho'}
                </strong>

                <div className="docgen-saved-actions">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/app/gerador-documentos/documento/${item.id}`
                      )
                    }
                  >
                    <Edit3 size={15} />
                    Editar
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      void deleteDocument(
                        item.id
                      )
                    }
                  >
                    <Trash2 size={15} />
                    Excluir
                  </button>
                </div>
              </article>
            )
          )}
        </section>
      )}
    </div>
  )
}
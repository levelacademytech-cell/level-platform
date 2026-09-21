import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  FileText,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  UserPlus,
  Users,
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
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'


type CaseRow = {
  id: string
  user_id: string
  client_name: string | null
  client_reference: string | null
  process_number: string | null
  bank_name: string | null
  original_debt: number
  status: string
  progress_percent: number
  finalized_at: string | null
  finalized_by: string | null
  created_at: string
  updated_at: string
}


type MemberRow = {
  user_id: string
  display_name: string
  username: string | null
  permission: string
  status: string
  is_owner: boolean
}


type ContributionRow = {
  id: string
  kind: string
  title: string
  body: string | null
  metadata: Record<string, unknown>
  created_at: string
  actor_user_id: string
  actor_name: string
  actor_username: string | null
}


type MessageRow = {
  id: string
  body: string
  created_at: string
  actor_user_id: string
  actor_name: string
}


const money =
  new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )


function contributionLabel(
  kind: string
) {
  if (kind === 'calculation') {
    return 'CÁLCULO'
  }

  if (kind === 'analysis') {
    return 'ANÁLISE'
  }

  if (kind === 'task') {
    return 'TAREFA'
  }

  if (kind === 'document') {
    return 'DOCUMENTO'
  }

  if (kind === 'system') {
    return 'SISTEMA'
  }

  return 'CONTRIBUIÇÃO'
}


export function CaseWorkspacePage() {
  const {
    caseId,
  } = useParams()

  const {
    user,
    isAdmin,
  } = useAuth()


  const [
    caseData,
    setCaseData,
  ] =
    useState<CaseRow | null>(
      null
    )


  const [
    members,
    setMembers,
  ] =
    useState<MemberRow[]>([])


  const [
    contributions,
    setContributions,
  ] =
    useState<
      ContributionRow[]
    >([])


  const [
    messages,
    setMessages,
  ] =
    useState<MessageRow[]>([])


  const [
    documentsCount,
    setDocumentsCount,
  ] =
    useState(0)


  const [
    periodsCount,
    setPeriodsCount,
  ] =
    useState(0)


  const [
    analysisCount,
    setAnalysisCount,
  ] =
    useState(0)


  const [
    message,
    setMessage,
  ] =
    useState('')


  const [
    loading,
    setLoading,
  ] =
    useState(true)


  const [
    inviteIdentifier,
    setInviteIdentifier,
  ] =
    useState('')


  const [
    invitePermission,
    setInvitePermission,
  ] =
    useState('contribute')


  const [
    inviteScope,
    setInviteScope,
  ] =
    useState('case')


  const [
    contributionKind,
    setContributionKind,
  ] =
    useState('note')


  const [
    contributionTitle,
    setContributionTitle,
  ] =
    useState('')


  const [
    contributionBody,
    setContributionBody,
  ] =
    useState('')


  const [
    chatText,
    setChatText,
  ] =
    useState('')


  const [
    username,
    setUsername,
  ] =
    useState('')


  const [
    progress,
    setProgress,
  ] =
    useState(0)


  const owner =
    useMemo(
      () =>
        Boolean(
          user &&
          caseData &&
          caseData.user_id ===
            user.id
        ),
      [
        user,
        caseData,
      ]
    )


  async function loadMessages() {
    if (!caseId) return

    const {
      data,
      error,
    } =
      await supabase.rpc(
        'adv_get_case_messages',
        {
          p_case_id:
            caseId,
        }
      )

    if (!error) {
      setMessages(
        data ?? []
      )
    }
  }


  async function loadWorkspace() {
    if (!caseId) return

    setLoading(true)

    const [
      caseResult,
      membersResult,
      contributionsResult,
      documentsResult,
      periodsResult,
      analysisResult,
      profileResult,
    ] =
      await Promise.all([
        supabase
          .from('adv_cases')
          .select(`
            id,
            user_id,
            client_name,
            client_reference,
            process_number,
            bank_name,
            original_debt,
            status,
            progress_percent,
            finalized_at,
            finalized_by,
            created_at,
            updated_at
          `)
          .eq(
            'id',
            caseId
          )
          .single(),

        supabase.rpc(
          'adv_get_case_members',
          {
            p_case_id:
              caseId,
          }
        ),

        supabase.rpc(
          'adv_get_case_contributions',
          {
            p_case_id:
              caseId,
          }
        ),

        supabase
          .from(
            'adv_documents'
          )
          .select(
            'id',
            {
              count: 'exact',
              head: true,
            }
          )
          .eq(
            'case_id',
            caseId
          ),

        supabase
          .from(
            'adv_case_periods'
          )
          .select(
            'id',
            {
              count: 'exact',
              head: true,
            }
          )
          .eq(
            'case_id',
            caseId
          ),

        supabase
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
          .eq(
            'case_id',
            caseId
          ),

        user
          ? supabase
              .from(
                'adv_profiles'
              )
              .select(
                'username'
              )
              .eq(
                'user_id',
                user.id
              )
              .maybeSingle()
          : Promise.resolve({
              data: null,
              error: null,
            }),
      ])


    if (caseResult.error) {
      setMessage(
        caseResult.error.message
      )

      setLoading(false)

      return
    }


    setCaseData(
      caseResult.data
    )

    setProgress(
      caseResult.data
        .progress_percent ??
      0
    )

    setMembers(
      membersResult.data ?? []
    )

    setContributions(
      contributionsResult.data ?? []
    )

    setDocumentsCount(
      documentsResult.count ?? 0
    )

    setPeriodsCount(
      periodsResult.count ?? 0
    )

    setAnalysisCount(
      analysisResult.count ?? 0
    )

    setUsername(
      profileResult.data
        ?.username ??
      ''
    )

    await loadMessages()

    setLoading(false)
  }


  useEffect(() => {
    void loadWorkspace()
  }, [
    caseId,
    user?.id,
  ])


  useEffect(() => {
    if (!caseId) return

    const timer =
      window.setInterval(
        () => {
          void loadMessages()
        },
        5000
      )

    return () =>
      window.clearInterval(
        timer
      )
  }, [caseId])


  async function saveUsername() {
    if (
      !user ||
      !username.trim()
    ) {
      return
    }

    const normalized =
      username
        .trim()
        .toLowerCase()
        .replace(
          /[^a-z0-9._-]/g,
          ''
        )

    if (
      normalized.length < 3
    ) {
      setMessage(
        'O nome de usuário precisa ter pelo menos 3 caracteres.'
      )

      return
    }

    const {
      error,
    } =
      await supabase
        .from(
          'adv_profiles'
        )
        .upsert({
          user_id:
            user.id,

          username:
            normalized,
        })

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setUsername(
      normalized
    )

    setMessage(
      `Seu usuário LEVEL é @${normalized}.`
    )
  }


  async function invite() {
    if (
      !caseId ||
      !inviteIdentifier.trim()
    ) {
      return
    }

    const {
      data,
      error,
    } =
      await supabase.rpc(
        'adv_invite_case_member',
        {
          p_case_id:
            caseId,

          p_identifier:
            inviteIdentifier.trim(),

          p_permission:
            invitePermission,

          p_scope:
            inviteScope,
        }
      )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    const result =
      data as {
        name?: string
      } | null

    setMessage(
      `Convite enviado${
        result?.name
          ? ` para ${result.name}`
          : ''
      }.`
    )

    setInviteIdentifier('')

    await loadWorkspace()
  }


  async function addContribution() {
    if (
      !caseId ||
      !user ||
      !contributionTitle.trim()
    ) {
      return
    }

    const {
      error,
    } =
      await supabase
        .from(
          'adv_case_contributions'
        )
        .insert({
          case_id:
            caseId,

          user_id:
            user.id,

          kind:
            contributionKind,

          title:
            contributionTitle.trim(),

          body:
            contributionBody.trim() ||
            null,
        })

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setContributionTitle('')
    setContributionBody('')

    setMessage(
      'Contribuição adicionada ao histórico.'
    )

    await loadWorkspace()
  }


  async function sendChat() {
    if (
      !caseId ||
      !user ||
      !chatText.trim()
    ) {
      return
    }

    const {
      error,
    } =
      await supabase
        .from(
          'adv_case_messages'
        )
        .insert({
          case_id:
            caseId,

          sender_id:
            user.id,

          body:
            chatText.trim(),
        })

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setChatText('')

    await loadMessages()
  }


  async function saveProgress() {
    if (
      !caseId ||
      !owner
    ) {
      return
    }

    const limited =
      Math.max(
        0,
        Math.min(
          99,
          progress
        )
      )

    const {
      error,
    } =
      await supabase
        .from('adv_cases')
        .update({
          progress_percent:
            limited,

          status:
            'in_progress',
        })
        .eq(
          'id',
          caseId
        )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setMessage(
      'Progresso atualizado.'
    )

    await loadWorkspace()
  }


  async function finalizeCase() {
    if (
      !caseId ||
      !user ||
      !owner
    ) {
      return
    }

    const confirmed =
      window.confirm(
        'Finalizar este caso em 100%? Os colaboradores continuarão podendo consultar o histórico.'
      )

    if (!confirmed) {
      return
    }

    const {
      error,
    } =
      await supabase
        .from('adv_cases')
        .update({
          status:
            'finalized',

          progress_percent:
            100,

          finalized_at:
            new Date()
              .toISOString(),

          finalized_by:
            user.id,
        })
        .eq(
          'id',
          caseId
        )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    await supabase
      .from(
        'adv_case_contributions'
      )
      .insert({
        case_id:
          caseId,

        user_id:
          user.id,

        kind:
          'system',

        title:
          'Caso finalizado',

        body:
          'O responsável marcou o caso como finalizado em 100%.',
      })

    setMessage(
      'Caso finalizado.'
    )

    await loadWorkspace()
  }


  async function reopenCase() {
    if (
      !caseId ||
      !user ||
      !owner
    ) {
      return
    }

    const {
      error,
    } =
      await supabase
        .from('adv_cases')
        .update({
          status:
            'in_progress',

          progress_percent:
            90,

          finalized_at:
            null,

          finalized_by:
            null,
        })
        .eq(
          'id',
          caseId
        )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    await supabase
      .from(
        'adv_case_contributions'
      )
      .insert({
        case_id:
          caseId,

        user_id:
          user.id,

        kind:
          'system',

        title:
          'Caso reaberto',

        body:
          'O responsável reabriu o caso para novas análises.',
      })

    setMessage(
      'Caso reaberto.'
    )

    await loadWorkspace()
  }


  if (!caseId) {
    return (
      <Navigate
        to="/app/casos"
        replace
      />
    )
  }


  if (
    loading &&
    !caseData
  ) {
    return (
      <div className="page">
        <div className="empty-state">
          Carregando prontuário...
        </div>
      </div>
    )
  }


  if (!caseData) {
    return (
      <Navigate
        to="/app/casos"
        replace
      />
    )
  }


  const finalized =
    caseData.status ===
    'finalized'


  return (
    <div className="page">

      <Link
        to="/app/casos"
        className="calculator-back"
      >
        <ArrowLeft size={15} />

        Voltar para casos
      </Link>


      {message && (
        <div className="system-message">
          {message}
        </div>
      )}


      <section className="case-workspace-hero">

        <div>

          <span className="eyebrow">
            PRONTUÁRIO JURÍDICO
          </span>

          <h1>
            {caseData.client_name ||
              caseData.client_reference ||
              'Caso LEVEL'}
          </h1>

          <div className="workspace-case-meta">

            {caseData.process_number && (
              <span>
                Processo:
                {' '}
                {caseData.process_number}
              </span>
            )}

            {caseData.bank_name && (
              <span>
                {caseData.bank_name}
              </span>
            )}

            {Number(
              caseData.original_debt
            ) > 0 && (
              <span>
                {money.format(
                  Number(
                    caseData.original_debt
                  )
                )}
              </span>
            )}

          </div>

        </div>


        <div className="workspace-progress-box">

          <span>
            PROGRESSO
          </span>

          <strong>
            {finalized
              ? 100
              : caseData.progress_percent}
            %
          </strong>

          <div className="case-progress-track">
            <div
              style={{
                width:
                  `${
                    finalized
                      ? 100
                      : caseData.progress_percent
                  }%`,
              }}
            />
          </div>

          <small>
            {finalized
              ? 'Caso finalizado'
              : 'Em andamento'}
          </small>

        </div>

      </section>


      <section className="case-summary-grid">

        <article>
          <Calculator size={20} />

          <span>
            LANÇAMENTOS DO ROTATIVO
          </span>

          <strong>
            {periodsCount}
          </strong>
        </article>


        <article>
          <FileText size={20} />

          <span>
            DOCUMENTOS
          </span>

          <strong>
            {documentsCount}
          </strong>
        </article>


        <article>
          <Users size={20} />

          <span>
            PESSOAS NO CASO
          </span>

          <strong>
            {
              members.filter(
                (item) =>
                  item.status ===
                  'accepted'
              ).length
            }
          </strong>
        </article>


        <article>
          <CheckCircle2 size={20} />

          <span>
            ANÁLISES SOLICITADAS
          </span>

          <strong>
            {analysisCount}
          </strong>
        </article>

      </section>


      {periodsCount > 0 && (
        <section className="case-calculation-card">

          <div>
            <span className="eyebrow">
              CÁLCULO VINCULADO
            </span>

            <h2>
              Rotativo do cartão
            </h2>

            <p>
              Este prontuário possui lançamentos
              financeiros da calculadora de
              rotativo.
            </p>
          </div>


          <Link
            to={`/app/calculadoras/bancario/rotativo/${caseId}`}
            className="secondary-button"
          >
            <Calculator
              size={16}
            />

            Abrir cálculo
          </Link>

        </section>
      )}


      <section className="case-workspace-columns">

        <div className="case-workspace-main">


          <section className="panel">

            <div className="panel-heading">

              <div>
                <span className="eyebrow">
                  HISTÓRICO
                </span>

                <h2>
                  Contribuições ao caso
                </h2>

                <p>
                  Notas, cálculos, análises e
                  acontecimentos importantes ficam
                  registrados aqui.
                </p>
              </div>


              <button
                type="button"
                className="icon-button"
                onClick={() =>
                  void loadWorkspace()
                }
              >
                <RefreshCw
                  size={16}
                />
              </button>

            </div>


            {!finalized && (
              <div className="case-contribution-form">

                <select
                  value={
                    contributionKind
                  }
                  onChange={(event) =>
                    setContributionKind(
                      event.target.value
                    )
                  }
                >
                  <option value="note">
                    Nota
                  </option>

                  <option value="analysis">
                    Análise
                  </option>

                  <option value="calculation">
                    Cálculo
                  </option>

                  <option value="task">
                    Tarefa
                  </option>
                </select>


                <input
                  value={
                    contributionTitle
                  }
                  onChange={(event) =>
                    setContributionTitle(
                      event.target.value
                    )
                  }
                  placeholder="Título da contribuição"
                />


                <textarea
                  rows={4}
                  value={
                    contributionBody
                  }
                  onChange={(event) =>
                    setContributionBody(
                      event.target.value
                    )
                  }
                  placeholder="Descreva o que foi analisado, encontrado ou decidido..."
                />


                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    void addContribution()
                  }
                >
                  <Plus size={16} />

                  Registrar no histórico
                </button>

              </div>
            )}


            <div className="case-timeline">

              {contributions.length === 0 && (
                <div className="empty-state case-empty">
                  Ainda não existem contribuições
                  registradas.
                </div>
              )}


              {contributions.map(
                (item) => (
                  <article
                    className="timeline-card"
                    key={item.id}
                  >

                    <div className="timeline-marker" />

                    <div>

                      <span className="timeline-kind">
                        {contributionLabel(
                          item.kind
                        )}
                      </span>

                      <h3>
                        {item.title}
                      </h3>

                      {item.body && (
                        <p>
                          {item.body}
                        </p>
                      )}

                      <footer>
                        <strong>
                          {item.actor_name}
                        </strong>

                        {item.actor_username && (
                          <span>
                            @
                            {
                              item.actor_username
                            }
                          </span>
                        )}

                        <span>
                          {new Date(
                            item.created_at
                          ).toLocaleString(
                            'pt-BR'
                          )}
                        </span>
                      </footer>

                    </div>

                  </article>
                )
              )}

            </div>

          </section>


          <section className="panel case-chat-panel">

            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  COLABORAÇÃO
                </span>

                <h2>
                  Conversa deste caso
                </h2>

                <p>
                  Diferente do chat geral da LEVEL,
                  as mensagens aqui ficam vinculadas
                  ao histórico colaborativo do caso.
                </p>
              </div>

              <MessageCircle
                size={22}
              />
            </div>


            <div className="case-chat-messages">

              {messages.length === 0 && (
                <div className="case-chat-empty">
                  Nenhuma mensagem ainda.
                </div>
              )}


              {messages.map(
                (item) => (
                  <div
                    key={item.id}
                    className={
                      item.actor_user_id ===
                      user?.id
                        ? 'case-message own'
                        : 'case-message'
                    }
                  >

                    <strong>
                      {item.actor_name}
                    </strong>

                    <p>
                      {item.body}
                    </p>

                    <span>
                      {new Date(
                        item.created_at
                      ).toLocaleString(
                        'pt-BR'
                      )}
                    </span>

                  </div>
                )
              )}

            </div>


            {!finalized && (
              <div className="case-chat-input">

                <input
                  value={chatText}
                  onChange={(event) =>
                    setChatText(
                      event.target.value
                    )
                  }
                  placeholder="Escreva uma mensagem para quem está contribuindo..."
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      'Enter'
                    ) {
                      event.preventDefault()

                      void sendChat()
                    }
                  }}
                />

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    void sendChat()
                  }
                >
                  <Send size={15} />
                </button>

              </div>
            )}

          </section>

        </div>


        <aside className="case-workspace-side">


          <section className="panel">

            <span className="eyebrow">
              SEU IDENTIFICADOR
            </span>

            <h3>
              Usuário LEVEL
            </h3>

            <p className="muted">
              Colegas podem usar seu e-mail de
              login ou seu @usuário para enviar
              convites.
            </p>


            <div className="username-field">

              <span>@</span>

              <input
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                placeholder="seu.usuario"
              />

            </div>


            <button
              type="button"
              className="secondary-button full-button"
              onClick={() =>
                void saveUsername()
              }
            >
              Salvar usuário
            </button>

          </section>


          <section className="panel">

            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  EQUIPE DO CASO
                </span>

                <h3>
                  Participantes
                </h3>
              </div>

              <Users size={18} />
            </div>


            <div className="case-members-list">

              {members.map(
                (member) => (
                  <article
                    key={
                      member.user_id
                    }
                  >

                    <div className="member-avatar">
                      {member.display_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {
                          member.display_name
                        }
                      </strong>

                      <span>
                        {member.is_owner
                          ? 'Responsável pelo caso'
                          : member.status ===
                            'pending'
                            ? 'Convite pendente'
                            : member.permission ===
                              'view'
                              ? 'Visualização'
                              : 'Colaborador'}
                      </span>

                      {member.username && (
                        <small>
                          @
                          {
                            member.username
                          }
                        </small>
                      )}
                    </div>

                  </article>
                )
              )}

            </div>

          </section>


          {(owner || isAdmin) && (
            <section className="panel">

              <div className="panel-heading">
                <div>
                  <span className="eyebrow">
                    CONVIDAR
                  </span>

                  <h3>
                    Adicionar colega
                  </h3>
                </div>

                <UserPlus
                  size={18}
                />
              </div>


              <label>
                E-mail ou @usuário

                <input
                  value={
                    inviteIdentifier
                  }
                  onChange={(event) =>
                    setInviteIdentifier(
                      event.target.value
                    )
                  }
                  placeholder="colega@email.com ou @usuario"
                />
              </label>


              <label>
                Permissão

                <select
                  value={
                    invitePermission
                  }
                  onChange={(event) =>
                    setInvitePermission(
                      event.target.value
                    )
                  }
                >
                  <option value="contribute">
                    Pode contribuir
                  </option>

                  <option value="view">
                    Somente visualizar
                  </option>
                </select>
              </label>


              <label>
                Acesso

                <select
                  value={
                    inviteScope
                  }
                  onChange={(event) =>
                    setInviteScope(
                      event.target.value
                    )
                  }
                >
                  <option value="case">
                    Somente este caso
                  </option>

                  <option value="all">
                    Todos os meus casos
                  </option>
                </select>
              </label>


              <button
                type="button"
                className="primary-button full-button"
                onClick={() =>
                  void invite()
                }
              >
                <UserPlus
                  size={15}
                />

                Enviar convite
              </button>

            </section>
          )}


          {owner && (
            <section className="panel">

              <span className="eyebrow">
                ANDAMENTO
              </span>

              <h3>
                Progresso do caso
              </h3>


              {!finalized ? (
                <>
                  <div className="progress-editor">

                    <input
                      type="range"
                      min="0"
                      max="99"
                      value={progress}
                      onChange={(event) =>
                        setProgress(
                          Number(
                            event.target.value
                          )
                        )
                      }
                    />

                    <strong>
                      {progress}%
                    </strong>

                  </div>


                  <button
                    type="button"
                    className="secondary-button full-button"
                    onClick={() =>
                      void saveProgress()
                    }
                  >
                    Salvar progresso
                  </button>


                  <button
                    type="button"
                    className="finalize-case-button"
                    onClick={() =>
                      void finalizeCase()
                    }
                  >
                    <CheckCircle2
                      size={16}
                    />

                    Finalizar caso em 100%
                  </button>
                </>
              ) : (
                <>
                  <div className="case-finalized-box">
                    <CheckCircle2
                      size={23}
                    />

                    <strong>
                      Finalizado 100%
                    </strong>

                    {caseData.finalized_at && (
                      <span>
                        {new Date(
                          caseData.finalized_at
                        ).toLocaleString(
                          'pt-BR'
                        )}
                      </span>
                    )}
                  </div>


                  <button
                    type="button"
                    className="secondary-button full-button"
                    onClick={() =>
                      void reopenCase()
                    }
                  >
                    Reabrir caso
                  </button>
                </>
              )}

            </section>
          )}

        </aside>

      </section>

    </div>
  )
}
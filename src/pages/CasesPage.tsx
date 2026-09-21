import {
  BriefcaseBusiness,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  UserRoundCheck,
  X,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
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
  created_at: string
  updated_at: string
  finalized_at: string | null
}


type InvitationRow = {
  scope: string
  invitation_id: string
  case_id: string | null
  case_title: string
  inviter_name: string
  permission: string
  created_at: string
}


const money =
  new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )


function statusLabel(
  status: string
) {
  if (status === 'finalized') {
    return 'Finalizado'
  }

  if (status === 'review_requested') {
    return 'Aguardando análise'
  }

  if (status === 'reviewed') {
    return 'Analisado'
  }

  if (status === 'archived') {
    return 'Arquivado'
  }

  if (status === 'draft') {
    return 'Rascunho'
  }

  return 'Em andamento'
}


export function CasesPage() {
  const {
    user,
  } = useAuth()

  const navigate =
    useNavigate()

  const [
    cases,
    setCases,
  ] =
    useState<CaseRow[]>([])

  const [
    invitations,
    setInvitations,
  ] =
    useState<InvitationRow[]>([])

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    message,
    setMessage,
  ] =
    useState('')

  const [
    creating,
    setCreating,
  ] =
    useState(false)

  const [
    clientName,
    setClientName,
  ] =
    useState('')

  const [
    reference,
    setReference,
  ] =
    useState('')

  const [
    processNumber,
    setProcessNumber,
  ] =
    useState('')

  const [
    bankName,
    setBankName,
  ] =
    useState('')


  async function load() {
    setLoading(true)

    const [
      casesResult,
      invitationResult,
    ] = await Promise.all([
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
          created_at,
          updated_at,
          finalized_at
        `)
        .order(
          'updated_at',
          {
            ascending: false,
          }
        ),

      supabase.rpc(
        'adv_get_my_case_invitations'
      ),
    ])

    if (casesResult.error) {
      setMessage(
        casesResult.error.message
      )
    }

    if (invitationResult.error) {
      setMessage(
        invitationResult.error.message
      )
    }

    setCases(
      casesResult.data ?? []
    )

    setInvitations(
      invitationResult.data ?? []
    )

    setLoading(false)
  }


  useEffect(() => {
    void load()
  }, [])


  const ownCases =
    useMemo(
      () =>
        cases.filter(
          (item) =>
            item.user_id ===
            user?.id
        ),
      [
        cases,
        user?.id,
      ]
    )


  const sharedCases =
    useMemo(
      () =>
        cases.filter(
          (item) =>
            item.user_id !==
            user?.id
        ),
      [
        cases,
        user?.id,
      ]
    )


  async function createCase() {
    if (
      !user ||
      !clientName.trim()
    ) {
      setMessage(
        'Informe pelo menos o nome do cliente.'
      )

      return
    }

    const {
      data,
      error,
    } =
      await supabase
        .from('adv_cases')
        .insert({
          user_id:
            user.id,

          client_name:
            clientName.trim(),

          client_reference:
            reference.trim() ||
            null,

          process_number:
            processNumber.trim() ||
            null,

          bank_name:
            bankName.trim() ||
            null,

          original_debt:
            0,

          status:
            'in_progress',

          progress_percent:
            10,
        })
        .select('id')
        .single()

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setCreating(false)

    setClientName('')
    setReference('')
    setProcessNumber('')
    setBankName('')

    navigate(
      `/app/casos/${data.id}`
    )
  }


  async function respondInvite(
    invitation:
      InvitationRow,
    accept: boolean
  ) {
    const {
      error,
    } =
      await supabase.rpc(
        'adv_respond_case_invite',
        {
          p_invitation_id:
            invitation
              .invitation_id,

          p_scope:
            invitation.scope,

          p_accept:
            accept,
        }
      )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setMessage(
      accept
        ? 'Convite aceito.'
        : 'Convite recusado.'
    )

    await load()
  }


  async function deleteCase(
    item: CaseRow
  ) {
    if (
      item.user_id !==
      user?.id
    ) {
      return
    }

    const confirmed =
      window.confirm(
        `Excluir definitivamente o caso de ${
          item.client_name ||
          'este cliente'
        }?`
      )

    if (!confirmed) {
      return
    }

    const {
      error,
    } =
      await supabase
        .from('adv_cases')
        .delete()
        .eq(
          'id',
          item.id
        )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setMessage(
      'Caso excluído.'
    )

    await load()
  }


  function CaseCard({
    item,
    shared,
  }: {
    item: CaseRow
    shared?: boolean
  }) {
    return (
      <article className="case-pro-card">

        <div className="case-pro-top">

          <div>
            <span
              className={
                shared
                  ? 'case-owner-badge shared'
                  : 'case-owner-badge'
              }
            >
              {shared
                ? 'VOCÊ ESTÁ CONTRIBUINDO'
                : 'SEU CASO'}
            </span>

            <h3>
              {item.client_name ||
                item.client_reference ||
                'Caso sem identificação'}
            </h3>
          </div>

          <span
            className={
              item.status ===
              'finalized'
                ? 'case-status done'
                : 'case-status'
            }
          >
            {statusLabel(
              item.status
            )}
          </span>

        </div>


        <div className="case-pro-meta">

          {item.process_number && (
            <span>
              Processo:
              {' '}
              {item.process_number}
            </span>
          )}

          {item.bank_name && (
            <span>
              {item.bank_name}
            </span>
          )}

          {Number(
            item.original_debt
          ) > 0 && (
            <span>
              {money.format(
                Number(
                  item.original_debt
                )
              )}
            </span>
          )}

        </div>


        <div className="case-progress">

          <div>
            <span>
              Progresso
            </span>

            <strong>
              {item.status ===
              'finalized'
                ? 100
                : item.progress_percent}
              %
            </strong>
          </div>

          <div className="case-progress-track">
            <div
              style={{
                width:
                  `${item.status === 'finalized'
                    ? 100
                    : item.progress_percent}%`,
              }}
            />
          </div>

        </div>


        <div className="case-pro-footer">

          <span>
            Atualizado em{' '}
            {new Date(
              item.updated_at ||
              item.created_at
            ).toLocaleDateString(
              'pt-BR'
            )}
          </span>


          <div>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate(
                  `/app/casos/${item.id}`
                )
              }
            >
              <ExternalLink
                size={15}
              />

              Abrir caso
            </button>


            {!shared && (
              <button
                type="button"
                className="case-delete-button"
                onClick={() =>
                  void deleteCase(
                    item
                  )
                }
              >
                <Trash2
                  size={15}
                />
              </button>
            )}

          </div>

        </div>

      </article>
    )
  }


  return (
    <div className="page">

      <div className="page-heading case-heading-row">

        <div>
          <span className="eyebrow">
            CASOS
          </span>

          <h1>
            Seus casos
          </h1>

          <p>
            Cada caso funciona como um prontuário:
            cálculos, documentos, análises,
            contribuições e histórico ficam
            organizados no mesmo lugar.
          </p>
        </div>


        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setCreating(
              (current) =>
                !current
            )
          }
        >
          <Plus size={16} />

          Novo caso
        </button>

      </div>


      {message && (
        <div className="system-message">
          {message}
        </div>
      )}


      {creating && (
        <section className="panel new-case-panel">

          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                NOVO PRONTUÁRIO
              </span>

              <h2>
                Criar caso
              </h2>
            </div>
          </div>

          <div className="new-case-grid">

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
              Referência interna

              <input
                value={reference}
                onChange={(event) =>
                  setReference(
                    event.target.value
                  )
                }
                placeholder="Ex.: CASO-2026-001"
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
                placeholder="Opcional"
              />
            </label>


            <label>
              Instituição / parte relacionada

              <input
                value={bankName}
                onChange={(event) =>
                  setBankName(
                    event.target.value
                  )
                }
                placeholder="Opcional"
              />
            </label>

          </div>


          <div className="new-case-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setCreating(false)
              }
            >
              Cancelar
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                void createCase()
              }
            >
              Criar prontuário
            </button>

          </div>

        </section>
      )}


      {invitations.length > 0 && (
        <section className="case-section">

          <div className="case-section-heading">
            <div>
              <UserRoundCheck
                size={19}
              />

              <div>
                <span className="eyebrow">
                  CONVITES
                </span>

                <h2>
                  Convites para colaborar
                </h2>
              </div>
            </div>
          </div>


          <div className="invitation-grid">

            {invitations.map(
              (invitation) => (
                <article
                  className="invitation-card"
                  key={
                    invitation
                      .invitation_id
                  }
                >

                  <span>
                    {invitation.scope ===
                    'all'
                      ? 'ACESSO A TODOS OS CASOS'
                      : 'CONVITE PARA UM CASO'}
                  </span>

                  <h3>
                    {
                      invitation.case_title
                    }
                  </h3>

                  <p>
                    Convite enviado por{' '}
                    <strong>
                      {
                        invitation.inviter_name
                      }
                    </strong>
                    .
                  </p>

                  <p>
                    Permissão:{' '}
                    <strong>
                      {invitation.permission ===
                      'view'
                        ? 'Somente visualizar'
                        : 'Contribuir'}
                    </strong>
                  </p>


                  <div className="invitation-actions">

                    <button
                      type="button"
                      className="approve-button"
                      onClick={() =>
                        void respondInvite(
                          invitation,
                          true
                        )
                      }
                    >
                      <Check
                        size={15}
                      />

                      Aceitar
                    </button>


                    <button
                      type="button"
                      className="reject-button"
                      onClick={() =>
                        void respondInvite(
                          invitation,
                          false
                        )
                      }
                    >
                      <X
                        size={15}
                      />

                      Recusar
                    </button>

                  </div>

                </article>
              )
            )}

          </div>

        </section>
      )}


      <section className="case-section">

        <div className="case-section-heading">
          <div>
            <BriefcaseBusiness
              size={19}
            />

            <div>
              <span className="eyebrow">
                RESPONSÁVEL
              </span>

              <h2>
                Meus casos
              </h2>
            </div>
          </div>

          <span>
            {ownCases.length}
          </span>
        </div>


        {loading && (
          <div className="empty-state">
            Carregando...
          </div>
        )}


        {!loading &&
          ownCases.length === 0 && (
            <div className="empty-state case-empty">
              <BriefcaseBusiness
                size={30}
              />

              <strong>
                Nenhum caso criado
              </strong>

              <span>
                Clique em Novo caso para iniciar
                o primeiro prontuário.
              </span>
            </div>
          )}


        <div className="cases-pro-grid">

          {ownCases.map(
            (item) => (
              <CaseCard
                item={item}
                key={item.id}
              />
            )
          )}

        </div>

      </section>


      {sharedCases.length > 0 && (
        <section className="case-section">

          <div className="case-section-heading">
            <div>
              <UserRoundCheck
                size={19}
              />

              <div>
                <span className="eyebrow">
                  COLABORAÇÕES
                </span>

                <h2>
                  Casos em que você contribui
                </h2>
              </div>
            </div>

            <span>
              {sharedCases.length}
            </span>
          </div>


          <div className="cases-pro-grid">

            {sharedCases.map(
              (item) => (
                <CaseCard
                  shared
                  item={item}
                  key={item.id}
                />
              )
            )}

          </div>

        </section>
      )}

    </div>
  )
}
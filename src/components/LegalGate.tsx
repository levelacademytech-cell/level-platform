import {
  ShieldCheck,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import type {
  ReactNode,
} from 'react'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'

import {
  LEGAL_VERSION,
} from '../legal/legalDocuments'

import type {
  LegalDocumentCode,
} from '../legal/legalDocuments'

import {
  LegalDialog,
} from './LegalDialog'

type Props = {
  children: ReactNode
}

export function LegalGate({
  children,
}: Props) {
  const {
    user,
  } = useAuth()

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    accepted,
    setAccepted,
  ] =
    useState(false)

  const [
    terms,
    setTerms,
  ] =
    useState(false)

  const [
    privacy,
    setPrivacy,
  ] =
    useState(false)

  const [
    thirdParty,
    setThirdParty,
  ] =
    useState(false)

  const [
    legalOpen,
    setLegalOpen,
  ] =
    useState<LegalDocumentCode | null>(
      null
    )

  const [
    message,
    setMessage,
  ] =
    useState('')

  useEffect(() => {
    if (!user) {
      return
    }

    void supabase
      .from(
        'adv_legal_acceptances'
      )
      .select(
        'document_code'
      )
      .eq(
        'user_id',
        user.id
      )
      .eq(
        'document_version',
        LEGAL_VERSION
      )
      .then(({
        data,
        error,
      }) => {
        if (error) {
          setMessage(
            error.message
          )

          setLoading(false)

          return
        }

        const codes =
          new Set(
            (data ?? []).map(
              (item) =>
                item.document_code
            )
          )

        setAccepted(
          codes.has('terms') &&
          codes.has(
            'privacy_notice'
          ) &&
          codes.has(
            'third_party_declaration'
          )
        )

        setLoading(false)
      })
  }, [user?.id])

  async function confirm() {
    if (
      !terms ||
      !privacy ||
      !thirdParty
    ) {
      setMessage(
        'Marque as trÃªs declaraÃ§Ãµes obrigatÃ³rias para continuar.'
      )

      return
    }

    const {
      error,
    } =
      await supabase.rpc(
        'adv_accept_current_legal',
        {
          p_user_agent:
            navigator.userAgent,
        }
      )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setAccepted(true)
  }

  if (loading) {
    return (
      <div className="level-loading">
        LEVEL ADV
      </div>
    )
  }

  if (accepted) {
    return (
      <>
        {children}
      </>
    )
  }

  return (
    <>
      <div className="legal-gate">
        <section>
          <div className="legal-gate-icon">
            <ShieldCheck
              size={29}
            />
          </div>

          <span className="eyebrow">
            PRIVACIDADE E LGPD
          </span>

          <h1>
            AtualizaÃ§Ã£o de termos
          </h1>

          <p>
            Antes de continuar, revise os
            documentos aplicÃ¡veis Ã  sua
            utilizaÃ§Ã£o da LEVEL ADV.
          </p>

          <label>
            <input
              type="checkbox"
              checked={terms}
              onChange={(event) =>
                setTerms(
                  event.target.checked
                )
              }
            />

            <span>
              Li e aceito os
              <button
                type="button"
                onClick={() =>
                  setLegalOpen(
                    'terms'
                  )
                }
              >
                Termos de Uso
              </button>.
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={privacy}
              onChange={(event) =>
                setPrivacy(
                  event.target.checked
                )
              }
            />

            <span>
              Li a
              <button
                type="button"
                onClick={() =>
                  setLegalOpen(
                    'privacy'
                  )
                }
              >
                PolÃ­tica de Privacidade
              </button>
              e estou ciente das
              informaÃ§Ãµes sobre o
              tratamento de dados.
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={thirdParty}
              onChange={(event) =>
                setThirdParty(
                  event.target.checked
                )
              }
            />

            <span>
              Declaro possuir fundamento
              jurÃ­dico adequado para
              inserir dados e documentos
              de terceiros e observar o
              sigilo profissional.
              <button
                type="button"
                onClick={() =>
                  setLegalOpen(
                    'thirdParty'
                  )
                }
              >
                Ler declaraÃ§Ã£o
              </button>
            </span>
          </label>

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <button
            type="button"
            className="auth-main-button"
            onClick={() =>
              void confirm()
            }
          >
            Concordar e continuar
          </button>

          <small>
            VersÃ£o {LEGAL_VERSION}.
            O registro do aceite fica
            associado Ã  sua conta.
          </small>
        </section>
      </div>

      <LegalDialog
        code={legalOpen}
        onClose={() =>
          setLegalOpen(null)
        }
      />
    </>
  )
}
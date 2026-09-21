import {
  X,
} from 'lucide-react'

import {
  LEGAL_DOCUMENTS,
} from '../legal/legalDocuments'

import type {
  LegalDocumentCode,
} from '../legal/legalDocuments'

type Props = {
  code: LegalDocumentCode | null
  onClose: () => void
}

export function LegalDialog({
  code,
  onClose,
}: Props) {
  if (!code) {
    return null
  }

  const document =
    LEGAL_DOCUMENTS[code]

  return (
    <div
      className="legal-dialog-backdrop"
      onClick={onClose}
    >
      <section
        className="legal-dialog"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header>
          <div>
            <span>
              {document.eyebrow}
            </span>

            <h2>
              {document.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>

        <div className="legal-dialog-content">
          {document.paragraphs.map(
            (
              paragraph,
              index
            ) => (
              <p key={index}>
                {paragraph}
              </p>
            )
          )}
        </div>

        <footer>
          <span>
            Versão 1.0.0
          </span>

          <button
            type="button"
            className="primary-button"
            onClick={onClose}
          >
            Entendi
          </button>
        </footer>
      </section>
    </div>
  )
}
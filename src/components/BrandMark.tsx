import {
  useBranding,
} from '../context/BrandingContext'

export function BrandMark({
  compact = false,
}: {
  compact?: boolean
}) {
  const {
    logoUrl,
    companyName,
  } =
    useBranding()

  return (
    <div
      className={
        compact
          ? 'level-brand-mark compact'
          : 'level-brand-mark'
      }
    >
      <img
        src={logoUrl}
        alt="LEVEL ADV"
      />

      <div>
        <div className="level-brand-wordmark">
          <strong>
            LEVEL
          </strong>

          <span>
            ADV
          </span>
        </div>

        <small>
          Uma empresa {companyName}
        </small>
      </div>
    </div>
  )
}

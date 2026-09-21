import type {
  LucideIcon,
} from 'lucide-react'

export function ModulePage({
  eyebrow,
  title,
  description,
  icon: Icon,
  beta,
}: {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  beta?: boolean
}) {
  return (
    <div className="page">
      <div className="page-heading">
        <span className="eyebrow">
          {eyebrow}
        </span>

        <h1>
          {title}
        </h1>

        <p>
          {description}
        </p>
      </div>

      <section className="module-coming">
        <Icon size={34} />

        {beta && (
          <span className="beta-pill">
            BETA
          </span>
        )}

        <h2>
          Modulo preparado
        </h2>

        <p>
          A estrutura da LEVEL ADV
          ja esta preparada para
          receber este recurso.
          Vamos libera-lo nas
          proximas etapas.
        </p>
      </section>
    </div>
  )
}
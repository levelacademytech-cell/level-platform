import {
  Construction,
} from 'lucide-react'

interface Props {
  eyebrow: string
  title: string
  description: string
}

export function AdminModulePage({
  eyebrow,
  title,
  description,
}: Props) {
  return (
    <div className="director-page">
      <div className="director-page-heading">
        <span>
          {eyebrow}
        </span>

        <h1>
          {title}
        </h1>

        <p>
          {description}
        </p>
      </div>

      <section className="director-panel director-coming">
        <Construction size={34} />

        <h2>
          Modulo preparado
        </h2>

        <p>
          A estrutura e a navegacao deste
          modulo ja estao separadas no
          ambiente administrativo.
        </p>
      </section>
    </div>
  )
}
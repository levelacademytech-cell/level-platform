import {
  BriefcaseBusiness,
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  FileText,
  Plus,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  supabase,
} from '../lib/supabase'

type BannerRow = {
  id: string
  title: string
  image_url: string
  link_url: string | null
  sort_order: number
}

export function DashboardPage() {
  const [
    cases,
    setCases,
  ] = useState(0)

  const [
    documents,
    setDocuments,
  ] = useState(0)

  const [
    requests,
    setRequests,
  ] = useState(0)

  const [
    banners,
    setBanners,
  ] = useState<BannerRow[]>([])

  const [
    activeBanner,
    setActiveBanner,
  ] = useState(0)

  useEffect(() => {
    void Promise.all([
      supabase
        .from('adv_cases')
        .select(
          'id',
          {
            count: 'exact',
            head: true,
          }
        ),

      supabase
        .from('adv_documents')
        .select(
          'id',
          {
            count: 'exact',
            head: true,
          }
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
        ),

      supabase
        .from('adv_banners')
        .select(
          'id,title,image_url,link_url,sort_order'
        )
        .eq(
          'is_active',
          true
        )
        .order(
          'sort_order',
          {
            ascending: true,
          }
        ),
    ]).then(
      ([
        caseResult,
        documentResult,
        requestResult,
        bannerResult,
      ]) => {
        setCases(
          caseResult.count ?? 0
        )

        setDocuments(
          documentResult.count ?? 0
        )

        setRequests(
          requestResult.count ?? 0
        )

        if (!bannerResult.error) {
          setBanners((bannerResult.data ?? []) as BannerRow[])
        }
      }
    )
  }, [])

  useEffect(() => {
    if (
      banners.length <= 1
    ) {
      return
    }

    const timer =
      window.setInterval(
        () => {
          setActiveBanner(
            (current) =>
              (
                current + 1
              ) %
              banners.length
          )
        },
        7000
      )

    return () =>
      window.clearInterval(
        timer
      )
  }, [banners.length])

  useEffect(() => {
    if (
      activeBanner >=
      banners.length
    ) {
      setActiveBanner(0)
    }
  }, [
    activeBanner,
    banners.length,
  ])

  function previousBanner() {
    if (
      banners.length === 0
    ) {
      return
    }

    setActiveBanner(
      (current) =>
        (
          current -
          1 +
          banners.length
        ) %
        banners.length
    )
  }

  function nextBanner() {
    if (
      banners.length === 0
    ) {
      return
    }

    setActiveBanner(
      (current) =>
        (
          current + 1
        ) %
        banners.length
    )
  }

  const banner =
    banners[
      activeBanner
    ]

  return (
    <div className="page">
      {banner && (
        <section className="adv-banner-carousel">
          {banner.link_url ? (
            banner.link_url
              .startsWith('/') ? (
              <Link
                className="adv-banner-link"
                to={
                  banner.link_url
                }
                aria-label={
                  banner.title
                }
              >
                <img
                  src={
                    banner.image_url
                  }
                  alt={
                    banner.title
                  }
                />
              </Link>
            ) : (
              <a
                className="adv-banner-link"
                href={
                  banner.link_url
                }
                target="_blank"
                rel="noreferrer"
                aria-label={
                  banner.title
                }
              >
                <img
                  src={
                    banner.image_url
                  }
                  alt={
                    banner.title
                  }
                />
              </a>
            )
          ) : (
            <img
              src={
                banner.image_url
              }
              alt={
                banner.title
              }
            />
          )}

          {banners.length > 1 && (
            <>
              <button
                type="button"
                className="banner-arrow previous"
                onClick={
                  previousBanner
                }
                aria-label="Banner anterior"
              >
                <ChevronLeft
                  size={20}
                />
              </button>

              <button
                type="button"
                className="banner-arrow next"
                onClick={
                  nextBanner
                }
                aria-label="PrÃ³ximo banner"
              >
                <ChevronRight
                  size={20}
                />
              </button>

              <div className="banner-dots">
                {banners.map(
                  (
                    item,
                    index
                  ) => (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      className={
                        index ===
                        activeBanner
                          ? 'active'
                          : ''
                      }
                      onClick={() =>
                        setActiveBanner(
                          index
                        )
                      }
                      aria-label={
                        `Abrir banner ${index + 1}`
                      }
                    />
                  )
                )}
              </div>
            </>
          )}
        </section>
      )}

      <section className="stats-grid">
        <article>
          <BriefcaseBusiness
            size={20}
          />

          <span>Casos</span>
          <strong>{cases}</strong>
        </article>

        <article>
          <FileText size={20} />

          <span>Documentos</span>
          <strong>
            {documents}
          </strong>
        </article>

        <article>
          <Calculator size={20} />

          <span>
            AnÃ¡lises solicitadas
          </span>

          <strong>
            {requests}
          </strong>
        </article>

        <article className="gold-stat">
          <Plus size={20} />

          <span>
            Ferramentas LEVEL
          </span>

          <strong>
            ADV
          </strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <span className="eyebrow">
            CALCULADORAS
          </span>

          <h2>
            Ferramentas jurÃ­dicas
            em um sÃ³ ambiente
          </h2>

          <p>
            Acesse calculadoras bancÃ¡rias,
            trabalhistas, tributÃ¡rias,
            previdenciÃ¡rias e outras
            ferramentas de apoio.
          </p>

          <Link
            to="/app/calculadoras"
            className="text-link"
          >
            Abrir calculadoras â†’
          </Link>
        </article>

        <article className="panel">
          <span className="eyebrow">
            DOCUMENTOS
          </span>

          <h2>
            Modelos prontos
            para editar
          </h2>

          <p>
            Use os geradores jurÃ­dicos,
            salve seus documentos e
            gere PDFs diretamente
            pela plataforma.
          </p>

          <Link
            to="/app/gerador-documentos"
            className="text-link"
          >
            Abrir gerador â†’
          </Link>
        </article>

        <article className="panel">
          <span className="eyebrow">
            CASOS
          </span>

          <h2>
            Organize o histÃ³rico
            dos seus clientes
          </h2>

          <p>
            Centralize cÃ¡lculos,
            documentos, contribuiÃ§Ãµes
            e andamento dos casos.
          </p>

          <Link
            to="/app/casos"
            className="text-link"
          >
            Abrir casos â†’
          </Link>
        </article>

        <article className="panel">
          <span className="eyebrow">
            LEVEL ADV
          </span>

          <h2>
            Uma empresa
            Ludo Digital MKT
          </h2>

          <p>
            Tecnologia criada para
            apoiar a rotina jurÃ­dica,
            centralizar ferramentas e
            melhorar a produtividade
            das equipes.
          </p>

          <FileSignature
            size={28}
          />
        </article>
      </section>
    </div>
  )
}

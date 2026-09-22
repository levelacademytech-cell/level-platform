import {
  Eye,
  EyeOff,
  ImagePlus,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import type {
  ChangeEvent,
} from 'react'

import {
  useAuth,
} from '../context/AuthContext'

import {
  useBranding,
} from '../context/BrandingContext'

import {
  supabase,
} from '../lib/supabase'

type BannerRow = {
  id: string
  title: string
  image_url: string
  storage_path: string | null
  link_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

type BrandKind =
  | 'logo'
  | 'favicon'
  | 'share'

function safeName(
  value: string
) {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[^a-zA-Z0-9._-]/g,
      '-'
    )
}

function extensionFor(
  file: File
) {
  const current =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase()

  if (
    current &&
    current.length <= 5
  ) {
    return current
  }

  if (
    file.type ===
    'image/webp'
  ) {
    return 'webp'
  }

  if (
    file.type ===
    'image/jpeg'
  ) {
    return 'jpg'
  }

  if (
    file.type.includes(
      'icon'
    )
  ) {
    return 'ico'
  }

  return 'png'
}

export function BannerAdminPage() {
  const {
    user,
    isAdmin,
  } =
    useAuth()

  const {
    logoUrl,
    faviconUrl,
    shareImageUrl,
    companyName,
    refreshBranding,
  } =
    useBranding()

  const [
    banners,
    setBanners,
  ] =
    useState<BannerRow[]>(
      []
    )

  const [
    file,
    setFile,
  ] =
    useState<File | null>(
      null
    )

  const [
    title,
    setTitle,
  ] =
    useState('')

  const [
    linkUrl,
    setLinkUrl,
  ] =
    useState('/app')

  const [
    sortOrder,
    setSortOrder,
  ] =
    useState(10)

  const [
    company,
    setCompany,
  ] =
    useState(
      companyName
    )

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

  useEffect(() => {
    setCompany(
      companyName
    )
  }, [companyName])

  async function load() {
    if (!isAdmin) {
      return
    }

    const {
      data,
      error,
    } =
      await supabase
        .from(
          'adv_banners'
        )
        .select('*')
        .order(
          'sort_order',
          {
            ascending:
              true,
          }
        )

    if (error) {
      setMessage(
        error.message
      )
      return
    }

    setBanners(
      (
        data ?? []
      ) as BannerRow[]
    )
  }

  useEffect(() => {
    void load()
  }, [isAdmin])

  function onFile(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const next =
      event.target
        .files?.[0] ??
      null

    if (!next) {
      setFile(null)
      return
    }

    if (
      !next.type
        .startsWith(
          'image/'
        )
    ) {
      setMessage(
        'Selecione uma imagem válida.'
      )

      event.target.value =
        ''

      return
    }

    if (
      next.size >
      8 * 1024 * 1024
    ) {
      setMessage(
        'A imagem deve ter no máximo 8 MB.'
      )

      event.target.value =
        ''

      return
    }

    setMessage('')
    setFile(next)
  }

  async function uploadBrand(
    kind: BrandKind,
    selected: File
  ) {
    if (
      !user ||
      !isAdmin
    ) {
      return
    }

    setBusy(true)
    setMessage(
      'Atualizando identidade visual...'
    )

    const ext =
      extensionFor(
        selected
      )

    const storagePath =
      `branding/${kind}-${Date.now()}.${ext}`

    const {
      error:
        uploadError,
    } =
      await supabase
        .storage
        .from(
          'level-adv-branding'
        )
        .upload(
          storagePath,
          selected,
          {
            contentType:
              selected.type,
            upsert: false,
          }
        )

    if (
      uploadError
    ) {
      setBusy(false)
      setMessage(
        uploadError.message
      )
      return
    }

    const {
      data:
        publicUrl,
    } =
      supabase.storage
        .from(
          'level-adv-branding'
        )
        .getPublicUrl(
          storagePath
        )

    const key =
      kind === 'logo'
        ? 'brand_logo_url'
        : kind ===
            'favicon'
          ? 'brand_favicon_url'
          : 'brand_share_image_url'

    const {
      error,
    } =
      await supabase
        .from(
          'adv_settings'
        )
        .upsert({
          key,
          value:
            publicUrl
              .publicUrl,
        })

    setBusy(false)

    if (error) {
      setMessage(
        error.message
      )
      return
    }

    await refreshBranding()

    setMessage(
      'Identidade visual atualizada.'
    )
  }

  async function saveCompany() {
    const value =
      company.trim() ||
      'Ludo Digital MKT'

    const {
      error,
    } =
      await supabase
        .from(
          'adv_settings'
        )
        .upsert({
          key:
            'brand_company_name',

          value,
        })

    if (error) {
      setMessage(
        error.message
      )
      return
    }

    await refreshBranding()

    setMessage(
      'Nome da empresa atualizado.'
    )
  }

  async function createBanner() {
    if (
      !user ||
      !isAdmin
    ) {
      return
    }

    if (
      !file ||
      !title.trim()
    ) {
      setMessage(
        'Informe o título e selecione a imagem.'
      )
      return
    }

    setBusy(true)
    setMessage(
      'Enviando banner...'
    )

    const storagePath =
      `${user.id}/${Date.now()}-${safeName(file.name)}`

    const {
      error:
        uploadError,
    } =
      await supabase
        .storage
        .from(
          'level-adv-banners'
        )
        .upload(
          storagePath,
          file,
          {
            contentType:
              file.type,

            upsert:
              false,
          }
        )

    if (
      uploadError
    ) {
      setBusy(false)
      setMessage(
        uploadError.message
      )
      return
    }

    const {
      data:
        publicUrl,
    } =
      supabase.storage
        .from(
          'level-adv-banners'
        )
        .getPublicUrl(
          storagePath
        )

    const {
      error,
    } =
      await supabase
        .from(
          'adv_banners'
        )
        .insert({
          title:
            title.trim(),

          image_url:
            publicUrl
              .publicUrl,

          storage_path:
            storagePath,

          link_url:
            linkUrl
              .trim() ||
            null,

          sort_order:
            sortOrder,

          is_active:
            true,

          created_by:
            user.id,
        })

    if (error) {
      await supabase
        .storage
        .from(
          'level-adv-banners'
        )
        .remove([
          storagePath,
        ])

      setBusy(false)

      setMessage(
        error.message
      )
      return
    }

    setTitle('')
    setLinkUrl('/app')
    setSortOrder(10)
    setFile(null)
    setBusy(false)

    setMessage(
      'Banner publicado no carrossel.'
    )

    await load()
  }

  function updateLocal(
    id: string,
    patch:
      Partial<BannerRow>
  ) {
    setBanners(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.id ===
            id
              ? {
                  ...item,
                  ...patch,
                }
              : item
        )
    )
  }

  async function saveBanner(
    banner: BannerRow
  ) {
    setBusy(true)

    const {
      error,
    } =
      await supabase
        .from(
          'adv_banners'
        )
        .update({
          title:
            banner.title
              .trim(),

          link_url:
            banner
              .link_url
              ?.trim() ||
            null,

          sort_order:
            Number(
              banner
                .sort_order
            ) || 0,

          is_active:
            banner
              .is_active,
        })
        .eq(
          'id',
          banner.id
        )

    setBusy(false)

    if (error) {
      setMessage(
        error.message
      )
      return
    }

    setMessage(
      'Banner atualizado.'
    )

    await load()
  }

  async function toggleBanner(
    banner: BannerRow
  ) {
    const {
      error,
    } =
      await supabase
        .from(
          'adv_banners'
        )
        .update({
          is_active:
            !banner
              .is_active,
        })
        .eq(
          'id',
          banner.id
        )

    if (error) {
      setMessage(
        error.message
      )
      return
    }

    await load()
  }

  async function deleteBanner(
    banner: BannerRow
  ) {
    const confirmed =
      window.confirm(
        `Excluir o banner "${banner.title}"?`
      )

    if (!confirmed) {
      return
    }

    setBusy(true)

    if (
      banner.storage_path
    ) {
      const {
        error:
          storageError,
      } =
        await supabase
          .storage
          .from(
            'level-adv-banners'
          )
          .remove([
            banner
              .storage_path,
          ])

      if (
        storageError
      ) {
        setBusy(false)
        setMessage(
          storageError
            .message
        )
        return
      }
    }

    const {
      error,
    } =
      await supabase
        .from(
          'adv_banners'
        )
        .delete()
        .eq(
          'id',
          banner.id
        )

    setBusy(false)

    if (error) {
      setMessage(
        error.message
      )
      return
    }

    setMessage(
      'Banner excluído.'
    )

    await load()
  }

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="module-coming">
          Acesso restrito.
        </div>
      </div>
    )
  }

  return (
    <div className="page banner-admin-page">
      <div className="page-heading">
        <span className="eyebrow">
          ADMINISTRAÇÃO
        </span>

        <h1>
          Banners e marca
        </h1>

        <p>
          Controle os anúncios e
          a identidade visual da
          LEVEL ADV.
        </p>
      </div>

      {message && (
        <div className="system-message">
          {message}
        </div>
      )}

      <section className="panel brand-admin-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              IDENTIDADE VISUAL
            </span>

            <h2>
              Logo, favicon e compartilhamento
            </h2>

            <p>
              A logo é usada dentro
              da plataforma. O favicon
              aparece na aba do
              navegador. A imagem de
              compartilhamento é usada
              pela interface e como
              referência para links.
            </p>
          </div>

          <ImagePlus
            size={24}
          />
        </div>

        <div className="brand-assets-grid">
          <article>
            <img
              src={logoUrl}
              alt="Logo atual"
            />

            <div>
              <strong>
                Logo principal
              </strong>

              <span>
                Recomendado:
                PNG quadrado e fundo
                transparente ou claro.
              </span>
            </div>

            <label className="secondary-button brand-upload-button">
              <UploadCloud
                size={14}
              />

              Trocar logo

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(
                  event
                ) => {
                  const selected =
                    event
                      .target
                      .files?.[0]

                  if (
                    selected
                  ) {
                    void uploadBrand(
                      'logo',
                      selected
                    )
                  }

                  event
                    .currentTarget
                    .value =
                    ''
                }}
              />
            </label>
          </article>

          <article>
            <img
              src={faviconUrl}
              alt="Favicon atual"
            />

            <div>
              <strong>
                Favicon
              </strong>

              <span>
                Ícone pequeno da aba
                do navegador.
              </span>
            </div>

            <label className="secondary-button brand-upload-button">
              <UploadCloud
                size={14}
              />

              Trocar favicon

              <input
                type="file"
                accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                onChange={(
                  event
                ) => {
                  const selected =
                    event
                      .target
                      .files?.[0]

                  if (
                    selected
                  ) {
                    void uploadBrand(
                      'favicon',
                      selected
                    )
                  }

                  event
                    .currentTarget
                    .value =
                    ''
                }}
              />
            </label>
          </article>

          <article>
            <img
              src={shareImageUrl}
              alt="Imagem de compartilhamento atual"
            />

            <div>
              <strong>
                Compartilhamento
              </strong>

              <span>
                Recomendado:
                1200 × 630.
                Alguns aplicativos
                mantêm cache da
                imagem anterior.
              </span>
            </div>

            <label className="secondary-button brand-upload-button">
              <UploadCloud
                size={14}
              />

              Trocar imagem

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(
                  event
                ) => {
                  const selected =
                    event
                      .target
                      .files?.[0]

                  if (
                    selected
                  ) {
                    void uploadBrand(
                      'share',
                      selected
                    )
                  }

                  event
                    .currentTarget
                    .value =
                    ''
                }}
              />
            </label>
          </article>
        </div>

        <div className="brand-company-row">
          <label>
            Empresa responsável

            <input
              value={
                company
              }
              onChange={(
                event
              ) =>
                setCompany(
                  event
                    .target
                    .value
                )
              }
            />
          </label>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              void saveCompany()
            }
          >
            <Save
              size={14}
            />

            Salvar empresa
          </button>
        </div>

        <small className="brand-note">
          O ícone instalado como aplicativo
          usa também os arquivos PWA
          empacotados nesta versão da LEVEL.
        </small>
      </section>

      <section className="panel banner-create-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              NOVO BANNER
            </span>

            <h2>
              Publicar imagem
            </h2>

            <p>
              Recomendado:
              1600 × 900 ou
              1920 × 1080,
              formato 16:9,
              PNG/JPG/WEBP.
            </p>
          </div>

          <ImagePlus
            size={24}
          />
        </div>

        <div className="banner-admin-form">
          <label>
            Título interno

            <input
              value={title}
              onChange={(
                event
              ) =>
                setTitle(
                  event
                    .target
                    .value
                )
              }
              placeholder="Ex.: Calculadoras jurídicas"
            />
          </label>

          <label>
            Link ao clicar

            <input
              value={
                linkUrl
              }
              onChange={(
                event
              ) =>
                setLinkUrl(
                  event
                    .target
                    .value
                )
              }
              placeholder="/app/calculadoras ou https://..."
            />
          </label>

          <label>
            Ordem

            <input
              type="number"
              value={
                sortOrder
              }
              onChange={(
                event
              ) =>
                setSortOrder(
                  Number(
                    event
                      .target
                      .value
                  )
                )
              }
            />
          </label>

          <label className="banner-upload-field">
            <UploadCloud
              size={24}
            />

            <strong>
              Selecionar imagem
            </strong>

            <span>
              {file
                ? file.name
                : 'PNG, JPG ou WEBP • até 8 MB'}
            </span>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={
                onFile
              }
            />
          </label>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            void createBanner()
          }
          disabled={
            busy
          }
        >
          <UploadCloud
            size={15}
          />

          {busy
            ? 'Salvando...'
            : 'Salvar no carrossel'}
        </button>
      </section>

      <section className="banner-admin-list">
        {banners.map(
          (
            banner
          ) => (
            <article
              key={
                banner.id
              }
              className="banner-admin-card"
            >
              <img
                src={
                  banner.image_url
                }
                alt={
                  banner.title
                }
              />

              <div className="banner-admin-card-body">
                <label>
                  Título

                  <input
                    value={
                      banner.title
                    }
                    onChange={(
                      event
                    ) =>
                      updateLocal(
                        banner.id,
                        {
                          title:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                  />
                </label>

                <label>
                  Link

                  <input
                    value={
                      banner.link_url ??
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateLocal(
                        banner.id,
                        {
                          link_url:
                            event
                              .target
                              .value,
                        }
                      )
                    }
                  />
                </label>

                <label>
                  Ordem

                  <input
                    type="number"
                    value={
                      banner.sort_order
                    }
                    onChange={(
                      event
                    ) =>
                      updateLocal(
                        banner.id,
                        {
                          sort_order:
                            Number(
                              event
                                .target
                                .value
                            ),
                        }
                      )
                    }
                  />
                </label>

                <div className="banner-admin-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      void toggleBanner(
                        banner
                      )
                    }
                  >
                    {banner.is_active ? (
                      <EyeOff
                        size={14}
                      />
                    ) : (
                      <Eye
                        size={14}
                      />
                    )}

                    {banner.is_active
                      ? 'Pausar'
                      : 'Ativar'}
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      void saveBanner(
                        banner
                      )
                    }
                    disabled={
                      busy
                    }
                  >
                    <Save
                      size={14}
                    />

                    Salvar
                  </button>

                  <button
                    type="button"
                    className="secondary-button danger"
                    onClick={() =>
                      void deleteBanner(
                        banner
                      )
                    }
                    disabled={
                      busy
                    }
                  >
                    <Trash2
                      size={14}
                    />

                    Excluir
                  </button>
                </div>
              </div>
            </article>
          )
        )}
      </section>
    </div>
  )
}

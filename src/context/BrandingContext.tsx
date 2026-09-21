import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  supabase,
} from '../lib/supabase'

type BrandingContextValue = {
  logoUrl: string
  faviconUrl: string
  shareImageUrl: string
  companyName: string
  refreshBranding: () => Promise<void>
}

const defaults = {
  logoUrl:
    '/brand/level-adv-icon.png',

  faviconUrl:
    '/brand/favicon-64.png',

  shareImageUrl:
    '/brand/icon-512.png',

  companyName:
    'Ludo Digital MKT',
}

const BrandingContext =
  createContext<BrandingContextValue>({
    ...defaults,

    refreshBranding:
      async () => undefined,
  })

function applyFavicon(
  faviconUrl: string
) {
  let icon =
    document.querySelector<HTMLLinkElement>(
      'link[rel="icon"]'
    )

  if (!icon) {
    icon =
      document.createElement(
        'link'
      )

    icon.rel = 'icon'

    document.head.appendChild(
      icon
    )
  }

  icon.href =
    `${faviconUrl}${faviconUrl.includes('?') ? '&' : '?'}v=${Date.now()}`

  const apple =
    document.querySelector<HTMLLinkElement>(
      'link[rel="apple-touch-icon"]'
    )

  if (apple) {
    apple.href = faviconUrl
  }
}

function applyShareImage(
  shareImageUrl: string
) {
  const og =
    document.querySelector<HTMLMetaElement>(
      'meta[property="og:image"]'
    )

  if (og) {
    og.content =
      shareImageUrl
  }

  const twitter =
    document.querySelector<HTMLMetaElement>(
      'meta[name="twitter:image"]'
    )

  if (twitter) {
    twitter.content =
      shareImageUrl
  }
}

export function BrandingProvider({
  children,
}: {
  children: ReactNode
}) {
  const [
    branding,
    setBranding,
  ] =
    useState(defaults)

  async function refreshBranding() {
    const {
      data,
      error,
    } =
      await supabase
        .from('adv_settings')
        .select('key,value')
        .in(
          'key',
          [
            'brand_logo_url',
            'brand_favicon_url',
            'brand_share_image_url',
            'brand_company_name',
          ]
        )

    if (error) {
      return
    }

    const values =
      Object.fromEntries(
        (data ?? []).map(
          (item) => [
            item.key,
            item.value,
          ]
        )
      )

    const next = {
      logoUrl:
        values.brand_logo_url ||
        defaults.logoUrl,

      faviconUrl:
        values.brand_favicon_url ||
        defaults.faviconUrl,

      shareImageUrl:
        values.brand_share_image_url ||
        defaults.shareImageUrl,

      companyName:
        values.brand_company_name ||
        defaults.companyName,
    }

    setBranding(next)

    applyFavicon(
      next.faviconUrl
    )

    applyShareImage(
      next.shareImageUrl
    )
  }

  useEffect(() => {
    void refreshBranding()
  }, [])

  const value =
    useMemo(
      () => ({
        ...branding,
        refreshBranding,
      }),
      [branding]
    )

  return (
    <BrandingContext.Provider
      value={value}
    >
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  return useContext(
    BrandingContext
  )
}

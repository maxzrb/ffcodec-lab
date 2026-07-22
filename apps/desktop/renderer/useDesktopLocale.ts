import { useEffect, useState } from 'react'

export type DesktopLocale = 'zh-CN' | 'en'

/**
 * Desktop 壳层位于共享 Workbench 的 I18nProvider 外，通过同页事件同步语言。
 */
export function useDesktopLocale(): DesktopLocale {
  const [locale, setLocale] = useState<DesktopLocale>(() =>
    localStorage.getItem('ffcodec-locale') === 'en' ? 'en' : 'zh-CN',
  )

  useEffect(() => {
    const onLocaleChange = (event: Event) => {
      const next = (event as CustomEvent<DesktopLocale>).detail
      if (next === 'zh-CN' || next === 'en') setLocale(next)
    }
    window.addEventListener('ffcodec:locale-change', onLocaleChange)
    return () => window.removeEventListener('ffcodec:locale-change', onLocaleChange)
  }, [])

  return locale
}

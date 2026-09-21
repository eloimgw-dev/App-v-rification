import { useCallback, useEffect, useState } from 'react'
import { getSettings, saveSettings } from '../services/storage'
import type { AppSettings } from '../types'

export function useTheme() {
  const [theme, setThemeState] = useState<AppSettings['theme']>(() => getSettings().theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  const setTheme = useCallback((t: AppSettings['theme']) => {
    setThemeState(t)
    saveSettings({ theme: t })
  }, [])

  const toggle = useCallback(() => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const currentlyDark = document.documentElement.hasAttribute('data-theme') ? isDark : prefersDark
    setTheme(currentlyDark ? 'light' : 'dark')
  }, [setTheme])

  return { theme, setTheme, toggle }
}

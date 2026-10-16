import { useCallback, useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import type { AppView } from '../lib/siteNav'
import { consumeBackHandlers } from '../lib/appBack'

type Options = {
  view: AppView
  setView: (view: AppView) => void
  authOpen: boolean
  closeAuth: () => void
  onExitPrompt?: () => void
}

type HistPayload = { __triplogView?: AppView }

function historyUrl() {
  return `${window.location.pathname}${window.location.search}`
}

export function useSystemBack({ view, setView, authOpen, closeAuth, onExitPrompt }: Options) {
  const viewRef = useRef(view)
  const authOpenRef = useRef(authOpen)
  const fromPopRef = useRef(false)
  const lastHistViewRef = useRef<AppView | null>(null)
  const exitAtRef = useRef(0)

  viewRef.current = view
  authOpenRef.current = authOpen

  useEffect(() => {
    if (fromPopRef.current) {
      fromPopRef.current = false
      return
    }
    const url = historyUrl()
    if (lastHistViewRef.current === null) {
      window.history.replaceState({ __triplogView: view } satisfies HistPayload, '', url)
      lastHistViewRef.current = view
      return
    }
    if (lastHistViewRef.current === view) return
    window.history.pushState({ __triplogView: view } satisfies HistPayload, '', url)
    lastHistViewRef.current = view
  }, [view])

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      fromPopRef.current = true
      const state = event.state as HistPayload | null
      if (state?.__triplogView) {
        lastHistViewRef.current = state.__triplogView
        consumeBackHandlers()
        setView(state.__triplogView)
        return
      }
      if (consumeBackHandlers()) {
        lastHistViewRef.current = viewRef.current
        window.history.pushState({ __triplogView: viewRef.current } satisfies HistPayload, '', historyUrl())
        return
      }
      const next = state?.__triplogView ?? 'home'
      lastHistViewRef.current = next
      setView(next)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [setView])

  const performBack = useCallback((): boolean => {
    if (authOpenRef.current) {
      closeAuth()
      return true
    }
    if (consumeBackHandlers()) return true

    const current = viewRef.current
    if (current === 'guide') {
      setView('planner')
      return true
    }
    if (current === 'infoPlace' || current === 'subway') {
      setView('info')
      return true
    }
    if (current === 'planner') {
      setView('trips')
      return true
    }

    if (current !== 'home') {
      window.history.back()
      return true
    }

    const now = Date.now()
    if (now - exitAtRef.current < 2000) return false
    exitAtRef.current = now
    onExitPrompt?.()
    return true
  }, [closeAuth, onExitPrompt, setView])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    let remove: (() => void) | undefined
    void import('@capacitor/app').then(({ App }) => {
      void App.addListener('backButton', () => {
        const handled = performBack()
        if (!handled) void App.exitApp()
      }).then((handle) => {
        remove = () => void handle.remove()
      })
    })
    return () => remove?.()
  }, [performBack])

  return { performBack }
}

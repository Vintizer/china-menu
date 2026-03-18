import { create } from 'zustand'

const useAdminStore = create((set) => ({
  isAdmin: null,
  checked: false,

  check: async () => {
    const initData = window.Telegram?.WebApp?.initData
    const inTelegram = !!initData
    console.log('[admin] check start:', { inTelegram, initDataLength: initData?.length ?? 0 })
    if (!initData) {
      console.log('[admin] no initData -> isAdmin=false')
      set({ isAdmin: false, checked: true })
      return
    }
    try {
      const res = await fetch('/api/admin/check', {
        headers: { 'X-Telegram-Init-Data': initData },
      })
      const data = await res.json().catch((e) => {
        console.log('[admin] parse error:', e)
        return { error: 'parse' }
      })
      const ok = res.ok && !data.error
      console.log('[admin] API response:', { status: res.status, ok, dataError: data.error, user: data.user?.id })
      set({ isAdmin: ok, checked: true })
    } catch (e) {
      console.log('[admin] fetch error:', e)
      set({ isAdmin: false, checked: true })
    }
  },
}))

export default useAdminStore

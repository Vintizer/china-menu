import { create } from 'zustand'

const useAdminStore = create((set) => ({
  isAdmin: null,
  checked: false,

  check: async () => {
    const initData = window.Telegram?.WebApp?.initData
    if (!initData) {
      set({ isAdmin: false, checked: true })
      return
    }
    try {
      const res = await fetch('/api/admin/check', {
        headers: { 'X-Telegram-Init-Data': initData },
      })
      const data = await res.json().catch(() => ({}))
      set({ isAdmin: !data.error, checked: true })
    } catch {
      set({ isAdmin: false, checked: true })
    }
  },
}))

export default useAdminStore

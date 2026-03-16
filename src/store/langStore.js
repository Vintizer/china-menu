import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useLangStore = create(
  persist(
    (set) => ({
      lang: 'cn',
      toggleLang: () => set(s => ({ lang: s.lang === 'ru' ? 'cn' : 'ru' })),
    }),
    { name: 'jiayuan-lang' }
  )
)

export default useLangStore

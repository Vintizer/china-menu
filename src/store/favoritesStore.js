import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useFavoritesStore = create(
  persist(
    (set) => ({
      codes: [],

      toggle(code) {
        set((state) => {
          const has = state.codes.includes(code)
          return {
            codes: has
              ? state.codes.filter((c) => c !== code)
              : [...state.codes, code],
          }
        })
      },

      isFavorite(code) {
        return useFavoritesStore.getState().codes.includes(code)
      },

      add(code) {
        set((state) =>
          state.codes.includes(code)
            ? state
            : { codes: [...state.codes, code] }
        )
      },

      remove(code) {
        set((state) => ({
          codes: state.codes.filter((c) => c !== code),
        }))
      },
    }),
    { name: 'jiayuan-favorites' }
  )
)

export default useFavoritesStore

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem(dish) {
        set(state => {
          const existing = state.items.find(i => i.code === dish.code)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.code === dish.code ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return { items: [...state.items, { ...dish, quantity: 1 }] }
        })
      },

      removeItem(code) {
        set(state => ({ items: state.items.filter(i => i.code !== code) }))
      },

      updateQuantity(code, qty) {
        if (qty <= 0) {
          get().removeItem(code)
          return
        }
        set(state => ({
          items: state.items.map(i => (i.code === code ? { ...i, quantity: qty } : i)),
        }))
      },

      clearCart() {
        set({ items: [] })
      },

      setItems(newItems) {
        set({
          items: newItems.map((i) => ({
            ...i,
            quantity: i.quantity ?? 1,
          })),
        })
      },

      get totalCount() {
        return get().items.reduce((s, i) => s + i.quantity, 0)
      },

      get totalPrice() {
        return get().items.reduce((s, i) => s + i.price * i.quantity, 0)
      },
    }),
    {
      name: 'jiayuan-cart',
    }
  )
)

export default useCartStore

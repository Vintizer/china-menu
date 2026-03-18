import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_ORDERS = 5

const useOrdersStore = create(
  persist(
    (set, get) => ({
      orders: [],

      addOrder(order) {
        const entry = {
          id: `o${Date.now()}`,
          timestamp: Date.now(),
          items: order.items.map((i) => ({
            code: i.code,
            name_ru: i.name_ru,
            name_cn: i.name_cn,
            price: i.price,
            quantity: i.quantity,
            weight: i.weight,
            image: i.image,
            categoryId: i.categoryId,
          })),
        }
        set((state) => ({
          orders: [entry, ...state.orders].slice(0, MAX_ORDERS),
        }))
      },

      getOrders() {
        return get().orders
      },
    }),
    { name: 'jiayuan-orders' }
  )
)

export default useOrdersStore

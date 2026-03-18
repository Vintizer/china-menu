import { useNavigate } from 'react-router-dom'
import { useMenu, getAllItems } from '../hooks/useMenu.js'
import useT from '../hooks/useT.js'
import useFavoritesStore from '../store/favoritesStore.js'
import useOrdersStore from '../store/ordersStore.js'
import useCartStore from '../store/cartStore.js'
import CategoryCard from '../components/CategoryCard.jsx'
import CartBar from '../components/CartBar.jsx'
import LangToggle from '../components/LangToggle.jsx'
import DishCard from '../components/DishCard.jsx'

export default function Home() {
  const navigate = useNavigate()
  const { menu, loading } = useMenu()
  const T = useT()
  const favoriteCodes = useFavoritesStore((s) => s.codes)
  const orders = useOrdersStore((s) => s.orders)
  const setItems = useCartStore((s) => s.setItems)

  const allItems = menu ? getAllItems(menu) : []
  const favoriteDishes = allItems.filter((d) => favoriteCodes.includes(d.code))

  const handleRepeatOrder = (order) => {
    setItems(order.items)
    navigate('/cart')
  }

  return (
    <div className="min-h-dvh pattern-bg pb-28">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-warm/95 backdrop-blur-sm border-b border-warm-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-red flex items-center justify-center shadow-md">
            <span className="text-white text-base">🏮</span>
          </div>
          <div>
            <p className="text-red font-black text-xs uppercase tracking-wider leading-none">Home Garden</p>
            <p className="cn-text text-ink text-xs font-bold leading-none mt-0.5">家园中餐厅</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button
            onClick={() => navigate('/search')}
            className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Поиск"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#D62828" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="#D62828" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Корзина"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#D62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="6" x2="21" y2="6" stroke="#D62828" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 10a4 4 0 01-8 0" stroke="#D62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 pt-6 pb-4 text-center">
        <h1 className="cn-text font-bold text-red text-4xl leading-none">家园中餐厅</h1>
        <p className="text-gold font-bold text-xs tracking-[0.25em] uppercase mt-2">Chinese Restaurant</p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="h-px bg-gold/40 flex-1" />
          <span className="text-ink font-bold text-sm">{T.heroTitle}</span>
          <div className="h-px bg-gold/40 flex-1" />
        </div>
      </div>

      {/* Favorites */}
      {!loading && favoriteDishes.length > 0 && (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-ink text-base">❤️ {T.favorites}</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 ">
            {favoriteDishes.slice(0, 6).map((dish) => (
              <div key={dish.code} className="flex-shrink-0 w-36">
                <DishCard dish={dish} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repeat last order */}
      {!loading && orders.length > 0 && (
        <div className="px-4 mt-4">
          <h2 className="font-bold text-ink text-base mb-2">🔄 {T.myOrders}</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 ">
            {orders.slice(0, 3).map((order) => (
              <button
                key={order.id}
                onClick={() => handleRepeatOrder(order)}
                className="flex-shrink-0 bg-white rounded-xl shadow-card px-4 py-3 text-left min-w-[140px] active:scale-[0.98] transition-transform"
              >
                <p className="text-xs text-gray-500">
                  {new Date(order.timestamp).toLocaleDateString()}
                </p>
                <p className="font-bold text-ink text-sm mt-0.5">
                  {T.positions(order.items.reduce((s, i) => s + i.quantity, 0))}
                </p>
                <span className="text-red text-xs font-bold mt-1 inline-block">
                  {T.repeatOrderBtn} →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories grid */}
      <div className="px-4 mt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {menu?.categories?.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                style={{ animationDelay: `${i * 0.06}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Promo banner */}
      {!loading && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-red to-red-dark rounded-2xl p-4 flex items-center justify-between overflow-hidden relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-white text-[80px] leading-none cn-text font-bold">
            餐
          </div>
          <div className="relative z-10">
            <p className="cn-text text-white font-bold text-lg leading-tight">{T.todaySpecial}</p>
            <p className="text-white/80 text-xs">{T.todaySpecialSub}</p>
            <button
              onClick={() => navigate('/category/O')}
              className="mt-2 bg-white text-red text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform"
            >
              {T.viewDetails}
            </button>
          </div>
        </div>
      )}

      <CartBar />
    </div>
  )
}

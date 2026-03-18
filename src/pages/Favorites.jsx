import { useNavigate } from 'react-router-dom'
import { useMenu, getAllItems } from '../hooks/useMenu.js'
import useT from '../hooks/useT.js'
import useFavoritesStore from '../store/favoritesStore.js'
import useAdminStore from '../store/adminStore.js'
import DishCard from '../components/DishCard.jsx'
import CartBar from '../components/CartBar.jsx'
import LangToggle from '../components/LangToggle.jsx'
import MainTabs from '../components/MainTabs.jsx'

export default function Favorites() {
  const navigate = useNavigate()
  const { menu, loading } = useMenu()
  const T = useT()
  const isAdmin = useAdminStore(s => s.isAdmin)
  const favoriteCodes = useFavoritesStore((s) => s.codes)
  const allItems = menu ? getAllItems(menu) : []
  const favoriteDishes = allItems.filter((d) => favoriteCodes.includes(d.code))

  return (
    <div className="min-h-dvh bg-warm pb-28">
      {/* Top bar - same as Home */}
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
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Админка"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D62828" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
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

      {/* Tabs */}
      <div className="px-4 pt-2">
        <MainTabs />
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
          ))
        ) : favoriteDishes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">❤️</p>
            <p className="font-semibold">{T.favoritesEmpty}</p>
            <p className="text-sm mt-1">{T.favoritesEmptySub}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 btn-primary"
            >
              {T.goToMenu}
            </button>
          </div>
        ) : (
          favoriteDishes.map((dish, i) => (
            <DishCard
              key={dish.code}
              dish={dish}
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))
        )}
      </div>

      <CartBar />
    </div>
  )
}

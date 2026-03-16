import { useNavigate } from 'react-router-dom'
import { useMenu } from '../hooks/useMenu.js'
import CategoryCard from '../components/CategoryCard.jsx'
import CartBar from '../components/CartBar.jsx'

export default function Home() {
  const navigate = useNavigate()
  const { menu, loading } = useMenu()

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
          <button
            onClick={() => navigate('/cart')}
            className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Поиск"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#D62828" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="#D62828" strokeWidth="2" strokeLinecap="round" />
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
          <span className="text-ink font-bold text-sm">Меню</span>
          <div className="h-px bg-gold/40 flex-1" />
        </div>
      </div>

      {/* Categories grid */}
      <div className="px-4">
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
            <p className="cn-text text-white font-bold text-lg leading-tight">今日推荐</p>
            <p className="text-white/80 text-xs">Special Offer for Today</p>
            <button
              onClick={() => navigate('/category/O')}
              className="mt-2 bg-white text-red text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform"
            >
              查看详情
            </button>
          </div>
        </div>
      )}

      <CartBar />
    </div>
  )
}

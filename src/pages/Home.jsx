import { useNavigate } from 'react-router-dom'
import { useMenu } from '../hooks/useMenu.js'
import useT from '../hooks/useT.js'
import useLangStore from '../store/langStore.js'
import useAdminStore from '../store/adminStore.js'
import CategoryCard from '../components/CategoryCard.jsx'
import CartBar from '../components/CartBar.jsx'
import LangToggle from '../components/LangToggle.jsx'
import MainTabs from '../components/MainTabs.jsx'

function promoDateRange(promo, lang) {
  const s = String(promo.starts_on || '').slice(0, 10)
  const e = String(promo.ends_on || '').slice(0, 10)
  if (!s || !e) return ''
  const [ys, ms, ds] = s.split('-')
  const [ye, me, de] = e.split('-')
  if (lang === 'ru') {
    if (ys === ye) return `${ds}.${ms}–${de}.${me}.${ye}`
    return `${ds}.${ms}.${ys}–${de}.${me}.${ye}`
  }
  return `${ys}年${ms}月${ds}日–${ye}年${me}月${de}日`
}

export default function Home() {
  const navigate = useNavigate()
  const { menu, loading } = useMenu()
  const T = useT()
  const lang = useLangStore(s => s.lang)
  const isAdmin = useAdminStore(s => s.isAdmin)
  const promotions = menu?.promotions ?? []

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

      {/* Акции из БД / public/promotions.json (dev) */}
      {!loading &&
        promotions.map((promo) => {
          const ru = lang === 'ru'
          const title = ru ? promo.title_ru : promo.title_cn || promo.title_ru
          const desc = ru ? promo.description_ru : promo.description_cn || promo.description_ru
          const terms = ru ? promo.terms_ru : promo.terms_cn || promo.terms_ru
          const cta =
            ru ? promo.cta_label_ru || T.viewDetails : promo.cta_label_cn || promo.cta_label_ru || T.viewDetails
          const cat = promo.cta_category_id || 'O'
          return (
            <div
              key={promo.id}
              className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-card border-2 border-gold/50 bg-[#8B0000]"
            >
              {promo.image ? (
                <img
                  src={`/images/${promo.image}`}
                  alt=""
                  className="w-full aspect-[4/3] object-cover object-top"
                  loading="lazy"
                />
              ) : null}
              <div className="p-4 text-white">
                <p className="text-gold/90 text-[10px] font-bold uppercase tracking-widest mb-1">
                  {promoDateRange(promo, lang)}
                </p>
                <h2 className={`font-black text-lg leading-tight mb-2 ${ru ? '' : 'cn-text'}`}>{title}</h2>
                <p className={`text-white/95 text-sm leading-snug ${ru ? '' : 'cn-text'}`}>{desc}</p>
                {terms ? (
                  <p className="text-white/55 text-[11px] leading-snug mt-2 border-t border-white/10 pt-2">
                    {terms}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => navigate(`/category/${cat}`)}
                  className="mt-3 w-full bg-gold text-[#5c0404] text-sm font-black py-2.5 rounded-xl active:scale-[0.98] transition-transform"
                >
                  {cta}
                </button>
              </div>
            </div>
          )
        })}

      {!loading && promotions.length === 0 && (
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

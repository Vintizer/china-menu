import { useNavigate, useLocation } from 'react-router-dom'
import useT from '../hooks/useT.js'

export default function MainTabs() {
  const navigate = useNavigate()
  const location = useLocation()
  const T = useT()
  const isFavorites = location.pathname === '/favorites'
  const isOrders = location.pathname === '/orders'

  return (
    <div className="flex gap-1 p-1 bg-warm-dark rounded-xl">
      <button
        onClick={() => navigate('/')}
        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
          !isFavorites && !isOrders ? 'bg-white text-red shadow-card' : 'text-ink/70'
        }`}
      >
        {T.heroTitle}
      </button>
      <button
        onClick={() => navigate('/favorites')}
        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
          isFavorites ? 'bg-white text-red shadow-card' : 'text-ink/70'
        }`}
      >
        ❤️ {T.favorites}
      </button>
      <button
        onClick={() => navigate('/orders')}
        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
          isOrders ? 'bg-white text-red shadow-card' : 'text-ink/70'
        }`}
      >
        🔄 {T.myOrders}
      </button>
    </div>
  )
}

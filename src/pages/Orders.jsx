import { useNavigate } from 'react-router-dom'
import useT from '../hooks/useT.js'
import useOrdersStore from '../store/ordersStore.js'
import useCartStore from '../store/cartStore.js'
import useLangStore from '../store/langStore.js'
import CartBar from '../components/CartBar.jsx'
import LangToggle from '../components/LangToggle.jsx'
import MainTabs from '../components/MainTabs.jsx'

export default function Orders() {
  const navigate = useNavigate()
  const T = useT()
  const orders = useOrdersStore((s) => s.orders)
  const setItems = useCartStore((s) => s.setItems)
  const lang = useLangStore((s) => s.lang)

  const handleRepeat = (order) => {
    setItems(order.items)
    navigate('/cart')
  }

  return (
    <div className="min-h-dvh bg-warm pb-28">
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

      <div className="px-4 pt-2">
        <MainTabs />
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔄</p>
            <p className="font-semibold">{T.ordersEmpty}</p>
            <p className="text-sm mt-1">{T.ordersEmptySub}</p>
            <button onClick={() => navigate('/')} className="mt-4 btn-primary">
              {T.goToMenu}
            </button>
          </div>
        ) : (
          orders.map((order) => {
            const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
            const count = order.items.reduce((s, i) => s + i.quantity, 0)
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-card overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      {new Date(order.timestamp).toLocaleDateString()}
                    </p>
                    <p className="font-bold text-ink text-sm mt-0.5">
                      {T.positions(count)} • {total} {T.currency}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRepeat(order)}
                    className="px-4 py-2 rounded-xl bg-red text-white font-bold text-sm active:scale-95 transition-transform"
                  >
                    {T.repeatOrderBtn}
                  </button>
                </div>
                <ul className="divide-y divide-gray-50">
                  {order.items.map((item, idx) => (
                    <li
                      key={`${order.id}-${idx}`}
                      className="px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className={`font-semibold text-ink text-sm ${lang === 'cn' ? 'cn-text' : ''}`}>
                          {lang === 'ru' ? item.name_ru : item.name_cn}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.code} • {item.quantity} × {item.price} {T.currency}
                        </p>
                      </div>
                      <p className="font-bold text-red">
                        {item.price * item.quantity} {T.currency}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })
        )}
      </div>

      <CartBar />
    </div>
  )
}

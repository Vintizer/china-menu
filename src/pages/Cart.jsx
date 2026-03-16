import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore.js'
import useT from '../hooks/useT.js'
import LangToggle from '../components/LangToggle.jsx'
import CartItemRow from '../components/CartItemRow.jsx'

const TrashIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <polyline points="3 6 5 6 21 6" stroke="#D62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14H6L5 6" stroke="#D62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" stroke="#D62828" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 6V4h6v2" stroke="#D62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Cart() {
  const navigate = useNavigate()
  const items = useCartStore(s => s.items)
  const clearCart = useCartStore(s => s.clearCart)
  const T = useT()
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalCount = items.reduce((s, i) => s + i.quantity, 0)

  const handleClear = () => {
    if (items.length > 0) clearCart()
  }

  return (
    <div className="min-h-dvh bg-warm pb-4">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-warm/95 backdrop-blur-sm border-b border-warm-dark px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#D62828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="font-bold text-ink text-base">{T.cart}</h1>
        <div className="flex items-center gap-1.5">
          <LangToggle />
          <button
            onClick={handleClear}
            className={`w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center active:scale-90 transition-all ${items.length === 0 ? 'opacity-30' : ''}`}
            disabled={items.length === 0}
          >
            {TrashIcon}
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="font-bold text-ink text-xl mb-2">{T.cartEmpty}</h2>
            <p className="text-gray-500 text-sm mb-6">{T.cartEmptySub}</p>
            <button onClick={() => navigate('/')} className="btn-primary w-auto px-8">
              {T.goToMenu}
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            {items.map(item => (
              <CartItemRow key={item.code} item={item} />
            ))}

            {/* Add more */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                         border-2 border-dashed border-red/40 text-red font-semibold text-sm
                         active:bg-red-light transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#D62828" strokeWidth="2" />
                <path d="M12 8v8M8 12h8" stroke="#D62828" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {T.addMore}
            </button>

            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-card p-4 mt-1">
              <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                <span>{T.subtotal}</span>
                <span className="text-ink font-semibold">{subtotal} {T.currency}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-3 pb-3 border-b border-warm-dark">
                <span className="text-gray-500">{T.delivery}</span>
                <span className="text-green-600 font-semibold">{T.free}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-ink text-base">{T.total}</span>
                <span className="font-black text-red text-xl">{subtotal} {T.currency}</span>
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary mt-1 shadow-[0_4px_24px_rgba(214,40,40,0.4)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {T.checkout}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

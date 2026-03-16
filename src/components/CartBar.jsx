import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore.js'
import useT from '../hooks/useT.js'

export default function CartBar() {
  const navigate = useNavigate()
  const items = useCartStore(s => s.items)
  const totalCount = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const T = useT()

  if (totalCount === 0) return null

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-4 pt-2 z-50 pointer-events-none">
      <button
        onClick={() => navigate('/cart')}
        className="w-full pointer-events-auto bg-red text-white rounded-2xl py-4 px-5
                   flex items-center justify-between shadow-[0_4px_24px_rgba(214,40,40,0.4)]
                   active:scale-[0.98] transition-all duration-150"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-gold text-ink text-[10px] font-black
                             w-5 h-5 rounded-full flex items-center justify-center leading-none">
              {totalCount}
            </span>
          </div>
          <span className="font-bold text-base">{T.cartLabel}</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/70 leading-none">Total</p>
          <p className="font-black text-lg leading-tight">{totalPrice} {T.currency}</p>
        </div>
      </button>
    </div>
  )
}

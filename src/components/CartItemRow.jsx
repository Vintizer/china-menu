import useCartStore from '../store/cartStore.js'
import useLangStore from '../store/langStore.js'
import useT from '../hooks/useT.js'
import DishImage from './DishImage.jsx'

export default function CartItemRow({ item }) {
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const lang = useLangStore(s => s.lang)
  const T = useT()

  const name = lang === 'ru' ? (item.name_ru ?? item.name_cn) : (item.name_cn ?? item.name_ru)

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-3 animate-fade-up">
      <DishImage
        src={item.image}
        code={item.code}
        alt={name}
        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-ink text-sm leading-snug truncate ${lang === 'cn' ? 'cn-text' : ''}`}>
          {name}
        </h4>
        <p className="text-red font-black text-base mt-1">{item.price} {T.currency}</p>
      </div>

      <div className="flex items-center gap-1.5 bg-red-light rounded-xl overflow-hidden flex-shrink-0">
        <button
          onClick={() => updateQuantity(item.code, item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center text-red font-black text-lg
                     active:bg-red/10 transition-colors"
        >
          −
        </button>
        <span className="w-5 text-center font-bold text-ink text-sm">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.code, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center text-red font-black text-lg
                     active:bg-red/10 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}

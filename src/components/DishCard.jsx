import { useState } from 'react'
import useCartStore from '../store/cartStore.js'
import useFavoritesStore from '../store/favoritesStore.js'
import useLangStore from '../store/langStore.js'
import useT from '../hooks/useT.js'
import DishImage from './DishImage.jsx'

export default function DishCard({ dish, style, compact }) {
  const addItem = useCartStore(s => s.addItem)
  const items = useCartStore(s => s.items)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const toggleFavorite = useFavoritesStore(s => s.toggle)
  const isFavorite = useFavoritesStore(s => s.codes.includes(dish.code))
  const cartItem = items.find(i => i.code === dish.code)
  const [added, setAdded] = useState(false)
  const lang = useLangStore(s => s.lang)
  const T = useT()

  const name = lang === 'ru' ? dish.name_ru : dish.name_cn

  const handleAdd = () => {
    addItem(dish)
    setAdded(true)
    setTimeout(() => setAdded(false), 800)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-up" style={style}>
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(dish.code)
          }}
          className={`absolute top-3 left-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all
            ${isFavorite ? 'bg-red text-white' : 'bg-white/90 text-gray-400 hover:bg-white'}`}
          aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
        <DishImage
          src={dish.image}
          code={dish.code}
          alt={name}
          className="w-full h-44 object-cover"
        />
        {dish.isBestSeller && (
          <span className="absolute top-3 right-3 bg-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Best Seller
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className={`font-bold text-ink text-base leading-snug ${lang === 'cn' ? 'cn-text' : ''}`}>
          {name}
        </h3>

        <div className="flex items-end justify-between mt-3 gap-2">
          <div>
            {dish.weight && (
              <p className="text-gray-400 text-xs mb-1">{dish.weight}</p>
            )}
            <p className="font-black text-red text-xl leading-none">{dish.price} {T.currency}</p>
          </div>

          {cartItem ? (
            <div className="flex items-center gap-2 bg-red-light rounded-xl overflow-hidden">
              <button
                onClick={() => updateQuantity(dish.code, cartItem.quantity - 1)}
                className="w-9 h-9 flex items-center justify-center text-red font-black text-lg
                           active:bg-red/10 transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center font-bold text-ink text-sm">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(dish.code, cartItem.quantity + 1)}
                className="w-9 h-9 flex items-center justify-center text-red font-black text-lg
                           active:bg-red/10 transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm
                         transition-all duration-200 active:scale-95
                         ${added
                           ? 'bg-green-500 text-white scale-95'
                           : 'bg-red text-white shadow-[0_2px_12px_rgba(214,40,40,0.3)]'
                         }`}
            >
              {added ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {T.added}
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {T.addToCart}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

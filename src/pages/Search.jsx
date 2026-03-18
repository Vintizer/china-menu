import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMenu, getAllItems } from '../hooks/useMenu.js'
import useT from '../hooks/useT.js'
import Header from '../components/Header.jsx'
import DishCard from '../components/DishCard.jsx'
import CartBar from '../components/CartBar.jsx'

export default function Search() {
  const navigate = useNavigate()
  const { menu, loading } = useMenu()
  const T = useT()
  const [query, setQuery] = useState('')

  const allItems = useMemo(() => getAllItems(menu), [menu])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return allItems.filter(
      (item) =>
        (item.name_ru ?? '').toLowerCase().includes(q) ||
        (item.name_cn ?? '').includes(q) ||
        (item.code ?? '').toLowerCase().includes(q)
    )
  }, [allItems, query])

  return (
    <div className="min-h-dvh bg-warm pb-28">
      <Header title={T.searchTitle} />

      <div className="px-4 pt-3">
        <input
          type="text"
          autoFocus
          placeholder={T.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field text-sm w-full"
        />
      </div>

      <div className="px-4 pt-3 flex flex-col gap-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
          ))
        ) : query.trim() === '' ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">{T.searchHint}</p>
            <p className="text-sm mt-1">{T.searchHintSub}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">{T.notFound}</p>
            <p className="text-sm mt-1">{T.notFoundSub}</p>
          </div>
        ) : (
          results.map((dish, i) => (
            <DishCard
              key={dish.code}
              dish={dish}
              style={{ animationDelay: `${i * 0.04}s` }}
            />
          ))
        )}
      </div>

      <CartBar />
    </div>
  )
}

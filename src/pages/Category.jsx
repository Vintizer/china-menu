import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useMenu, getCategoryById } from '../hooks/useMenu.js'
import useLangStore from '../store/langStore.js'
import useT from '../hooks/useT.js'
import Header from '../components/Header.jsx'
import DishCard from '../components/DishCard.jsx'
import CartBar from '../components/CartBar.jsx'

export default function Category() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { menu, loading } = useMenu()
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const lang = useLangStore(s => s.lang)
  const T = useT()

  const category = getCategoryById(menu, id)

  const note = lang === 'ru' ? category?.note_ru : (category?.note_cn ?? category?.note_ru)

  const filteredItems = (category?.items ?? []).filter(item => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (item.name_ru ?? '').toLowerCase().includes(q) ||
      (item.name_cn ?? '').includes(q)
    )
  })

  const title = category
    ? lang === 'ru' ? category.name_ru : category.name_cn
    : T.loading

  const SearchIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="#D62828" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="#D62828" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  return (
    <div className="min-h-dvh bg-warm pb-28">
      <Header
        title={title}
        rightIcon={SearchIcon}
        onRight={() => setShowSearch(v => !v)}
      />

      {/* Note for category */}
      {note && (
        <div className="mx-4 mt-3 px-4 py-2.5 bg-gold-light rounded-xl border border-gold/30 flex items-center gap-2">
          <span className="text-gold text-lg">ℹ️</span>
          <p className="text-sm text-ink/70">{note}</p>
        </div>
      )}

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 pt-3 animate-fade-up">
          <input
            autoFocus
            type="text"
            placeholder={T.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field text-sm"
          />
        </div>
      )}

      {/* Dish list */}
      <div className="px-4 pt-3 flex flex-col gap-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
          ))
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">{T.notFound}</p>
            <p className="text-sm mt-1">{T.notFoundSub}</p>
          </div>
        ) : (
          filteredItems.map((dish, i) => (
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

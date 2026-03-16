import { useNavigate } from 'react-router-dom'
import useLangStore from '../store/langStore.js'

const CATEGORY_ICONS = {
  G: { icon: '🍱' },
  O: { icon: '⭐' },
  L: { icon: '🥗' },
  J: { icon: '🍗' },
  Z: { icon: '🥩' },
  S: { icon: '🥦' },
  N: { icon: '🐂' },
  T: { icon: '🍜' },
  F: { icon: '🍚' },
}

export default function CategoryCard({ category, style }) {
  const navigate = useNavigate()
  const lang = useLangStore(s => s.lang)
  const { icon } = CATEGORY_ICONS[category.id] ?? { icon: '🍽' }

  const name = lang === 'ru' ? category.name_ru : category.name_cn

  return (
    <button
      onClick={() => navigate(`/category/${category.id}`)}
      className="bg-white rounded-2xl shadow-card p-4 flex flex-col items-center gap-3
                 active:scale-95 transition-all duration-150 animate-scale-in w-full"
      style={style}
    >
      <div className="w-16 h-16 rounded-full bg-red-light flex items-center justify-center text-3xl">
        {icon}
      </div>
      <div className="text-center">
        <p className={`font-bold text-ink text-sm leading-snug ${lang === 'cn' ? 'cn-text' : ''}`}>
          {name}
        </p>
      </div>
    </button>
  )
}

import { useNavigate } from 'react-router-dom'

const CATEGORY_ICONS = {
  G: { icon: '🍱', label: '盖饭' },
  O: { icon: '⭐', label: '特色' },
  L: { icon: '🥗', label: '凉菜' },
  J: { icon: '🍗', label: '鸡肉' },
  Z: { icon: '🥩', label: '猪肉' },
  S: { icon: '🥦', label: '素菜' },
  N: { icon: '🐂', label: '牛肉' },
  T: { icon: '🍜', label: '汤' },
  F: { icon: '🍚', label: '主食' },
}

export default function CategoryCard({ category, style }) {
  const navigate = useNavigate()
  const { icon } = CATEGORY_ICONS[category.id] ?? { icon: '🍽', label: category.name_cn }

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
        <p className="cn-text font-bold text-ink text-sm leading-snug">{category.name_cn}</p>
        <p className="text-gray-500 text-xs mt-0.5 leading-snug">{category.name_ru}</p>
      </div>
    </button>
  )
}

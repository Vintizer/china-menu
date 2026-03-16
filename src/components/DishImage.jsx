import { useState } from 'react'

const PLACEHOLDER_COLORS = {
  G: ['#FFF0E6', '#E88B3A'],
  O: ['#FFF0F0', '#D62828'],
  L: ['#F0F8F0', '#4A9E5C'],
  J: ['#FFF8E6', '#E8A23A'],
  Z: ['#F8F0F8', '#9B5EA0'],
  S: ['#F0F8EE', '#5E9B72'],
  N: ['#FFF0F0', '#C44B35'],
  T: ['#E6F4FF', '#3A7AC8'],
  F: ['#FFF8E6', '#C49A3A'],
}

export default function DishImage({ src, code, alt, className }) {
  const [error, setError] = useState(false)
  const category = code?.[0] ?? 'G'
  const [bg, fg] = PLACEHOLDER_COLORS[category] ?? ['#F7F3E9', '#CFAE67']

  if (!src || error) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ background: bg }}>
        <span style={{ color: fg, fontSize: '2rem' }}>🍽</span>
      </div>
    )
  }

  return (
    <img
      src={`/images/${src}`}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

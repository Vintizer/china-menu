import { useNavigate } from 'react-router-dom'
import LangToggle from './LangToggle.jsx'

export default function Header({ title, subtitle, onBack, rightIcon, onRight, transparent }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <header
      className={`sticky top-0 z-50 flex items-center gap-3 px-4 py-3 ${
        transparent ? 'bg-transparent' : 'bg-warm/95 backdrop-blur-sm border-b border-warm-dark'
      }`}
    >
      <button
        onClick={handleBack}
        className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
        aria-label="Назад"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="#D62828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="flex-1 min-w-0 text-center">
        <h1 className="font-bold text-ink text-base leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-red text-xs cn-text leading-none mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <LangToggle />
        {rightIcon ? (
          <button
            onClick={onRight}
            className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Действие"
          >
            {rightIcon}
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>
    </header>
  )
}

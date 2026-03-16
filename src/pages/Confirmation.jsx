import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Confirmation() {
  const navigate = useNavigate()

  useEffect(() => {
    // Закрыть WebApp через 5 секунд если открыто из Telegram
    const tg = window.Telegram?.WebApp
    if (tg?.close) {
      const timer = setTimeout(() => tg.close(), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div className="min-h-dvh pattern-bg flex flex-col items-center justify-center px-6 text-center">
      {/* Success animation */}
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-full bg-green-50 flex items-center justify-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#22c55e" />
              <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="absolute -top-2 -right-2 text-3xl animate-bounce">🎉</div>
      </div>

      <h1 className="font-black text-ink text-2xl mb-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        Заказ отправлен!
      </h1>
      <p className="text-gray-500 text-sm mb-2 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        Ваш заказ принят и будет доставлен в ближайшее время.
      </p>
      <p className="cn-text text-red text-base font-bold mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        感谢您的订购！
      </p>

      {/* Contact info */}
      <div className="bg-white rounded-2xl shadow-card p-4 w-full mb-6 animate-fade-up" style={{ animationDelay: '0.25s' }}>
        <p className="text-xs text-gray-500 mb-1">Есть вопросы? Звоните:</p>
        <a href="tel:+3752967158" className="font-bold text-red text-lg">+375 29 671 58</a>
        <p className="text-xs text-gray-400 mt-1">или пишите @JIAYUAN6688 в Telegram</p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="btn-primary animate-fade-up"
        style={{ animationDelay: '0.3s' }}
      >
        Вернуться в меню
      </button>
    </div>
  )
}

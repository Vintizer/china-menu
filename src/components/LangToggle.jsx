import useLangStore from '../store/langStore.js'

export default function LangToggle() {
  const { lang, toggleLang } = useLangStore()

  return (
    <button
      onClick={toggleLang}
      className="px-2.5 py-1 rounded-full bg-white shadow-card border border-red/20
                 text-red font-bold text-xs active:scale-90 transition-transform
                 leading-tight flex items-center gap-1"
      aria-label="Переключить язык"
    >
      {lang === 'ru' ? (
        <span className="cn-text">中文</span>
      ) : (
        <span>РУ</span>
      )}
    </button>
  )
}

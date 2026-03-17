import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore.js'
import useT from '../hooks/useT.js'
import Header from '../components/Header.jsx'
import { formatOrderMessage } from '../../shared/orderMessage.js'

async function sendOrderToTelegram(message) {
  const tg = window.Telegram?.WebApp
  const isInsideTelegram = !!tg?.initData
  if (tg?.sendData && isInsideTelegram) {
    tg.sendData(message)
    return { ok: true, via: 'telegram' }
  }

  const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN
  const CHAT_ID = import.meta.env.VITE_ADMIN_CHAT_ID

  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error('No BOT_TOKEN/ADMIN_CHAT_ID configured — order cannot be sent from website')
  }

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) {
    throw new Error(data.description || `Telegram API error: ${res.status}`)
  }
  return { ok: true, via: 'fetch' }
}

export default function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore(s => s.items)
  const clearCart = useCartStore(s => s.clearCart)
  const T = useT()
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user

  const [form, setForm] = useState({
    name: tgUser ? `${tgUser.first_name ?? ''} ${tgUser.last_name ?? ''}`.trim() : '',
    phone: '',
    address: '',
    comment: '',
    payment: 'cash',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigatedToConfirmation = useRef(false)

  const FIELDS = [
    { key: 'name',    label: T.fieldName,    placeholder: T.phName,    icon: '👤', type: 'text', required: true },
    { key: 'phone',   label: T.fieldPhone,   placeholder: T.phPhone,   icon: '📞', type: 'tel',  required: true },
    { key: 'address', label: T.fieldAddress, placeholder: T.phAddress, icon: '🏠', type: 'text', required: true },
    { key: 'comment', label: T.fieldComment, placeholder: T.phComment, icon: '💬', type: 'text', required: false, multiline: true },
  ]

  const validate = () => {
    const errs = {}
    if (!form.name.trim())    errs.name    = T.errName
    if (!form.phone.trim())   errs.phone   = T.errPhone
    if (!form.address.trim()) errs.address = T.errAddress
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const message = formatOrderMessage(form, items)
      const result = await sendOrderToTelegram(message)
      clearCart()
      navigatedToConfirmation.current = true
      const debug = result.via === 'telegram' ? {
        sentVia: 'Telegram sendData()',
        payloadLength: message.length,
        payloadPreview: message.slice(0, 600),
        timestamp: new Date().toISOString(),
        webhookUrl: 'https://china-menu.vercel.app/api/bot',
        userAgent: navigator.userAgent?.slice(0, 80),
      } : null
      navigate('/confirmation', { state: debug ? { debug } : {} })
    } catch (e) {
      console.error(e)
      alert(T.orderError)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    if (!navigatedToConfirmation.current) navigate('/')
    return null
  }

  return (
    <div className="min-h-dvh bg-warm pb-6">
      <Header title={T.checkoutTitle} />

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Order summary */}
        <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-light flex items-center justify-center text-2xl">
            🍽
          </div>
          <div>
            <p className="text-gray-500 text-xs">{T.yourOrder}</p>
            <p className="font-bold text-ink">
              {T.positions(count)}
              {' '}•{' '}
              <span className="text-red">{total} {T.currency}</span>
            </p>
          </div>
        </div>

        {/* Contact info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-red rounded-full" />
            <h2 className="font-bold text-ink text-base">{T.contactInfo}</h2>
          </div>

          <div className="flex flex-col gap-3">
            {FIELDS.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">
                  {field.label}
                  {field.required && <span className="text-red ml-0.5">*</span>}
                </label>
                {field.multiline ? (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => {
                      setForm(f => ({ ...f, [field.key]: e.target.value }))
                      setErrors(e2 => ({ ...e2, [field.key]: '' }))
                    }}
                    className={`input-field resize-none text-sm ${errors[field.key] ? 'border-red ring-2 ring-red/20' : ''}`}
                  />
                ) : (
                  <div className="relative">
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => {
                        setForm(f => ({ ...f, [field.key]: e.target.value }))
                        setErrors(e2 => ({ ...e2, [field.key]: '' }))
                      }}
                      className={`input-field pr-10 text-sm ${errors[field.key] ? 'border-red ring-2 ring-red/20' : ''}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base">{field.icon}</span>
                  </div>
                )}
                {errors[field.key] && (
                  <p className="text-red text-xs mt-1 ml-1">{errors[field.key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-red rounded-full" />
            <h2 className="font-bold text-ink text-base">{T.paymentMethod}</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'cash', label: T.cash, icon: '💵' },
              { id: 'card', label: T.card, icon: '💳' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setForm(f => ({ ...f, payment: opt.id }))}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all
                  ${form.payment === opt.id
                    ? 'border-red bg-red-light text-red'
                    : 'border-warm-dark bg-white text-ink'
                  }`}
              >
                <span className="text-lg">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary mt-2 shadow-[0_4px_24px_rgba(214,40,40,0.4)]"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              {T.sendOrder}
              <span className="ml-auto font-black text-lg">{total} {T.currency}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

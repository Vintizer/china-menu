import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import DishImage from '../components/DishImage.jsx'

function getInitData() {
  return window.Telegram?.WebApp?.initData || ''
}

function adminFetch(path, options = {}) {
  const initData = getInitData()
  const { body, ...rest } = options
  return fetch(`/api/admin${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
      ...options.headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}

export default function Admin() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | denied | ok
  const [denyReason, setDenyReason] = useState('')
  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', dish }
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [promotions, setPromotions] = useState([])
  const [promoModal, setPromoModal] = useState(null) // null | { mode } | { mode, promo }
  const [promoForm, setPromoForm] = useState({})
  const [promoSaving, setPromoSaving] = useState(false)

  useEffect(() => {
    const initData = getInitData()
    console.log('[admin] Admin page load:', { hasInitData: !!initData, initDataLength: initData?.length ?? 0 })
    if (!initData) {
      setStatus('denied')
      setDenyReason('Откройте приложение в Telegram через бота.')
      return
    }

    adminFetch('/check')
      .then(async r => {
        const data = await r.json().catch(() => ({ error: 'Ошибка ответа сервера' }))
        console.log('[admin] Admin /check:', { status: r.status, ok: r.ok, data })
        if (!r.ok || data.error) {
          setStatus('denied')
          setDenyReason(data.error || 'Доступ запрещён')
          return
        }
        setStatus('ok')
        loadData()
      })
      .catch(() => {
        setStatus('denied')
        setDenyReason('Сервер недоступен. Проверьте подключение.')
      })
  }, [])

  const loadData = () => {
    Promise.all([adminFetch('/dishes'), adminFetch('/promotions')])
      .then(async ([dr, pr]) => {
        const d = await dr.json().catch(() => ({}))
        const p = await pr.json().catch(() => ({}))
        if (d.error) {
          setStatus('denied')
          setDenyReason(d.error)
          return
        }
        setCategories(d.categories || [])
        setDishes(d.dishes || [])
        if (!pr.ok) {
          setPromotions([])
          return
        }
        setPromotions(p.promotions || [])
      })
      .catch(() => setDenyReason('Ошибка загрузки'))
  }

  const openAdd = () => {
    const maxByCat = {}
    dishes.forEach(d => {
      const cat = d.category_id
      const num = parseInt(d.code?.replace(/\D/g, '') || '0', 10)
      if (!maxByCat[cat] || num > maxByCat[cat]) maxByCat[cat] = num
    })
    const firstCat = categories[0]
    const nextNum = (maxByCat[firstCat?.id] ?? 0) + 1
    const code = firstCat ? `${firstCat.id}${nextNum}` : ''
    setForm({
      code,
      category_id: firstCat?.id || '',
      name_cn: '',
      name_ru: '',
      weight: '',
      price: '',
      image: '',
      is_best_seller: false,
    })
    setModal({ mode: 'add' })
  }

  const openEdit = (dish) => {
    setForm({
      code: dish.code,
      category_id: dish.category_id,
      name_cn: dish.name_cn,
      name_ru: dish.name_ru,
      weight: dish.weight || '',
      price: dish.price,
      image: dish.image || '',
      is_best_seller: dish.is_best_seller || false,
    })
    setModal({ mode: 'edit', dish })
  }

  const closeModal = () => setModal(null)

  const handleSave = async () => {
    if (modal.mode === 'add') {
      if (!form.code || !form.category_id || !form.name_cn || !form.name_ru || form.price === '') {
        alert('Заполните: код, категорию, название (CN/RU), цену')
        return
      }
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        price: Number(form.price) || 0,
      }
      const url = modal.mode === 'add' ? '/dishes' : `/dishes/${form.code}`
      const method = modal.mode === 'add' ? 'POST' : 'PUT'
      const res = await adminFetch(url, { method, body: (method === 'POST' || method === 'PUT') ? body : undefined })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        alert(data.error || 'Ошибка сохранения')
        return
      }
      closeModal()
      loadData()
    } finally {
      setSaving(false)
    }
  }

  const openPromoAdd = () => {
    setPromoForm({
      title_ru: '',
      title_cn: '',
      description_ru: '',
      description_cn: '',
      terms_ru: '',
      terms_cn: '',
      image: '',
      starts_on: '',
      ends_on: '',
      dish_codes: '',
      cta_category_id: categories[0]?.id || 'O',
      cta_label_ru: '',
      cta_label_cn: '',
      sort_order: '0',
      active: true,
    })
    setPromoModal({ mode: 'add' })
  }

  const openPromoEdit = (promo) => {
    setPromoForm({
      id: promo.id,
      title_ru: promo.title_ru || '',
      title_cn: promo.title_cn || '',
      description_ru: promo.description_ru || '',
      description_cn: promo.description_cn || '',
      terms_ru: promo.terms_ru || '',
      terms_cn: promo.terms_cn || '',
      image: promo.image || '',
      starts_on: promo.starts_on || '',
      ends_on: promo.ends_on || '',
      dish_codes: (promo.dish_codes || []).join(', '),
      cta_category_id: promo.cta_category_id || '',
      cta_label_ru: promo.cta_label_ru || '',
      cta_label_cn: promo.cta_label_cn || '',
      sort_order: String(promo.sort_order ?? 0),
      active: promo.active !== false,
    })
    setPromoModal({ mode: 'edit', promo })
  }

  const closePromoModal = () => setPromoModal(null)

  const savePromo = async () => {
    if (!promoForm.title_ru || !promoForm.description_ru || !promoForm.starts_on || !promoForm.ends_on) {
      alert('Заполните: заголовок RU, описание RU, даты начала и конца')
      return
    }
    setPromoSaving(true)
    try {
      const body = {
        ...promoForm,
        sort_order: Number(promoForm.sort_order) || 0,
        dish_codes: promoForm.dish_codes,
        id: undefined,
      }
      delete body.id
      const url = promoModal.mode === 'add' ? '/promotions' : `/promotions/${promoForm.id}`
      const method = promoModal.mode === 'add' ? 'POST' : 'PUT'
      const res = await adminFetch(url, { method, body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        alert(data.error || 'Ошибка сохранения акции')
        return
      }
      closePromoModal()
      loadData()
    } finally {
      setPromoSaving(false)
    }
  }

  const deletePromo = async (id) => {
    if (!confirm('Удалить акцию?')) return
    try {
      const res = await adminFetch(`/promotions/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        alert(data.error || 'Ошибка удаления')
        return
      }
      loadData()
    } catch {
      alert('Ошибка удаления')
    }
  }

  const handleDelete = async (code) => {
    if (!confirm(`Удалить блюдо ${code}?`)) return
    try {
      const res = await adminFetch(`/dishes/${code}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        alert(data.error || 'Ошибка удаления')
        return
      }
      loadData()
    } catch {
      alert('Ошибка удаления')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-dvh bg-warm flex items-center justify-center">
        <div className="animate-pulse text-ink/60">Проверка доступа...</div>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="min-h-dvh bg-warm pb-6">
        <Header title="Админка" onBack={() => navigate('/')} />
        <div className="px-4 pt-8 text-center">
          <p className="text-4xl mb-4">🔒</p>
          <p className="font-bold text-ink text-lg">{denyReason}</p>
          <p className="text-gray-500 text-sm mt-2">Админка доступна только в Telegram и только администратору.</p>
        </div>
      </div>
    )
  }

  const dishesByCategory = categories.map(cat => ({
    ...cat,
    items: dishes.filter(d => d.category_id === cat.id),
  }))

  return (
    <div className="min-h-dvh bg-warm pb-8">
      <Header title="Админка" onBack={() => navigate('/')} />

      <div className="px-4 pt-4">
        <button onClick={openAdd} className="btn-primary mb-6">
          + Добавить блюдо
        </button>

        <h2 className="font-bold text-ink text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-gold rounded-full" />
          Акции
        </h2>
        <button onClick={openPromoAdd} className="btn-primary mb-4 bg-gradient-to-r from-[#8B0000] to-red border-0">
          + Добавить акцию
        </button>
        <div className="flex flex-col gap-3 mb-8">
          {promotions.length === 0 && (
            <p className="text-gray-500 text-sm">Нет акций (или таблица не создана — npm run seed)</p>
          )}
          {promotions.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-card overflow-hidden flex gap-3 p-3 border border-gold/30"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#8B0000]/10">
                {p.image ? (
                  <img src={`/images/${p.image}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🏮</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink text-sm truncate">{p.title_ru}</p>
                <p className="text-gray-500 text-xs">
                  {String(p.starts_on).slice(0, 10)} — {String(p.ends_on).slice(0, 10)}
                  {!p.active ? ' · выкл' : ''}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => openPromoEdit(p)}
                  className="px-3 py-1.5 rounded-lg bg-red-light text-red text-xs font-bold"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => deletePromo(p.id)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        {dishesByCategory.map(cat => (
          <div key={cat.id} className="mb-6">
            <h2 className="font-bold text-ink text-base mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red rounded-full" />
              {cat.name_ru}
            </h2>
            <div className="flex flex-col gap-3">
              {cat.items.map(dish => (
                <div
                  key={dish.code}
                  className="bg-white rounded-2xl shadow-card overflow-hidden flex gap-3 p-3"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <DishImage
                      src={dish.image}
                      code={dish.code}
                      alt={dish.name_ru}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm truncate">{dish.name_ru}</p>
                    <p className="text-gray-500 text-xs truncate">{dish.name_cn}</p>
                    <p className="text-red font-bold mt-1">{dish.price} ₽</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => openEdit(dish)}
                      className="px-3 py-1.5 rounded-lg bg-red-light text-red text-xs font-bold"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(dish.code)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-ink">
                {modal.mode === 'add' ? 'Новое блюдо' : 'Редактировать'}
              </h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Код</label>
                <input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="G1"
                  className="input-field text-sm w-full"
                  readOnly={modal.mode === 'edit'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Категория</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  className="input-field text-sm w-full"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name_ru}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Название (RU)</label>
                <input
                  value={form.name_ru}
                  onChange={e => setForm(f => ({ ...f, name_ru: e.target.value }))}
                  placeholder="Жареная говядина"
                  className="input-field text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Название (CN)</label>
                <input
                  value={form.name_cn}
                  onChange={e => setForm(f => ({ ...f, name_cn: e.target.value }))}
                  placeholder="孜然牛肉盖饭"
                  className="input-field text-sm w-full cn-text"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Вес</label>
                <input
                  value={form.weight}
                  onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                  placeholder="850г"
                  className="input-field text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Цена</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="22"
                  className="input-field text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Картинка (файл)</label>
                <input
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="22.jpg"
                  className="input-field text-sm w-full"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_best_seller}
                  onChange={e => setForm(f => ({ ...f, is_best_seller: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-medium">Best Seller</span>
              </label>
            </div>
            <div className="p-4 flex gap-2">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-ink">
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary"
              >
                {saving ? '...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {promoModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
          onClick={closePromoModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-ink">
                {promoModal.mode === 'add' ? 'Новая акция' : 'Редактировать акцию'}
              </h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Заголовок (RU) *</label>
                <input
                  value={promoForm.title_ru}
                  onChange={e => setPromoForm(f => ({ ...f, title_ru: e.target.value }))}
                  className="input-field text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Заголовок (CN)</label>
                <input
                  value={promoForm.title_cn}
                  onChange={e => setPromoForm(f => ({ ...f, title_cn: e.target.value }))}
                  className="input-field text-sm w-full cn-text"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Описание (RU) *</label>
                <textarea
                  value={promoForm.description_ru}
                  onChange={e => setPromoForm(f => ({ ...f, description_ru: e.target.value }))}
                  rows={3}
                  className="input-field text-sm w-full resize-y min-h-[4rem]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Описание (CN)</label>
                <textarea
                  value={promoForm.description_cn}
                  onChange={e => setPromoForm(f => ({ ...f, description_cn: e.target.value }))}
                  rows={3}
                  className="input-field text-sm w-full resize-y min-h-[4rem] cn-text"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Условия (RU)</label>
                <textarea
                  value={promoForm.terms_ru}
                  onChange={e => setPromoForm(f => ({ ...f, terms_ru: e.target.value }))}
                  rows={2}
                  className="input-field text-sm w-full resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Условия (CN)</label>
                <textarea
                  value={promoForm.terms_cn}
                  onChange={e => setPromoForm(f => ({ ...f, terms_cn: e.target.value }))}
                  rows={2}
                  className="input-field text-sm w-full resize-y cn-text"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">С *</label>
                  <input
                    type="date"
                    value={String(promoForm.starts_on).slice(0, 10)}
                    onChange={e => setPromoForm(f => ({ ...f, starts_on: e.target.value }))}
                    className="input-field text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">По *</label>
                  <input
                    type="date"
                    value={String(promoForm.ends_on).slice(0, 10)}
                    onChange={e => setPromoForm(f => ({ ...f, ends_on: e.target.value }))}
                    className="input-field text-sm w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Картинка (файл в /images/)</label>
                <input
                  value={promoForm.image}
                  onChange={e => setPromoForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="promo.png"
                  className="input-field text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Коды блюд (участвуют в акции)
                </label>
                <input
                  value={promoForm.dish_codes}
                  onChange={e => setPromoForm(f => ({ ...f, dish_codes: e.target.value }))}
                  placeholder="O1, O2, O3"
                  className="input-field text-sm w-full font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Категория кнопки</label>
                <select
                  value={promoForm.cta_category_id}
                  onChange={e => setPromoForm(f => ({ ...f, cta_category_id: e.target.value }))}
                  className="input-field text-sm w-full"
                >
                  <option value="">—</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name_ru}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Текст кнопки (RU)</label>
                <input
                  value={promoForm.cta_label_ru}
                  onChange={e => setPromoForm(f => ({ ...f, cta_label_ru: e.target.value }))}
                  className="input-field text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Текст кнопки (CN)</label>
                <input
                  value={promoForm.cta_label_cn}
                  onChange={e => setPromoForm(f => ({ ...f, cta_label_cn: e.target.value }))}
                  className="input-field text-sm w-full cn-text"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Порядок</label>
                <input
                  type="number"
                  value={promoForm.sort_order}
                  onChange={e => setPromoForm(f => ({ ...f, sort_order: e.target.value }))}
                  className="input-field text-sm w-full"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={promoForm.active}
                  onChange={e => setPromoForm(f => ({ ...f, active: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-medium">Активна</span>
              </label>
            </div>
            <div className="p-4 flex gap-2">
              <button type="button" onClick={closePromoModal} className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-ink">
                Отмена
              </button>
              <button
                type="button"
                onClick={savePromo}
                disabled={promoSaving}
                className="flex-1 btn-primary"
              >
                {promoSaving ? '...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

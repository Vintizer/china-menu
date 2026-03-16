import { useState, useEffect } from 'react'

let cachedMenu = null

export function useMenu() {
  const [menu, setMenu] = useState(cachedMenu)
  const [loading, setLoading] = useState(!cachedMenu)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cachedMenu) return
    fetch('/menu.json')
      .then(r => r.json())
      .then(data => {
        cachedMenu = data
        setMenu(data)
        setLoading(false)
      })
      .catch(e => {
        setError(e)
        setLoading(false)
      })
  }, [])

  return { menu, loading, error }
}

export function getCategoryById(menu, id) {
  return menu?.categories?.find(c => c.id === id) ?? null
}

export function getAllItems(menu) {
  return menu?.categories?.flatMap(c => c.items.map(i => ({ ...i, categoryId: c.id }))) ?? []
}

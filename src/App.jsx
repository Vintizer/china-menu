import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import useAdminStore from './store/adminStore.js'
import Home from './pages/Home.jsx'
import Category from './pages/Category.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Confirmation from './pages/Confirmation.jsx'
import Search from './pages/Search.jsx'
import Favorites from './pages/Favorites.jsx'
import Orders from './pages/Orders.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData
    console.log('[admin] App mount:', { hasInitData: !!initData })
    if (initData) {
      useAdminStore.getState().check()
    } else {
      useAdminStore.setState({ isAdmin: false, checked: true })
    }
  }, [])

  useEffect(() => {
    const unsub = useAdminStore.subscribe((state) => {
      if (state.checked) {
        console.log('[admin] button visibility:', { isAdmin: state.isAdmin, showButton: !!state.isAdmin })
      }
    })
    return unsub
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/search" element={<Search />} />
      <Route path="/category/:id" element={<Category />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

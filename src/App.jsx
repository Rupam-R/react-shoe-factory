import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Blog from './components/Blog'
import Contact from './components/Contact'
import Tracking from './components/Tracking'
import LoginPage from './pages/LoginPage'
import Category from './pages/Category'
import Dashboard from './pages/Dashboard'
import AddUser from './pages/AddUser'
import { checkFirebaseConnection, app as firebaseApp } from './lib/firebaseClient'

function App() {
  useEffect(() => {
    console.log('[Firebase] App initialized:', !!firebaseApp?.options?.projectId, firebaseApp?.options?.projectId)
    checkFirebaseConnection(5000).then((ok) => {
      if (ok) {
        console.log('%c[Firebase] Realtime Database connected', 'color: green;')
      } else {
        console.warn('%c[Firebase] Realtime Database NOT connected', 'color: orange;')
      }
    })
  }, [])
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/Category" element={<Category />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/add-user" element={<AddUser /> } />
      </Routes>
    </div>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Blog from './components/Blog'
import Contact from './components/Contact'
import Tracking from './components/Tracking'
import LoginPage from './pages/LoginPage'
import Category from './pages/Category'
import Dashboard from './pages/Dashboard'
import AddUser from './pages/AddUser'

function App() {
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

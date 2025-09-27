import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setSticky(true)
      } else {
        setSticky(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className={`header_area sticky-wrapper ${sticky ? 'sticky' : ''}`}>
      <div className="main_menu">
        <nav className="navbar navbar-expand-lg navbar-light main_box">
          <div className="container">
            <Link className="navbar-brand logo_h" to="/">
              <img src="img/logo.png" alt="" />
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation"
            >
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>

            <div className={`collapse navbar-collapse offset ${mobileMenuOpen ? 'show' : ''}`} id="navbarSupportedContent">
              <ul className="nav navbar-nav menu_nav ml-auto">
                <li className="nav-item active">
                  <Link className="nav-link" to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                </li>
                <li className="nav-item submenu dropdown">
                  <Link to="/category" className="nav-link dropdown-toggle" role="button" aria-haspopup="true" aria-expanded="false">
                    Shop
                  </Link>
                  <ul className="dropdown-menu">
                    <li className="nav-item"><Link className="nav-link" to="/category" onClick={() => setMobileMenuOpen(false)}>Shop Category</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/single-product" onClick={() => setMobileMenuOpen(false)}>Product Details</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/checkout" onClick={() => setMobileMenuOpen(false)}>Product Checkout</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/cart" onClick={() => setMobileMenuOpen(false)}>Shopping Cart</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/confirmation" onClick={() => setMobileMenuOpen(false)}>Confirmation</Link></li>
                  </ul>
                </li>
                <li className="nav-item submenu dropdown">
                  <Link to="/blog" className="nav-link dropdown-toggle" role="button" aria-haspopup="true" aria-expanded="false">
                    Blog
                  </Link>
                  <ul className="dropdown-menu">
                    <li className="nav-item"><Link className="nav-link" to="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/single-blog" onClick={() => setMobileMenuOpen(false)}>Blog Details</Link></li>
                  </ul>
                </li>
                <li className="nav-item submenu dropdown">
                  <Link to="/login" className="nav-link dropdown-toggle" role="button" aria-haspopup="true" aria-expanded="false">
                    Pages
                  </Link>
                  <ul className="dropdown-menu">
                    <li className="nav-item"><Link className="nav-link" to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link></li>
                    {/* <li className="nav-item"><Link className="nav-link" to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link></li> */}
                    <li className="nav-item"><Link className="nav-link" to="/tracking" onClick={() => setMobileMenuOpen(false)}>Tracking</Link></li>
                  </ul>
                </li>
                <li className="nav-item"><Link className="nav-link" to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                <li className="nav-item"><a href="#" className="cart"><span className="ti-bag"></span></a></li>
                <li className="nav-item">
                  <button className="search" onClick={() => setSearchOpen(!searchOpen)}>
                    <span className="lnr lnr-magnifier" id="search"></span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
      <div className={`search_input ${searchOpen ? '' : 'd-none'}`} id="search_input_box">
        <div className="container">
          <form className="d-flex justify-content-between">
            <input type="text" className="form-control" id="search_input" placeholder="Search Here" />
            <button type="submit" className="btn"></button>
            <span className="lnr lnr-cross" id="close_search" title="Close Search" onClick={() => setSearchOpen(false)}></span>
          </form>
        </div>
      </div>
    </header>
  )
}

export default Header
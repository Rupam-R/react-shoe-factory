import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './assets/css/main.css'
import './assets/css/header.css'
import './assets/css/banner.css'
import './assets/css/features.css'
import './assets/css/product.css'
import './assets/css/BrandandDeals.css'
import './assets/css/esclusive-deal.css'
import './assets/css/bootstrap.css'
import './assets/css/linearicons.css'
import './assets/css/font-awesome.min.css'
import './assets/css/themify-icons.css'
import './assets/css/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';  

import $ from 'jquery';
// import 'owl.carousel';
import './assets/css/nice-select.css'
import './assets/css/nouislider.min.css'
import './assets/css/ion.rangeSlider.css'
import './assets/css/ion.rangeSlider.skinFlat.css'
import './assets/css/magnific-popup.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@fortawesome/fontawesome-free/js/all.min.js'
// src/main.jsx
// import './assets/scss/main.scss';
// ... other imports
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'


// Add all solid icons to the library
library.add(fas)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

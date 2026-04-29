/**
 * PHOTOMEMORY PRO - REACT DOM RENDERING
 * ---------------------------------------------------------
 * This is the root of the frontend application. 
 * It injects the React tree into the public/index.html file.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css' // Global styles, animations, and Tailwind directives

ReactDOM.createRoot(document.getElementById('root')).render(
  /**
   * React.StrictMode: 
   * Highly recommended for development. It highlights potential 
   * problems in an application and ensures the code is future-proof 
   * for React's Concurrent Mode.
   */
  <React.StrictMode>
    {/* BROWSER ROUTER: 
      Wrapping at the root level allows you to use navigation hooks 
      (useNavigate, useLocation) anywhere in the application.
    */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

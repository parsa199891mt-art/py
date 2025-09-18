// File: src/index.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '../styles.css' // مسیر در صورت قرار گرفتن styles.css در پوشهٔ اصلی (root)

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Element #root پیدا نشد — مطمئن شو index.html شامل <div id="root"></div> است.')
}

createRoot(rootEl).render(<App />)

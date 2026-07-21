// ============================================================
// Electron Renderer Entry — FFCodec Lab Desktop
// ============================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { DesktopApp } from './DesktopApp'
import '@ffcodec/workbench/styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DesktopApp />
  </React.StrictMode>,
)

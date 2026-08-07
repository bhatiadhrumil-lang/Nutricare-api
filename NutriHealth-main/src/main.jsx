import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import { sessionStorage } from '@aws-amplify/core'
import { cognitoUserPoolsTokenProvider } from '@aws-amplify/auth/cognito'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ReportProvider } from './context/ReportContext.jsx'
import outputs from '../../amplify_outputs.json'

// Store auth credentials in sessionStorage instead of localStorage.
// sessionStorage survives page reloads but is automatically erased when the
// browser/tab session ends, so credentials are gone once the browser closes.
cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage)

// Purge any credentials previously persisted to localStorage by older builds,
// so no stale tokens linger after switching storage.
try {
  const legacyAuthKeys = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key && /cognito|amplify/i.test(key)) {
      legacyAuthKeys.push(key)
    }
  }
  legacyAuthKeys.forEach((key) => localStorage.removeItem(key))
} catch {
  // localStorage not available; nothing to clean up
}

Amplify.configure(outputs)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ReportProvider>
        <App />
      </ReportProvider>
    </AuthProvider>
  </StrictMode>,
)

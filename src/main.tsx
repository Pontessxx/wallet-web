import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from '@/App'
import { ThemeProvider } from '@/contexts/ThemeContext'
import '@/styles/global.scss'

createRoot(document.getElementById('root')!).render(
  <>
    <ThemeProvider>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          },
          success: {
            iconTheme: { primary: 'var(--color-success)', secondary: 'var(--color-surface)' },
          },
          error: {
            iconTheme: { primary: 'var(--color-error)', secondary: 'var(--color-surface)' },
          },
        }}
      />
    </ThemeProvider>
  </>
)
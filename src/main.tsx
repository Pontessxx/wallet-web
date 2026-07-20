import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from '@/App';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@/styles/global.scss';
import { VisibilityProvider } from '@/contexts/VisibilityContext';
import { DateFilterProvider } from '@/contexts/DateFilterContext';

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') {
    return;
  }

  const { worker } = await import('@/mocks/browser');

  await worker.start({
    onUnhandledRequest: 'bypass',
  });

}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
      <VisibilityProvider>
        <DateFilterProvider>
          <App />
        </DateFilterProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)',
            },
            success: {
              iconTheme: { primary: 'var(--color-success)', secondary: 'var(--color-surface)' },
            },
            error: {
              iconTheme: { primary: 'var(--color-error)', secondary: 'var(--color-surface)' },
            },
          }}
        />
      </VisibilityProvider>
    </ThemeProvider>
  );
});
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import { AppProviders } from '@/app/providers/AppProvider';
import { NotificationProvider } from '@/shared/components/ui';
import './styles/global.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AppProviders>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { router } from './router';
import './index.css';

import { Toaster } from 'sonner';
import { TaskTracker } from './components/layout/TaskTracker';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <RouterProvider router={router} />
          <TaskTracker />
          <Toaster position="top-right" richColors closeButton />
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

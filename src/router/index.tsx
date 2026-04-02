import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import GeneratePage from '../pages/generate/GeneratePage';
import ConnectAccountsPage from '../pages/connect/ConnectAccountsPage';
import BusinessProfilePage from '../pages/profile/BusinessProfilePage';
import SettingsPage from '../pages/settings/SettingsPage';
import MediaPage from '../pages/media/MediaPage';
import PricingPage from '../pages/settings/PricingPage';
import ReviewButlerPage from '../pages/reviews/ReviewButlerPage';
import MicrositePage from '../pages/settings/MicrositePage';
import EvergreenPage from '../pages/evergreen/EvergreenPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/generate',
        element: <GeneratePage />,
      },
      {
        path: '/profile/setup',
        element: <BusinessProfilePage />,
      },
      {
        path: '/connect',
        element: <ConnectAccountsPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/media',
        element: <MediaPage />,
      },
      {
        path: '/pricing',
        element: <PricingPage />,
      },
      {
        path: '/reviews',
        element: <ReviewButlerPage />,
      },
      {
        path: '/microsite',
        element: <MicrositePage />,
      },
      {
        path: '/evergreen',
        element: <EvergreenPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

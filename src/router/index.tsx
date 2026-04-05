import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifySuccessPage from '../pages/auth/VerifySuccessPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import GeneratePage from '../pages/generate/GeneratePage';
import ConnectAccountsPage from '../pages/connect/ConnectAccountsPage';
import BusinessProfilePage from '../pages/profile/BusinessProfilePage';
import BrandVoicePage from '../pages/profile/BrandVoicePage';
import SettingsPage from '../pages/settings/SettingsPage';
import MediaPage from '../pages/media/MediaPage';
import PricingPage from '../pages/settings/PricingPage';
import ReviewButlerPage from '../pages/reviews/ReviewButlerPage';
import MicrositePage from '../pages/settings/MicrositePage';
import EvergreenPage from '../pages/evergreen/EvergreenPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminTokenAudit from '../pages/admin/AdminTokenAudit';
import AdminUserDirectory from '../pages/admin/AdminUserDirectory';
import CommunityDashboard from '../pages/community/CommunityDashboard';
import CalendarPage from '../pages/calendar/CalendarPage';
import ReferralPage from '../pages/referral/ReferralPage';

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
    path: '/verify-success',
    element: <VerifySuccessPage />,
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
        path: '/calendar',
        element: <CalendarPage />,
      },
      {
        path: '/profile/setup',
        element: <BusinessProfilePage />,
      },
      {
        path: '/profile/brand-voice',
        element: <BrandVoicePage />,
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
        path: '/community',
        element: <CommunityDashboard />,
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
      {
        path: '/admin/dashboard',
        element: <AdminDashboard />,
      },
      {
        path: '/admin/audit',
        element: <AdminTokenAudit />,
      },
      {
        path: '/admin/users',
        element: <AdminUserDirectory />,
      },
      {
        path: '/referral',
        element: <ReferralPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

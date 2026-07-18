import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifySuccessPage from '../pages/auth/VerifySuccessPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
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
import AdminUserManagement from '../pages/admin/AdminUserManagement';
import AdminSystemStats from '../pages/admin/AdminSystemStats';
import AdminFraudManagement from '../pages/admin/AdminFraudManagement';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminBroadcast from '../pages/admin/AdminBroadcast';
import CommunityDashboard from '../pages/community/CommunityDashboard';
import CalendarPage from '../pages/calendar/CalendarPage';
import ReferralPage from '../pages/referral/ReferralPage';
import SupportTickets from '../pages/support/SupportTickets';
import AdminSupportTickets from '../pages/admin/AdminSupportTickets';

import DataDeletionStatusPage from '../pages/auth/DataDeletionStatusPage';

export const router = createBrowserRouter([
  {
    path: '/data-deletion-status/:code',
    element: <DataDeletionStatusPage />,
  },
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
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
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
        path: '/admin/user-management',
        element: <AdminUserManagement />,
      },
      {
        path: '/admin/system-stats',
        element: <AdminSystemStats />,
      },
      {
        path: '/admin/fraud',
        element: <AdminFraudManagement />,
      },
      {
        path: '/admin/payments',
        element: <AdminPayments />,
      },
      {
        path: '/admin/broadcast',
        element: <AdminBroadcast />,
      },
      {
        path: '/admin/support',
        element: <AdminSupportTickets />,
      },
      {
        path: '/support',
        element: <SupportTickets />,
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

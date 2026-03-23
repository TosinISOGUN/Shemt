/**
 * Route Registry - All routes for Shemt
 * 
 * Structure:
 * - / (redirects to /dashboard if authenticated, else /login)
 * - /login - Login page (public)
 * - /signup - Signup page (public)
 * - /forgot-password - Password reset (public)
 * - /dashboard - Protected dashboard layout
 *   - /dashboard/index - Dashboard home
 *   - /dashboard/users - Users management
 *   - /dashboard/analytics - Analytics view
 *   - /dashboard/billing - Billing & payments
 *   - /dashboard/settings - Settings page
 * - /landing - Marketing landing page (public)
 */

import { 
  createRouter, 
  createRootRoute, 
  createRoute,
  Outlet,
  redirect,
  ScrollRestoration
} from '@tanstack/react-router'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

// Import page components
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { UsersPage } from '@/pages/dashboard/UsersPage'
import { AnalyticsPage } from '@/pages/dashboard/AnalyticsPage'
import { BillingPage } from '@/pages/dashboard/BillingPage'
import { SettingsPage } from '@/pages/dashboard/SettingsPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

// Import auth hook for route protection
import { useAuth } from '@/hooks/useAuth'
import { ScrollToTop } from '@/components/ScrollToTop'

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <ScrollRestoration />
      <ScrollToTop />
      <Outlet />
    </>
  ),
})

// Auth routes (public - no protection needed)

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  component: LoginPage,
})

// Signup route
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'signup',
  component: SignupPage,
})

// Forgot password route
const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'forgot-password',
  component: ForgotPasswordPage,
})

// Landing page route (now at root)
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

import { SetupPage } from '@/pages/dashboard/SetupPage'

// Dashboard layout route (protected)
const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  component: DashboardLayout,
})

// Dashboard child routes
const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/',
  component: DashboardPage,
})

const usersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'users',
  component: UsersPage,
})

const analyticsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'analytics',
  component: AnalyticsPage,
})

const setupRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'setup/$projectId',
  component: SetupPage,
})

const billingRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'billing',
  component: BillingPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'settings',
  component: SettingsPage,
})

// Build the route tree
const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  signupRoute,
  forgotPasswordRoute,
  dashboardLayoutRoute.addChildren([
    dashboardIndexRoute,
    usersRoute,
    analyticsRoute,
    setupRoute,
    billingRoute,
    settingsRoute,
  ]),
])

// Create and export router
export const router = createRouter({ routeTree })

// Register types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
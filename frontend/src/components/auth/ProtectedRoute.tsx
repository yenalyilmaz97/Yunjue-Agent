import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/context/useAuthContext'
import AdminLayout from '@/layouts/AdminLayout'
import UserLayout from '@/layouts/UserLayout'
import type { ReactNode } from 'react'
import type { RouteProps } from 'react-router-dom'

// Define route patterns for admin and user areas
const ADMIN_ROUTES = ['/admin', '/dashboards', '/base-ui', '/forms', '/tables', '/icons', '/apex-chart', '/maps', '/dark-', '/small-sidenav', '/hidden-sidenav', '/dark-mode', '/pages-404-alt']
const USER_ROUTES = ['/user', '/podcasts', '/favorites', '/notes', '/questions', '/aphorisms', '/articles', '/profile']

export type RouteType = 'admin' | 'user' | 'shared'

/**
 * Determines the type of route based on the path
 */
export const getRouteType = (path: string): RouteType => {
  if (ADMIN_ROUTES.some(p => path.startsWith(p))) return 'admin'
  if (USER_ROUTES.some(p => path.startsWith(p))) return 'user'
  return 'shared'
}

interface ProtectedRouteProps extends Omit<RouteProps, 'element'> {
  children: ReactNode
  routeType?: RouteType
}

/**
 * ProtectedRoute component that handles authentication and role-based access control.
 * - Redirects unauthenticated users to sign-in
 * - Redirects non-admins trying to access admin routes to user dashboard
 * - Redirects admins trying to access user routes to admin dashboard
 * - Wraps content with appropriate layout (AdminLayout or UserLayout)
 */
export const ProtectedRoute = ({ children, routeType = 'shared' }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthContext()

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />
  }

  const isAdmin = user?.role === 'Admin'

  // Block non-admins from admin routes
  if (routeType === 'admin' && !isAdmin) {
    return <Navigate to="/user/dashboard" replace />
  }

  // Block admins from user-specific routes
  if (routeType === 'user' && isAdmin) {
    return <Navigate to="/dashboards" replace />
  }

  // Wrap with appropriate layout based on user role
  const Layout = isAdmin ? AdminLayout : UserLayout

  return <Layout>{children}</Layout>
}

export default ProtectedRoute

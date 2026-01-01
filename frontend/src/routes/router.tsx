import { Navigate, Route, Routes, type RouteProps } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import UserLayout from '@/layouts/UserLayout'
import AuthLayout from '@/layouts/AuthLayout'
import { appRoutes, authRoutes } from '@/routes/index'
import { useAuthContext } from '@/context/useAuthContext'

const AppRouter = (props: RouteProps) => {
  const { isAuthenticated, user } = useAuthContext()
  
  return (
    <Routes>
      {(authRoutes || []).map((route, idx) => (
        <Route key={idx + route.name} path={route.path} element={<AuthLayout {...props}>{route.element}</AuthLayout>} />
      ))}

      {(appRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            isAuthenticated ? (
              (() => {
                const isAdminRoute = route.path?.toString().startsWith('/admin') || route.path === '/dashboards';
                const isUserAdmin = user?.role === 'Admin';

                if (isAdminRoute) {
                   if (isUserAdmin) {
                     return <AdminLayout {...props}>{route.element}</AdminLayout>;
                   } else {
                     return <Navigate to="/user/dashboard" replace />;
                   }
                } else {
                   // For now, assuming all non-admin routes are user routes or public routes accessible to users
                   // You might want to restrict /user/* routes from Admins if needed, but usually Admins can see User views or have their own.
                   // The existing logic used UserLayout for everything else.
                   return <UserLayout {...props}>{route.element}</UserLayout>;
                }
              })()
            ) : (
              <Navigate
                to={{
                  pathname: '/auth/sign-in',
                  search: 'redirectTo=' + route.path,
                }}
              />
            )
          }
        />
      ))}
    </Routes>
  )
}

export default AppRouter

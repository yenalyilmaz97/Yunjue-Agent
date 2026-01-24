import { Navigate, Route, Routes, type RouteProps } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { appRoutes, authRoutes } from '@/routes/index'
import { useAuthContext } from '@/context/useAuthContext'
import { ProtectedRoute, getRouteType } from '@/components/auth/ProtectedRoute'

const AppRouter = (props: RouteProps) => {
  const { isAuthenticated } = useAuthContext()

  return (
    <Routes>
      {/* Auth routes - accessible without authentication */}
      {(authRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={<AuthLayout {...props}>{route.element}</AuthLayout>}
        />
      ))}

      {/* Protected app routes */}
      {(appRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            isAuthenticated ? (
              <ProtectedRoute routeType={getRouteType(route.path || '')}>
                {route.element}
              </ProtectedRoute>
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

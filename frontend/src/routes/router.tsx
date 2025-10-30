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
              (user?.role === 'Admin' || route.path?.toString().startsWith('/admin') || route.path === '/dashboards') ? (
                <AdminLayout {...props}>{route.element}</AdminLayout>
              ) : (
                <UserLayout {...props}>{route.element}</UserLayout>
              )
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

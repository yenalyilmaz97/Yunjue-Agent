import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import type { UserType } from '@/types/auth'
import { authService } from '@/services'
import type { AuthResponse } from '@/types/keci'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { saveSession } = useAuthContext()
  const [searchParams] = useSearchParams()

  const { showNotification } = useNotificationContext()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const redirectUser = (role?: string) => {
    const redirectLink = searchParams.get('redirectTo')
    if (redirectLink) {
      navigate(redirectLink)
    } else if (role === 'Admin') {
      navigate('/dashboards')
    } else {
      navigate('/user/dashboard')
    }
  }

  const login = handleSubmit(async (values: LoginFormFields) => {
    try {
      setLoading(true)
      const res: AuthResponse = await authService.login({ email: values.email, password: values.password })
      if (res.success && res.token && res.user) {
        const isAdmin = (res.roles || []).some((r) => ['admin', 'superadmin'].includes(r.toLowerCase()))
        const sessionUser: UserType = {
          id: String(res.user.userId),
          username: res.user.userName,
          email: res.user.email,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          role: isAdmin ? 'Admin' : 'User',
          token: res.token,
          password: '',
        }
        saveSession(sessionUser)
        redirectUser(sessionUser.role)
        showNotification({ message: 'Successfully logged in. Redirecting....', variant: 'success' })
        return
      }
      showNotification({ message: res.message || 'Login failed', variant: 'danger' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Login failed'
      showNotification({ message: msg, variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  return { loading, login, control }
}

export default useSignIn

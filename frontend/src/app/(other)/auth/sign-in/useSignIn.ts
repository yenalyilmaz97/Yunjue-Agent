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
    rememberMe: yup.boolean().default(false),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
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
          isActive: true, // Validate via token claims instead
        }
        saveSession(sessionUser, values.rememberMe)
        redirectUser(sessionUser.role)
        showNotification({ message: 'Successfully logged in. Redirecting....', variant: 'success' })
        return
      }
      // Check if login failed due to wrong password
      const errorMessage = res.message || ''
      const isPasswordError =
        !res.success &&
        (errorMessage.toLowerCase().includes('password') ||
          errorMessage.toLowerCase().includes('şifre') ||
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('yanlış') ||
          errorMessage.toLowerCase().includes('wrong'))

      const displayMessage = isPasswordError
        ? 'Geçersiz bilgi. Lütfen tekrar deneyin.'
        : (errorMessage || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')

      showNotification({ message: displayMessage, variant: 'danger' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const status = e?.response?.status
      // Try multiple ways to get error message
      const errorMessage =
        e?.response?.data?.message ||
        e?.response?.data?.Message ||
        e?.response?.data?.error ||
        e?.message ||
        ''

      console.log('Login error:', { status, errorMessage, error: e })

      // Check for 401 Unauthorized or password-related errors
      const isPasswordError =
        status === 401 ||
        errorMessage.toLowerCase().includes('password') ||
        errorMessage.toLowerCase().includes('şifre') ||
        errorMessage.toLowerCase().includes('geçersiz') ||
        errorMessage.toLowerCase().includes('invalid credentials') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('yanlış') ||
        errorMessage.toLowerCase().includes('wrong')

      const displayMessage = isPasswordError
        ? 'Geçersiz bilgi. Lütfen tekrar deneyin.'
        : (errorMessage || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')

      showNotification({ message: displayMessage, variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  return { loading, login, control }
}

export default useSignIn

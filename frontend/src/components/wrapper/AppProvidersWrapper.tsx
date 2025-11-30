import { AuthProvider } from '@/context/useAuthContext'
import { LayoutProvider } from '@/context/useLayoutContext'
import { NotificationProvider } from '@/context/useNotificationContext'
import { ChildrenType } from '@/types/component-props'
import { HelmetProvider } from 'react-helmet-async'
import { I18nProvider } from '@/i18n/context'

import { ToastContainer } from 'react-toastify'

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  return (
    <>
      <HelmetProvider>
        <I18nProvider>
          <AuthProvider>
            <LayoutProvider>
              <NotificationProvider>
                {children}
                <ToastContainer theme="colored" />
              </NotificationProvider>
            </LayoutProvider>
          </AuthProvider>
        </I18nProvider>
      </HelmetProvider>
    </>
  )
}
export default AppProvidersWrapper

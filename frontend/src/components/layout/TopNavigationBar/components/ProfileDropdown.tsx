import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useAuthContext } from '@/context/useAuthContext'
import { useLayoutContext } from '@/context/useLayoutContext'
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { userService } from '@/services'
import type { User } from '@/types/keci'
import { Icon } from '@iconify/react'
import { useI18n } from '@/i18n/context'

const ProfileDropdown = () => {
  const { removeSession, user: authUser } = useAuthContext()
  const { theme, changeTheme } = useLayoutContext()
  const { t } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const isDark = theme === 'dark'

  useEffect(() => {
    const loadUser = async () => {
      if (!authUser?.id) return
      try {
        const userId = parseInt(authUser.id)
        const userData = await userService.getUserById(userId)
        setUser(userData)
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }
    loadUser()
  }, [authUser])

  return (
    <Dropdown className=" topbar-item">
      <DropdownToggle
        type="button"
        className="topbar-button content-none"
        id="page-header-user-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <span className="d-flex align-items-center">
          {user?.profilePictureUrl ? (
            <img
              className="rounded-circle"
              width={32}
              height={32}
              src={user.profilePictureUrl}
              alt={user.userName || 'User'}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
            >
              <Icon icon="mingcute:user-line" style={{ fontSize: '1.25rem' }} />
            </div>
          )}
        </span>
      </DropdownToggle>
      <DropdownMenu className=" dropdown-menu-end">
        <DropdownHeader>
          {user ? `${user.firstName} ${user.lastName}` : t('profile.welcome')}
        </DropdownHeader>
        <DropdownItem as={Link} to="/profile">
          <IconifyIcon icon="solar:user-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle">{t('profile.myAccount')}</span>
        </DropdownItem>
        <DropdownItem 
          onClick={() => changeTheme(isDark ? 'light' : 'dark')}
          style={{ cursor: 'pointer' }}
        >
          {isDark ? (
            <IconifyIcon icon="ri:sun-line" className="align-middle me-2 fs-18" />
          ) : (
            <IconifyIcon icon="ri:moon-line" className="align-middle me-2 fs-18" />
          )}
          <span className="align-middle">{isDark ? t('profile.lightMode') : t('profile.darkMode')}</span>
        </DropdownItem>
        {/* <DropdownItem href="">
          <IconifyIcon icon="solar:wallet-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle">{t('profile.pricing')}</span>
        </DropdownItem>
        <DropdownItem href="">
          <IconifyIcon icon="solar:help-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle">{t('profile.help')}</span>
        </DropdownItem>
        <DropdownItem href="/auth/lock-screen">
          <IconifyIcon icon="solar:lock-keyhole-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle">{t('profile.lockScreen')}</span>
        </DropdownItem> */}
        <div className="dropdown-divider my-1" />
        <DropdownItem as={Link} className=" text-danger" to="/auth/sign-in">
          <IconifyIcon icon="solar:logout-3-outline" className="align-middle me-2 fs-18" />
          <span className="align-middle" onClick={removeSession}>
            {t('profile.logout')}
          </span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown

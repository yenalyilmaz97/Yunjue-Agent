import { getMenuItems, getUserMenuItems } from '@/helpers/Manu'
import { useAuthContext } from '@/context/useAuthContext'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { Link, useLocation } from 'react-router-dom'
import { MenuItemType } from '@/types/menu'
import clsx from 'clsx'
import useViewPort from '@/hooks/useViewPort'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useI18n } from '@/i18n/context'

const BottomNavigationBar = () => {
  const { user } = useAuthContext()
  const isAdmin = user?.role === 'Admin'
  const menuItems = isAdmin ? getMenuItems() : getUserMenuItems()
  const { pathname } = useLocation()
  const { width } = useViewPort()
  const { toggleBackdrop } = useLayoutContext()
  const { t } = useI18n()

  // Filter menu items to only show items with icons and URLs (not titles or items with children)
  const getBottomNavItems = (items: MenuItemType[]): MenuItemType[] => {
    const bottomNavItems: MenuItemType[] = []
    
    items.forEach((item) => {
      // Only add top-level items with icons and URLs (no children)
      if (!item.isTitle && item.icon && item.url && !item.children) {
        bottomNavItems.push(item)
      }
    })
    
    // Limit to first 5 items for bottom nav
    return bottomNavItems.slice(0, 5)
  }

  const bottomNavItems = getBottomNavItems(menuItems)

  // Only show on mobile (width <= 768px)
  if (width > 768 || bottomNavItems.length === 0) {
    return null
  }

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + '/')
  }

  const handleLinkClick = () => {
    // Close sidebar when a link is clicked on mobile
    const htmlTag = document.getElementsByTagName('html')[0]
    if (htmlTag.classList.contains('sidebar-enable')) {
      toggleBackdrop()
    }
  }

  const getTranslatedLabel = (label: string) => {
    // Map specific labels to translation keys (same as sidebar)
    const labelMap: Record<string, string> = {
      'dashboard': 'sidebar.dashboard',
      'Articles': 'sidebar.articles',
      'Podcasts': 'sidebar.podcasts',
      'Favorites': 'sidebar.favorites',
      'Notes': 'sidebar.notes',
      'Questions': 'sidebar.questions',
      'Profile': 'sidebar.profile',
    }
    
    const translationKey = labelMap[label] || `sidebar.${label.toLowerCase().replace(/\s+/g, '').replace(/\.\.\./g, '')}`
    const translated = t(translationKey as any)
    return translated !== translationKey ? translated : label
  }

  return (
    <div className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-container">
        {bottomNavItems.map((item) => (
          <Link
            key={item.key}
            to={item.url ?? ''}
            className={clsx('mobile-bottom-nav-item', { active: isActive(item.url ?? '') })}
            onClick={handleLinkClick}
          >
            <IconifyIcon icon={item.icon || 'mingcute:home-3-line'} width={24} height={24} />
            <span className="mobile-bottom-nav-label">{getTranslatedLabel(item.label || '')}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BottomNavigationBar


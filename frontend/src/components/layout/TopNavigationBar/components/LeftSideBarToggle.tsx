import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useLayoutContext } from '@/context/useLayoutContext'
import useViewPort from '@/hooks/useViewPort'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const LeftSideBarToggle = () => {
  const {
    menu: { size },
    changeMenu: { size: changeMenuSize },
    toggleBackdrop,
  } = useLayoutContext()
  const { pathname } = useLocation()
  const { width } = useViewPort()
  const isFirstRender = useRef(true)
  const previousWidth = useRef(width)

  const handleMenuSize = () => {
    // On mobile (width <= 768px), toggle sidebar open/close
    if (width <= 768) {
      toggleBackdrop()
    } else {
      // On desktop/tablet, toggle between condensed and default
      if (size === 'condensed') {
        changeMenuSize('default')
      } else {
        changeMenuSize('condensed')
      }
    }
  }

  // Handle responsive sidebar size changes - only when width changes
  useEffect(() => {
    const widthChanged = previousWidth.current !== width
    const isMobile = width <= 768
    const isTablet = width > 768 && width <= 1140
    const isDesktop = width > 1140

    // Only adjust on first render or when width changes
    if (isFirstRender.current || widthChanged) {
      if (isMobile) {
        // On mobile, always set to 'hidden'
        if (size !== 'hidden') {
          changeMenuSize('hidden')
        }
        // Close sidebar on mobile when width changes
        const htmlTag = document.getElementsByTagName('html')[0]
        if (htmlTag.classList.contains('sidebar-enable')) {
          htmlTag.classList.remove('sidebar-enable')
        }
      } else if (isTablet) {
        // On tablet, set to condensed if currently default or hidden
        // Don't change if user has manually set it to condensed
        if (size === 'default' || size === 'hidden') {
          changeMenuSize('condensed')
        }
      } else if (isDesktop) {
        // On desktop, set to default if currently hidden
        // But preserve user's manual condensed/default choice
        if (size === 'hidden') {
          changeMenuSize('default')
        }
      }
      
      previousWidth.current = width
    }

    if (isFirstRender.current) {
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]) // Only depend on width to avoid loops

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (width <= 768) {
      const htmlTag = document.getElementsByTagName('html')[0]
      if (htmlTag.classList.contains('sidebar-enable')) {
        htmlTag.classList.remove('sidebar-enable')
      }
    }
  }, [pathname, width])

  return (
    <div className="topbar-item">
      <button type="button" onClick={handleMenuSize} className="button-toggle-menu topbar-button">
        <IconifyIcon icon="solar:hamburger-menu-outline" width={24} height={24} className="fs-24  align-middle" />
      </button>
    </div>
  )
}

export default LeftSideBarToggle

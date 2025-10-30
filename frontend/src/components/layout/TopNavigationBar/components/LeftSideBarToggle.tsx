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

  const handleMenuSize = () => {
    if (size === 'condensed') changeMenuSize('default')
    else changeMenuSize('condensed')
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    }

    if (width <= 1140) {
      if (size !== 'condensed') changeMenuSize('condensed')
    } else if (size !== 'default') {
      changeMenuSize('default')
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

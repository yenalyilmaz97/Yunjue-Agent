import { getMenuItems, getUserMenuItems } from '@/helpers/Manu'
import { useAuthContext } from '@/context/useAuthContext'
import SimplebarReactClient from '@/components/wrapper/SimplebarReactClient'
import LogoBox from '@/components/wrapper/LogoBox'
import AppMenu from './components/AppMenu'

const page = () => {
  const { user } = useAuthContext()
  const isAdmin = user?.role === 'Admin'
  const menuItems = isAdmin ? getMenuItems() : getUserMenuItems()
  return (
    <div className="app-sidebar">
      <LogoBox />
      <SimplebarReactClient className="scrollbar" data-simplebar>
        <AppMenu menuItems={menuItems} />
      </SimplebarReactClient>
    </div>
  )
}

export default page

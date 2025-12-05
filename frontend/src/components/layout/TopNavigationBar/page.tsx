import LeftSideBarToggle from './components/LeftSideBarToggle'
import ProfileDropdown from './components/ProfileDropdown'
import { Container } from 'react-bootstrap'
import logoDark from '@/assets/images/logo-dark.png'
import logoLight from '@/assets/images/logo-light.png'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/context/useAuthContext'

const page = () => {
  const { user } = useAuthContext()
  const dashboardUrl = user?.role === 'Admin' ? '/dashboards' : '/user/dashboard'
  
  return (
    <header className="app-topbar">
      <div>
        <Container fluid>
          <div className="navbar-header">
            <div className="d-flex align-items-center gap-2 topbar-left">
              <LeftSideBarToggle />
            </div>
            <div className="topbar-center">
              <Link to={dashboardUrl} className="topbar-logo">
                <img src={logoDark} className="topbar-logo-dark" alt="logo" height={36} />
                <img src={logoLight} className="topbar-logo-light" alt="logo" height={36} />
              </Link>
            </div>
            <div className="d-flex align-items-center gap-2 topbar-right">
              <ProfileDropdown />
            </div>
          </div>
        </Container>
      </div>
    </header>
  )
}

export default page

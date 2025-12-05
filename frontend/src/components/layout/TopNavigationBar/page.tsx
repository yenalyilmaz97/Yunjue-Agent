import LeftSideBarToggle from './components/LeftSideBarToggle'
import ProfileDropdown from './components/ProfileDropdown'
import { Container } from 'react-bootstrap'
import Notifications from './components/Notifications'
import logoDark from '@/assets/images/logo-dark.png'
import logoLight from '@/assets/images/logo-light.png'
import { Link } from 'react-router-dom'

const page = () => {
  return (
    <header className="app-topbar">
      <div>
        <Container fluid>
          <div className="navbar-header">
            <div className="d-flex align-items-center gap-2 topbar-left">
              <LeftSideBarToggle />
            </div>
            <div className="topbar-center">
              <Link to="/dashboards" className="topbar-logo">
                <img src={logoDark} className="topbar-logo-dark" alt="logo" height={28} />
                <img src={logoLight} className="topbar-logo-light" alt="logo" height={28} />
              </Link>
            </div>
            <div className="d-flex align-items-center gap-2 topbar-right">
              <Notifications />
              <ProfileDropdown />
            </div>
          </div>
        </Container>
      </div>
    </header>
  )
}

export default page

import logoDark from '@/assets/images/logo-dark.png'
import logoLight from '@/assets/images/logo-light.png'
import logoSm from '@/assets/images/logo-sm.png'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/context/useAuthContext'

const LogoBox = () => {
  const { user } = useAuthContext()
  const dashboardUrl = user?.role === 'Admin' ? '/dashboards' : '/user/dashboard'
  
  return (
    <div className="logo-box">
      <Link to={dashboardUrl} className="logo-dark">
        <img width={28} height={28} src={logoSm} className="logo-sm" alt="logo sm" />
        <img width={136} height={34} src={logoDark} className="logo-lg" alt="logo dark" />
      </Link>
      <Link to={dashboardUrl} className="logo-light">
        <img width={28} height={28} src={logoSm} className="logo-sm" alt="logo sm" />
        <img width={136} height={34} src={logoLight} className="logo-lg" alt="logo light" />
      </Link>
    </div>
  )
}

export default LogoBox

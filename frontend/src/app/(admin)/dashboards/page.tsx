import Footer from '@/components/layout/Footer'
import Cards from './components/Cards'
import Chart from './components/Chart'
import User from './components/User'
import PageTitle from '@/components/PageTitle'
import { useAuthContext } from '@/context/useAuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const page = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is admin, if not redirect to user dashboard
    if (user && user.role !== 'Admin') {
      navigate('/user/dashboard', { replace: true })
    }
  }, [user, navigate])

  // If not admin, don't render admin dashboard
  if (user && user.role !== 'Admin') {
    return null
  }

  return (
    <>
      <PageTitle subName="Darkone" title="Dashboard" />
      <Cards />
      <Chart />
      <User />
      <Footer />
    </>
  )
}

export default page

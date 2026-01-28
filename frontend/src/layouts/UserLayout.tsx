import Footer from '@/components/layout/Footer'
import { ChildrenType } from '@/types/component-props'
import { lazy, Suspense } from 'react'
import { Container } from 'react-bootstrap'

import PopupModal from '@/components/common/PopupModal'

const TopNavigationBar = lazy(() => import('@/components/layout/TopNavigationBar/page'))
const VerticalNavigationBar = lazy(() => import('@/components/layout/VerticalNavigationBar/page'))
const BottomNavigationBar = lazy(() => import('@/components/layout/BottomNavigationBar/page'))

const UserLayout = ({ children }: ChildrenType) => {
  return (
    <div className="wrapper">
      <PopupModal />
      <Suspense>
        <TopNavigationBar />
      </Suspense>
      <VerticalNavigationBar />
      {/* <AnimationStar /> */}
      <div className="page-content">
        <Container fluid>{children}</Container>
        <Footer />
      </div>
      <Suspense>
        <BottomNavigationBar />
      </Suspense>
    </div>
  )
}

export default UserLayout



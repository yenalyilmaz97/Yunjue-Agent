import { notificationsData } from '@/assets/data/topbar'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import SimplebarReactClient from '@/components/wrapper/SimplebarReactClient'
import { NotificationType } from '@/types/data'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

const NotificationItem = ({ from, content, icon }: NotificationType) => {
  return (
    <div className="sidebar-notification-item py-3 border-bottom">
      <div className="d-flex">
        <div className="flex-shrink-0">
          {icon ? (
            <img src={icon} className="img-fluid me-2 avatar-sm rounded-circle" alt="avatar" />
          ) : (
            <div className="avatar-sm me-2">
              <span className="avatar-title bg-soft-info text-info fs-20 rounded-circle">
                {from ? from.charAt(0).toUpperCase() : 'N'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-grow-1">
          {from && <span className="mb-0 fw-semibold d-block">{from}</span>}
          <span className="mb-0 text-wrap d-block">{content}</span>
        </div>
      </div>
    </div>
  )
}

const SidebarNotifications = () => {
  const notificationList = notificationsData
  const notificationCount = notificationList.length
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="sidebar-notifications">
      <div 
        className={clsx('sidebar-notifications-toggle', { active: isOpen })}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <span className="nav-icon">
          <IconifyIcon icon="solar:bell-bing-outline" width={18} height={18} />
        </span>
        <span className="nav-text">Notifications</span>
        {notificationCount > 0 && (
          <span className="badge badge-pill bg-danger ms-auto">{notificationCount}</span>
        )}
      </div>
      {isOpen && (
        <div className="sidebar-notifications-content">
          <div className="sidebar-notifications-header p-3 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="m-0 fs-16 fw-semibold">Notifications ({notificationCount})</h6>
              <Link to="" className="text-dark text-decoration-underline small">
                Clear All
              </Link>
            </div>
          </div>
          <SimplebarReactClient style={{ maxHeight: '400px' }}>
            {notificationList.map((notification, idx) => (
              <NotificationItem key={idx} {...notification} />
            ))}
          </SimplebarReactClient>
        </div>
      )}
    </div>
  )
}

export default SidebarNotifications


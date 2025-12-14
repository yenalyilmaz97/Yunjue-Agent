import { Modal, ProgressBar, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useI18n } from '@/i18n/context'

interface UploadProgressModalProps {
  show: boolean
  progress: number
  onHide?: () => void
}

const UploadProgressModal = ({ show, progress, onHide }: UploadProgressModalProps) => {
  const { t } = useI18n()

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
      size="sm"
      style={{ zIndex: 9999 }}
    >
      <Modal.Body className="text-center p-4">
        <div className="mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
            }}
          >
            <Icon icon="mingcute:upload-line" style={{ fontSize: '2rem', color: 'var(--bs-primary)' }} />
          </div>
          <h5 className="mb-2">{t('common.uploading')}</h5>
          <p className="text-muted small mb-3">
            {t('common.uploading')}... Lütfen sekmeyi kapatmayınız
          </p>
        </div>
        <div className="mb-2">
          <ProgressBar
            now={progress}
            label={`${progress}%`}
            variant="primary"
            striped
            animated
            style={{ height: '24px', fontSize: '0.875rem' }}
          />
        </div>
        <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="text-muted small">{progress}%</span>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default UploadProgressModal


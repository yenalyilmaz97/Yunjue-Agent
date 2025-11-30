import { Card, CardBody, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useState } from 'react'

interface PDFViewerProps {
  pdfUrl: string
  title?: string
  onClose?: () => void
}

const PDFViewer = ({ pdfUrl, title, onClose }: PDFViewerProps) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setLoading(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }


  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-0">
        <div className="position-relative" style={{ minHeight: '700px', maxHeight: '90vh' }}>
          {loading && (
            <div
              className="position-absolute top-50 start-50 translate-middle"
              style={{ zIndex: 1 }}
            >
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Yükleniyor...</span>
                </div>
                <p className="mt-2 text-muted small">PDF yükleniyor...</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="d-flex flex-column align-items-center justify-content-center p-5" style={{ minHeight: '700px' }}>
              <Icon icon="mingcute:file-pdf-line" style={{ fontSize: '4rem', opacity: 0.3 }} className="text-danger mb-3" />
              <p className="text-muted mb-3">PDF yüklenemedi</p>
            </div>
          ) : (
            <>
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-100 h-100 border-0"
                style={{ minHeight: '700px', maxHeight: '90vh' }}
                onLoad={handleLoad}
                onError={handleError}
                title={title || 'PDF Viewer'}
              />
              {onClose && (
                <div className="position-absolute top-0 end-0 p-2" style={{ zIndex: 10 }}>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={onClose}
                    className="shadow-sm"
                    title="Kapat"
                  >
                    <Icon icon="mingcute:close-line" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default PDFViewer


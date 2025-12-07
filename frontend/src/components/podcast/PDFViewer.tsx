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
    <Card 
      className="border-0 shadow-sm overflow-hidden"
      style={{ 
        borderRadius: '16px',
        background: 'var(--bs-body-bg)'
      }}
    >
      {/* Header */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{
          background: 'linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.9) 0%, rgba(var(--bs-primary-rgb), 0.8) 100%)',
          color: 'white',
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Icon icon="mingcute:file-pdf-line" style={{ fontSize: '1.1rem' }} />
          </div>
          <div>
            <div className="fw-semibold" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>
              {title || 'PDF Dökümanı'}
            </div>
          </div>
        </div>
        <div className="d-flex gap-1">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-link p-2 text-white text-decoration-none"
            title="Yeni Sekmede Aç"
            style={{ borderRadius: '8px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Icon icon="mingcute:external-link-line" style={{ fontSize: '1.1rem' }} />
          </a>
          {onClose && (
            <button
              className="btn btn-link p-2 text-white"
              onClick={onClose}
              title="Kapat"
              style={{ textDecoration: 'none', borderRadius: '8px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Icon icon="mingcute:close-line" style={{ fontSize: '1.1rem' }} />
            </button>
          )}
        </div>
      </div>

      <CardBody className="p-0">
        <div 
          className="position-relative" 
          style={{ 
            minHeight: '500px', 
            maxHeight: '80vh',
            backgroundColor: 'rgba(var(--bs-primary-rgb), 0.02)'
          }}
        >
          {loading && (
            <div
              className="position-absolute top-50 start-50 translate-middle"
              style={{ zIndex: 1 }}
            >
              <div className="text-center">
                <div 
                  className="spinner-border" 
                  role="status"
                  style={{ color: 'var(--bs-primary)', width: '2.5rem', height: '2.5rem' }}
                >
                  <span className="visually-hidden">Yükleniyor...</span>
                </div>
                <p className="mt-2 text-muted small">PDF yükleniyor...</p>
              </div>
            </div>
          )}

          {error ? (
            <div 
              className="d-flex flex-column align-items-center justify-content-center p-5" 
              style={{ minHeight: '500px' }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'rgba(var(--bs-danger-rgb), 0.1)',
                }}
              >
                <Icon 
                  icon="mingcute:file-pdf-line" 
                  style={{ fontSize: '2.5rem', color: 'var(--bs-danger)' }} 
                />
              </div>
              <p className="text-muted mb-3">PDF yüklenemedi</p>
              <Button
                variant="outline-primary"
                size="sm"
                as="a"
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="d-flex align-items-center gap-2"
                style={{ borderRadius: '8px' }}
              >
                <Icon icon="mingcute:external-link-line" />
                Yeni Sekmede Aç
              </Button>
            </div>
          ) : (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-100 h-100 border-0"
              style={{ minHeight: '500px', maxHeight: '80vh' }}
              onLoad={handleLoad}
              onError={handleError}
              title={title || 'PDF Viewer'}
            />
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default PDFViewer

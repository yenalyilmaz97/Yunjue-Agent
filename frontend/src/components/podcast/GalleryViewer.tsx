import { Card, CardBody, Button, Row, Col } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useState } from 'react'

interface GalleryViewerProps {
  images: string[]
  title?: string
  onClose?: () => void
}

const GalleryViewer = ({ images, title, onClose }: GalleryViewerProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel')

  const currentImage = images[selectedIndex]

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index)
    setViewMode('carousel')
  }

  if (images.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardBody className="text-center py-5">
          <Icon icon="mingcute:image-line" style={{ fontSize: '4rem', opacity: 0.3 }} className="text-muted mb-3" />
          <p className="text-muted mb-0">Görsel bulunamadı</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-0">
        {/* Header Controls */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light">
          <div className="d-flex align-items-center gap-2">
            <Icon icon="mingcute:image-line" className="text-primary" />
            <div>
              <div className="fw-semibold">{title || 'Galeri'}</div>
              <div className="text-muted small">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'carousel' : 'grid')}
              title={viewMode === 'grid' ? 'Carousel Görünümü' : 'Grid Görünümü'}
            >
              <Icon icon={viewMode === 'grid' ? 'mingcute:view-list-line' : 'mingcute:grid-line'} />
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => window.open(currentImage, '_blank')}
              title="Yeni Sekmede Aç"
            >
              <Icon icon="mingcute:external-link-line" />
            </Button>
            {onClose && (
              <Button variant="outline-secondary" size="sm" onClick={onClose} title="Kapat">
                <Icon icon="mingcute:close-line" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'carousel' ? (
          <div className="position-relative">
            {/* Main Image */}
            <div className="position-relative" style={{ minHeight: '400px', maxHeight: '70vh', backgroundColor: '#f8f9fa' }}>
              <img
                src={currentImage}
                alt={`Görsel ${selectedIndex + 1}`}
                className="w-100 h-100"
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGörsel yüklenemedi%3C/text%3E%3C/svg%3E'
                }}
              />

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="light"
                    className="position-absolute top-50 start-0 translate-middle-y ms-2 shadow"
                    onClick={handlePrevious}
                    style={{ zIndex: 10 }}
                    size="lg"
                  >
                    <Icon icon="mingcute:arrow-left-line" />
                  </Button>
                  <Button
                    variant="light"
                    className="position-absolute top-50 end-0 translate-middle-y me-2 shadow"
                    onClick={handleNext}
                    style={{ zIndex: 10 }}
                    size="lg"
                  >
                    <Icon icon="mingcute:arrow-right-line" />
                  </Button>
                </>
              )}

              {/* Keyboard Navigation */}
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ zIndex: 5 }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') handlePrevious()
                  if (e.key === 'ArrowRight') handleNext()
                }}
              />
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="p-3 border-top bg-light" style={{ overflowX: 'auto' }}>
                <div className="d-flex gap-2" style={{ minWidth: 'max-content' }}>
                  {images.map((img, index) => (
                    <button
                      key={index}
                      className={`border rounded p-1 bg-white ${
                        index === selectedIndex ? 'border-primary border-2' : 'border-secondary'
                      }`}
                      onClick={() => handleThumbnailClick(index)}
                      style={{
                        cursor: 'pointer',
                        flexShrink: 0,
                        width: '80px',
                        height: '80px',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3C/svg%3E'
                      }}
                    />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Row className="g-3">
              {images.map((img, index) => (
                <Col xs={6} sm={4} md={3} key={index}>
                  <div
                    className="border rounded overflow-hidden bg-light"
                    style={{ cursor: 'pointer', aspectRatio: '1', transition: 'all 0.2s' }}
                    onClick={() => {
                      setSelectedIndex(index)
                      setViewMode('carousel')
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <img
                      src={img}
                      alt={`Görsel ${index + 1}`}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGörsel%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default GalleryViewer


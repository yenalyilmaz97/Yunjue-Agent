import { Card, CardBody } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useState, useEffect, useRef } from 'react'

interface GalleryViewerProps {
  images: string[]
  title?: string
  onClose?: () => void
}

const GalleryViewer = ({ images, title, onClose }: GalleryViewerProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  const currentImage = images[selectedIndex]

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setImageLoaded(false)
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setImageLoaded(false)
  }

  // Touch swipe handlers
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNext()
    }
    if (isRightSwipe) {
      handlePrevious()
    }
  }

  // Fullscreen modda keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'Escape') {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, selectedIndex, images.length])

  if (images.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <CardBody className="text-center py-5">
          <Icon icon="mingcute:image-line" style={{ fontSize: '3rem', opacity: 0.3 }} className="text-muted mb-3" />
          <p className="text-muted mb-0 small">Görsel bulunamadı</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      {/* Modern Compact Gallery Card */}
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
        <CardBody className="p-0">
          {/* Compact Header */}
          <div 
            className="d-flex align-items-center justify-content-between px-3 py-2"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                <Icon icon="mingcute:image-line" style={{ fontSize: '1.1rem' }} />
              </div>
              <div>
                <div className="fw-semibold" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>
                  {title || 'Galeri'}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  {selectedIndex + 1} / {images.length}
                </div>
              </div>
            </div>
            <div className="d-flex gap-1">
              <button
                className="btn btn-link p-2 text-white"
                onClick={() => setIsFullscreen(true)}
                title="Tam Boy Aç"
                style={{
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Icon icon="mingcute:fullscreen-line" style={{ fontSize: '1.1rem' }} />
              </button>
              {onClose && (
                <button
                  className="btn btn-link p-2 text-white"
                  onClick={onClose}
                  title="Kapat"
                  style={{
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                  }}
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

          {/* Main Image Container - Modern & Compact */}
          <div
            ref={imageRef}
            className="position-relative"
            style={{
              minHeight: '280px',
              maxHeight: '55vh',
              backgroundColor: '#f8f9fa',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Image with fade transition */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
              }}
            >
              <img
                src={currentImage}
                alt={`Görsel ${selectedIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => setIsFullscreen(true)}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGörsel yüklenemedi%3C/text%3E%3C/svg%3E'
                  setImageLoaded(true)
                }}
              />
            </div>

            {/* Loading indicator */}
            {!imageLoaded && (
              <div
                className="position-absolute d-flex align-items-center justify-content-center"
                style={{
                  width: '100%',
                  height: '100%',
                  zIndex: 1,
                }}
              >
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Yükleniyor...</span>
                </div>
              </div>
            )}

            {/* Modern Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle shadow-lg border-0"
                  onClick={handlePrevious}
                  style={{
                    zIndex: 10,
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                  }}
                >
                  <Icon icon="mingcute:arrow-left-line" style={{ fontSize: '1.2rem', color: '#333' }} />
                </button>
                <button
                  className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle shadow-lg border-0"
                  onClick={handleNext}
                  style={{
                    zIndex: 10,
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                  }}
                >
                  <Icon icon="mingcute:arrow-right-line" style={{ fontSize: '1.2rem', color: '#333' }} />
                </button>
              </>
            )}

            {/* Tap to fullscreen hint */}
            <div
              className="position-absolute bottom-2 start-50 translate-middle-x d-none d-md-block"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                zIndex: 5,
                pointerEvents: 'none',
              }}
            >
              <Icon icon="mingcute:fullscreen-line" className="me-1" style={{ fontSize: '0.875rem' }} />
              Tam boy için tıklayın
            </div>
          </div>

          {/* Modern Thumbnail Strip */}
          {images.length > 1 && (
            <div
              className="px-3 py-2"
              style={{
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e9ecef',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div className="d-flex gap-2" style={{ minWidth: 'max-content' }}>
                {images.map((img, index) => (
                  <button
                    key={index}
                    className="border-0 rounded-3 overflow-hidden p-0 bg-white position-relative"
                    onClick={() => {
                      setSelectedIndex(index)
                      setImageLoaded(false)
                    }}
                    style={{
                      cursor: 'pointer',
                      flexShrink: 0,
                      width: '64px',
                      height: '64px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: index === selectedIndex ? 'scale(1.1)' : 'scale(1)',
                      boxShadow:
                        index === selectedIndex
                          ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                          : '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      if (index !== selectedIndex) {
                        e.currentTarget.style.transform = 'scale(1.05)'
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== selectedIndex) {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3C/svg%3E'
                      }}
                    />
                    {/* Active indicator */}
                    {index === selectedIndex && (
                      <div
                        className="position-absolute bottom-0 start-0 end-0"
                        style={{
                          height: '3px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Fullscreen Modal - Modern */}
      {isFullscreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.98)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
          <div
            style={{
              position: 'relative',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'slideIn 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={`Görsel ${selectedIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100vh',
                objectFit: 'contain',
                userSelect: 'none',
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGörsel yüklenemedi%3C/text%3E%3C/svg%3E'
              }}
            />

            {/* Modern Close Button */}
            <button
              className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle border-0 shadow-lg"
              onClick={() => setIsFullscreen(false)}
              style={{
                zIndex: 10000,
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <Icon icon="mingcute:close-line" style={{ fontSize: '1.5rem', color: '#333' }} />
            </button>

            {/* Modern Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle border-0 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevious()
                  }}
                  style={{
                    zIndex: 10000,
                    width: '52px',
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                  }}
                >
                  <Icon icon="mingcute:arrow-left-line" style={{ fontSize: '1.5rem', color: '#333' }} />
                </button>
                <button
                  className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle border-0 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  style={{
                    zIndex: 10000,
                    width: '52px',
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                  }}
                >
                  <Icon icon="mingcute:arrow-right-line" style={{ fontSize: '1.5rem', color: '#333' }} />
                </button>
              </>
            )}

            {/* Modern Image Counter */}
            <div
              className="position-absolute bottom-0 start-50 translate-middle-x mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '25px',
                fontSize: '0.875rem',
                fontWeight: '500',
                zIndex: 10000,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GalleryViewer

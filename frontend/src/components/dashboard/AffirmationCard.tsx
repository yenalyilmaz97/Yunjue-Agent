import { Card, CardBody, Button, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useState, useEffect } from 'react'
import { useAuthContext } from '@/context/useAuthContext'
import { favoritesService } from '@/services'

interface AffirmationCardProps {
  affirmation?: {
    affirmationId: number
    affirmationText: string | null
    order: number
  }
  isInSlider?: boolean
}

const AffirmationCard = ({ affirmation, isInSlider = false }: AffirmationCardProps) => {
  const { user } = useAuthContext()
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [checkingFavorite, setCheckingFavorite] = useState(true)

  useEffect(() => {
    if (affirmation?.affirmationId && user?.id) {
      const userId = parseInt(user.id)
      favoritesService
        .isAffirmationFavorited(userId, affirmation.affirmationId)
        .then((favorited) => {
          setIsFavorited(favorited)
          setCheckingFavorite(false)
        })
        .catch(() => {
          setIsFavorited(false)
          setCheckingFavorite(false)
        })
    } else {
      setCheckingFavorite(false)
    }
  }, [affirmation?.affirmationId, user?.id])

  const handleToggleFavorite = async () => {
    if (!affirmation?.affirmationId || !user?.id || favoriteLoading) return

    setFavoriteLoading(true)
    const userId = parseInt(user.id)

    try {
      if (isFavorited) {
        await favoritesService.removeFavorite({
          userId,
          favoriteType: 3, // Affirmation
          affirmationId: affirmation.affirmationId,
        })
        setIsFavorited(false)
      } else {
        await favoritesService.addFavorite({
          userId,
          favoriteType: 3, // Affirmation
          affirmationId: affirmation.affirmationId,
        })
        setIsFavorited(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setIsFavorited(!isFavorited)
    } finally {
      setFavoriteLoading(false)
    }
  }

  if (!affirmation?.affirmationText) {
    return null
  }

  if (isInSlider) {
    return (
      <div className="d-flex flex-column justify-content-center h-100 text-center text-white">
        <div className="mb-2">
          <i className="bx bxs-heart" style={{ fontSize: '2rem', opacity: 0.7 }}></i>
        </div>
        <h3 className="mb-3 fw-bold" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', whiteSpace: 'pre-line' }}>
          {affirmation.affirmationText?.trimEnd()}
        </h3>
        <div className="mt-2">
          <i className="bx bxs-heart" style={{ fontSize: '2rem', opacity: 0.7 }}></i>
        </div>
        <p className="mt-3 mb-0 small opacity-75">Günlük Olumlama</p>
      </div>
    )
  }

  return (
    <Card className="mb-3 mb-md-0 h-100 position-relative">
      <CardBody className="p-3 p-md-4">
        {/* Favorite Button */}
        <div className="position-absolute" style={{ top: '12px', right: '12px', zIndex: 10 }}>
          <Button
            variant="link"
            className="p-1 p-md-2 border-0 bg-transparent"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading || checkingFavorite}
            aria-label={isFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'scale(1)',
              minWidth: '36px',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (!favoriteLoading && !checkingFavorite) {
                e.currentTarget.style.transform = 'scale(1.15)'
                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'
                e.currentTarget.style.borderRadius = '50%'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            onTouchStart={(e) => {
              if (!favoriteLoading && !checkingFavorite) {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'
                e.currentTarget.style.borderRadius = '50%'
              }
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {favoriteLoading || checkingFavorite ? (
              <Spinner animation="border" size="sm" className="text-primary" />
            ) : (
              <Icon
                icon={isFavorited ? 'mingcute:heart-fill' : 'mingcute:heart-line'}
                style={{
                  fontSize: '1.5rem',
                  color: isFavorited ? '#dc3545' : '#6c757d',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: isFavorited ? 'drop-shadow(0 2px 4px rgba(220, 53, 69, 0.3))' : 'none',
                }}
              />
            )}
          </Button>
        </div>

        <div className="d-flex align-items-start mb-3">
          <i className="bx bxs-heart text-danger" style={{ fontSize: '1.5rem' }}></i>
        </div>
        <h5 className="fw-bold" style={{ whiteSpace: 'pre-line' }}>{affirmation.affirmationText?.trimEnd()}</h5>
        <div className="d-flex justify-content-end">
          <i className="bx bxs-heart text-danger" style={{ fontSize: '1.5rem' }}></i>
        </div>
        <p className="text-muted small mb-0">Günlük Olumlama</p>
      </CardBody>
    </Card>
  )
}

export default AffirmationCard


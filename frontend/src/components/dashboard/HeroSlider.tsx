import { Carousel, CarouselItem, Button, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import type { DailyContentResponseDTO } from '@/services/dailyContent'
import { dailyContentService, favoritesService } from '@/services'
import { useAuthContext } from '@/context/useAuthContext'
import AphorismCard from './AphorismCard'
import AffirmationCard from './AffirmationCard'

const HeroSlider = () => {
  const { user } = useAuthContext()
  const [dailyContent, setDailyContent] = useState<DailyContentResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [aphorismFavorited, setAphorismFavorited] = useState(false)
  const [affirmationFavorited, setAffirmationFavorited] = useState(false)
  const [aphorismLoading, setAphorismLoading] = useState(false)
  const [affirmationLoading, setAffirmationLoading] = useState(false)
  const [checkingAphorism, setCheckingAphorism] = useState(true)
  const [checkingAffirmation, setCheckingAffirmation] = useState(true)

  useEffect(() => {
    if (user?.id) {
      const userId = parseInt(user.id)
      dailyContentService
        .getDailyContentByUser(userId)
        .then((data) => {
          setDailyContent(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [user])

  // Check favorite status for aphorism
  useEffect(() => {
    if (dailyContent?.aphorism?.aphorismId && user?.id) {
      const userId = parseInt(user.id)
      favoritesService
        .isAphorismFavorited(userId, dailyContent.aphorism.aphorismId)
        .then((favorited) => {
          setAphorismFavorited(favorited)
          setCheckingAphorism(false)
        })
        .catch(() => {
          setAphorismFavorited(false)
          setCheckingAphorism(false)
        })
    } else {
      setCheckingAphorism(false)
    }
  }, [dailyContent?.aphorism?.aphorismId, user?.id])

  // Check favorite status for affirmation
  useEffect(() => {
    if (dailyContent?.affirmation?.affirmationId && user?.id) {
      const userId = parseInt(user.id)
      favoritesService
        .isAffirmationFavorited(userId, dailyContent.affirmation.affirmationId)
        .then((favorited) => {
          setAffirmationFavorited(favorited)
          setCheckingAffirmation(false)
        })
        .catch(() => {
          setAffirmationFavorited(false)
          setCheckingAffirmation(false)
        })
    } else {
      setCheckingAffirmation(false)
    }
  }, [dailyContent?.affirmation?.affirmationId, user?.id])

  const handleToggleAphorismFavorite = async () => {
    if (!dailyContent?.aphorism?.aphorismId || !user?.id || aphorismLoading) return

    setAphorismLoading(true)
    const userId = parseInt(user.id)

    try {
      if (aphorismFavorited) {
        await favoritesService.removeFavorite({
          userId,
          favoriteType: 4, // Aphorism
          aphorismId: dailyContent.aphorism.aphorismId,
        })
        setAphorismFavorited(false)
      } else {
        await favoritesService.addFavorite({
          userId,
          favoriteType: 4, // Aphorism
          aphorismId: dailyContent.aphorism.aphorismId,
        })
        setAphorismFavorited(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setAphorismFavorited(!aphorismFavorited)
    } finally {
      setAphorismLoading(false)
    }
  }

  const handleToggleAffirmationFavorite = async () => {
    if (!dailyContent?.affirmation?.affirmationId || !user?.id || affirmationLoading) return

    setAffirmationLoading(true)
    const userId = parseInt(user.id)

    try {
      if (affirmationFavorited) {
        await favoritesService.removeFavorite({
          userId,
          favoriteType: 3, // Affirmation
          affirmationId: dailyContent.affirmation.affirmationId,
        })
        setAffirmationFavorited(false)
      } else {
        await favoritesService.addFavorite({
          userId,
          favoriteType: 3, // Affirmation
          affirmationId: dailyContent.affirmation.affirmationId,
        })
        setAffirmationFavorited(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setAffirmationFavorited(!affirmationFavorited)
    } finally {
      setAffirmationLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="hero-slider-container mb-4" style={{ minHeight: '300px' }}>
        <div className="d-flex align-items-center justify-content-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!dailyContent) {
    return null
  }

  const hasAphorism = dailyContent.aphorism?.aphorismText
  const hasAffirmation = dailyContent.affirmation?.affirmationText

  // Eğer her ikisi de varsa slider göster, yoksa tek bir card göster
  if (hasAphorism && hasAffirmation) {
    return (
      <div className="hero-slider-container mb-4">
        <Carousel
          indicators={false}
          controls={true}
          interval={10000}
          fade={true}
          className="hero-carousel"
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}>
          <CarouselItem>
            <div className="p-3 p-md-4 position-relative d-flex flex-column" style={{ minHeight: '250px', background: 'var(--bs-gradient-aphorism)' }}>
              <AphorismCard aphorism={dailyContent.aphorism} isInSlider={true} />
              {/* Favorite Button for Aphorism - Bottom Center */}
              <div className="d-flex justify-content-center mt-auto pb-2">
                <Button
                  variant="link"
                  className="p-2 border-0"
                  onClick={handleToggleAphorismFavorite}
                  disabled={aphorismLoading || checkingAphorism}
                  aria-label={aphorismFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'scale(1)',
                    minWidth: '40px',
                    minHeight: '40px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(6px)',
                  }}
                  onMouseEnter={(e) => {
                    if (!aphorismLoading && !checkingAphorism) {
                      e.currentTarget.style.transform = 'scale(1.1)'
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onTouchStart={(e) => {
                    if (!aphorismLoading && !checkingAphorism) {
                      e.currentTarget.style.transform = 'scale(0.95)'
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'
                    }
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {aphorismLoading || checkingAphorism ? (
                    <Spinner animation="border" size="sm" className="text-white" style={{ width: '18px', height: '18px' }} />
                  ) : (
                    <Icon
                      icon={aphorismFavorited ? 'mingcute:heart-fill' : 'mingcute:heart-line'}
                      style={{
                        fontSize: '1.5rem',
                        color: 'white',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: aphorismFavorited ? 'drop-shadow(0 2px 6px rgba(220, 53, 69, 0.6))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                      }}
                    />
                  )}
                </Button>
              </div>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="p-3 p-md-4 position-relative d-flex flex-column" style={{ minHeight: '250px', background: 'var(--bs-gradient-affirmation)' }}>
              <AffirmationCard affirmation={dailyContent.affirmation} isInSlider={true} />
              {/* Favorite Button for Affirmation - Bottom Center */}
              <div className="d-flex justify-content-center mt-auto pt-2">
                <Button
                  variant="link"
                  className="p-2 border-0"
                  onClick={handleToggleAffirmationFavorite}
                  disabled={affirmationLoading || checkingAffirmation}
                  aria-label={affirmationFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'scale(1)',
                    minWidth: '40px',
                    minHeight: '40px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(6px)',
                  }}
                  onMouseEnter={(e) => {
                    if (!affirmationLoading && !checkingAffirmation) {
                      e.currentTarget.style.transform = 'scale(1.1)'
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                  onTouchStart={(e) => {
                    if (!affirmationLoading && !checkingAffirmation) {
                      e.currentTarget.style.transform = 'scale(0.95)'
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'
                    }
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {affirmationLoading || checkingAffirmation ? (
                    <Spinner animation="border" size="sm" className="text-white" style={{ width: '18px', height: '18px' }} />
                  ) : (
                    <Icon
                      icon={affirmationFavorited ? 'mingcute:heart-fill' : 'mingcute:heart-line'}
                      style={{
                        fontSize: '1.5rem',
                        color: 'white',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: affirmationFavorited ? 'drop-shadow(0 2px 6px rgba(220, 53, 69, 0.6))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                      }}
                    />
                  )}
                </Button>
              </div>
            </div>
          </CarouselItem>
        </Carousel>
      </div>
    )
  }

  // Sadece bir tane varsa tek card göster
  if (hasAphorism) {
    return (
      <div className="hero-slider-container mb-4">
        <div className="p-3 p-md-4 position-relative d-flex flex-column" style={{ minHeight: '250px', background: 'var(--bs-gradient-aphorism)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <AphorismCard aphorism={dailyContent.aphorism} isInSlider={true} />
          {/* Favorite Button for Aphorism - Bottom Center */}
          <div className="d-flex justify-content-center mt-auto pt-2">
            <Button
              variant="link"
              className="p-2 border-0"
              onClick={handleToggleAphorismFavorite}
              disabled={aphorismLoading || checkingAphorism}
              aria-label={aphorismFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'scale(1)',
                minWidth: '40px',
                minHeight: '40px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                backdropFilter: 'blur(6px)',
              }}
              onMouseEnter={(e) => {
                if (!aphorismLoading && !checkingAphorism) {
                  e.currentTarget.style.transform = 'scale(1.1)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
              }}
              onTouchStart={(e) => {
                if (!aphorismLoading && !checkingAphorism) {
                  e.currentTarget.style.transform = 'scale(0.95)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'
                }
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {aphorismLoading || checkingAphorism ? (
                <Spinner animation="border" size="sm" className="text-white" style={{ width: '18px', height: '18px' }} />
              ) : (
                <Icon
                  icon={aphorismFavorited ? 'mingcute:heart-fill' : 'mingcute:heart-line'}
                  style={{
                    fontSize: '1.5rem',
                    color: 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: aphorismFavorited ? 'drop-shadow(0 2px 6px rgba(220, 53, 69, 0.6))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                  }}
                />
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (hasAffirmation) {
    return (
      <div className="hero-slider-container mb-4">
        <div className="p-3 p-md-4 position-relative d-flex flex-column" style={{ minHeight: '250px', background: 'var(--bs-gradient-affirmation)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <AffirmationCard affirmation={dailyContent.affirmation} isInSlider={true} />
          {/* Favorite Button for Affirmation - Bottom Center */}
          <div className="d-flex justify-content-center mt-auto pt-2">
            <Button
              variant="link"
              className="p-2 border-0"
              onClick={handleToggleAffirmationFavorite}
              disabled={affirmationLoading || checkingAffirmation}
              aria-label={affirmationFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'scale(1)',
                minWidth: '40px',
                minHeight: '40px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                backdropFilter: 'blur(6px)',
              }}
              onMouseEnter={(e) => {
                if (!affirmationLoading && !checkingAffirmation) {
                  e.currentTarget.style.transform = 'scale(1.1)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
              }}
              onTouchStart={(e) => {
                if (!affirmationLoading && !checkingAffirmation) {
                  e.currentTarget.style.transform = 'scale(0.95)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'
                }
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {affirmationLoading || checkingAffirmation ? (
                <Spinner animation="border" size="sm" className="text-white" style={{ width: '18px', height: '18px' }} />
              ) : (
                <Icon
                  icon={affirmationFavorited ? 'mingcute:heart-fill' : 'mingcute:heart-line'}
                  style={{
                    fontSize: '1.5rem',
                    color: 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: affirmationFavorited ? 'drop-shadow(0 2px 6px rgba(220, 53, 69, 0.6))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                  }}
                />
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default HeroSlider


import { Carousel, CarouselItem } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import type { DailyContentResponseDTO } from '@/services/dailyContent'
import { dailyContentService } from '@/services'
import { useAuthContext } from '@/context/useAuthContext'
import AphorismCard from './AphorismCard'
import AffirmationCard from './AffirmationCard'

const HeroSlider = () => {
  const { user } = useAuthContext()
  const [dailyContent, setDailyContent] = useState<DailyContentResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)

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
          indicators={true}
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
            <div className="p-3 p-md-4" style={{ minHeight: '250px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <AphorismCard aphorism={dailyContent.aphorism} isInSlider={true} />
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="p-3 p-md-4" style={{ minHeight: '250px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <AffirmationCard affirmation={dailyContent.affirmation} isInSlider={true} />
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
        <div className="p-3 p-md-4" style={{ minHeight: '250px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <AphorismCard aphorism={dailyContent.aphorism} isInSlider={true} />
        </div>
      </div>
    )
  }

  if (hasAffirmation) {
    return (
      <div className="hero-slider-container mb-4">
        <div className="p-3 p-md-4" style={{ minHeight: '250px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <AffirmationCard affirmation={dailyContent.affirmation} isInSlider={true} />
        </div>
      </div>
    )
  }

  return null
}

export default HeroSlider


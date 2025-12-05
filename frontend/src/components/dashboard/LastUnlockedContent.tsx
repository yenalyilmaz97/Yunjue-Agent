import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { userSeriesAccessService, podcastService } from '@/services'
import type { UserSeriesAccess, PodcastEpisode } from '@/types/keci'
import { useAuthContext } from '@/context/useAuthContext'
import { useNavigate } from 'react-router-dom'

const LastUnlockedContent = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [lastUnlockedContent, setLastUnlockedContent] = useState<UserSeriesAccess | null>(null)
  const [lastEpisode, setLastEpisode] = useState<PodcastEpisode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLastUnlockedContent = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const userId = parseInt(user.id)
        const accesses = await userSeriesAccessService.getAccessByUserId(userId)
        
        if (accesses && accesses.length > 0) {
          // En son güncelleneni bul (updatedAt'e göre sırala)
          const sorted = [...accesses].sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime()
            const dateB = new Date(b.updatedAt).getTime()
            return dateB - dateA
          })
          
          const lastAccess = sorted[0]
          setLastUnlockedContent(lastAccess)

          // Eğer podcast serisi ise, en son erişilen bölümü bul
          if (lastAccess.seriesId && lastAccess.podcastSeries && lastAccess.currentAccessibleSequence) {
            try {
              const episodes = await podcastService.getEpisodesBySeries(lastAccess.seriesId)
              const episode = episodes.find(
                (ep) => ep.sequenceNumber === lastAccess.currentAccessibleSequence && ep.isActive
              )
              if (episode) {
                setLastEpisode(episode)
              }
            } catch (error) {
              console.error('Error loading episode:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error loading last unlocked content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLastUnlockedContent()
  }, [user])

  if (loading) {
    return (
      <div className="mb-4">
        <Card>
          <CardBody>
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '120px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!lastUnlockedContent) {
    return null
  }

  const handleClick = () => {
    if (lastUnlockedContent?.articleId && lastUnlockedContent.article) {
      // Article için slug varsa slug kullan, yoksa articleId kullan
      const article = lastUnlockedContent.article
      const slug = (article as any).slug || article.articleId.toString()
      navigate(`/articles/${slug}`)
    } else if (lastUnlockedContent?.seriesId && lastUnlockedContent.podcastSeries) {
      // Podcast Series için podcasts sayfasına yönlendir
      // Eğer bölüm bilgisi varsa, state ile bölümü aç
      if (lastEpisode) {
        navigate('/podcasts', {
          state: {
            seriesId: lastUnlockedContent.seriesId,
            episodeId: lastEpisode.episodesId,
          },
        })
      } else {
        navigate('/podcasts', {
          state: {
            seriesId: lastUnlockedContent.seriesId,
          },
        })
      }
    }
  }

  const isArticle = !!lastUnlockedContent.articleId && !!lastUnlockedContent.article
  const isPodcast = !!lastUnlockedContent.seriesId && !!lastUnlockedContent.podcastSeries

  if (!isArticle && !isPodcast) {
    return null
  }

  const title = isArticle
    ? lastUnlockedContent.article?.title || 'Makale'
    : lastUnlockedContent.podcastSeries?.title || 'Podcast Serisi'

  const description = isArticle
    ? (lastUnlockedContent.article as any)?.excerpt || lastUnlockedContent.article?.title || ''
    : lastUnlockedContent.podcastSeries?.description || ''

  // Podcast için bölüm bilgisi
  const episodeInfo = isPodcast && lastEpisode
    ? {
        sequence: lastEpisode.sequenceNumber,
        title: lastEpisode.title,
        fullText: `Bölüm ${lastEpisode.sequenceNumber}: ${lastEpisode.title}`,
      }
    : isPodcast && lastUnlockedContent.currentAccessibleSequence
      ? {
          sequence: lastUnlockedContent.currentAccessibleSequence,
          title: null,
          fullText: `Bölüm ${lastUnlockedContent.currentAccessibleSequence}`,
        }
      : null

  return (
    <div className="mb-4">
      <Card
        className="cursor-pointer"
        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
        onClick={handleClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = ''
        }}>
        <CardHeader className="text-white" style={{ background: 'var(--bs-gradient-card-header)' }}>
          <CardTitle as={'h5'} className="mb-0 d-flex align-items-center">
            <i className="bx bx-lock-open me-2"></i>
            En Son Açılan İçerik
          </CardTitle>
        </CardHeader>
        <CardBody>
          <h6 className="mb-2 fw-bold">{title}</h6>
          {episodeInfo && (
            <div className="mb-2 d-flex align-items-center flex-wrap gap-2">
              <span className="badge bg-info text-dark">Bölüm {episodeInfo.sequence}</span>
              {episodeInfo.title && (
                <span className="fw-semibold text-primary" style={{ fontSize: '0.95rem' }}>
                  {episodeInfo.title}
                </span>
              )}
            </div>
          )}
          {description && (
            <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
              {description.length > 150 ? `${description.substring(0, 150)}...` : description}
            </p>
          )}
          <div className="d-flex align-items-center justify-content-between mt-3">
            <span className="text-muted small">
              <i className="bx bx-time me-1"></i>
              {new Date(lastUnlockedContent.updatedAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="badge bg-primary">
              {isArticle ? 'Makale' : 'Podcast'}
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default LastUnlockedContent


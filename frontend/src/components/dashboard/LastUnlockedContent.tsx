import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { userSeriesAccessService } from '@/services'
import type { UserSeriesAccess } from '@/types/keci'
import { useAuthContext } from '@/context/useAuthContext'
import { useNavigate } from 'react-router-dom'

const LastUnlockedContent = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [lastUnlockedContent, setLastUnlockedContent] = useState<UserSeriesAccess | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      const userId = parseInt(user.id)
      userSeriesAccessService
        .getAccessByUserId(userId)
        .then((accesses) => {
          if (accesses && accesses.length > 0) {
            // En son güncelleneni bul (updatedAt'e göre sırala)
            const sorted = [...accesses].sort((a, b) => {
              const dateA = new Date(a.updatedAt).getTime()
              const dateB = new Date(b.updatedAt).getTime()
              return dateB - dateA
            })
            setLastUnlockedContent(sorted[0])
          }
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
    if (lastUnlockedContent.articleId && lastUnlockedContent.article) {
      // Article için slug varsa slug kullan, yoksa articleId kullan
      const article = lastUnlockedContent.article
      const slug = (article as any).slug || article.articleId.toString()
      navigate(`/articles/${slug}`)
    } else if (lastUnlockedContent.seriesId && lastUnlockedContent.podcastSeries) {
      // Podcast Series için podcasts sayfasına yönlendir
      // Eğer seriesId varsa, ileride detay sayfasına yönlendirilebilir
      navigate('/podcasts')
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
        <CardHeader className="bg-primary text-white">
          <CardTitle as={'h5'} className="mb-0 d-flex align-items-center">
            <i className="bx bx-lock-open me-2"></i>
            En Son Açılan İçerik
          </CardTitle>
        </CardHeader>
        <CardBody>
          <h6 className="mb-2 fw-bold">{title}</h6>
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


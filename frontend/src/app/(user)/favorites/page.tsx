import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/context/useAuthContext'
import { favoritesService } from '@/services'
import type { Favorite } from '@/types/keci'
import { Card, CardBody, Nav, Row, Col, Spinner, Button, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'

type FavoriteCategory = 'all' | 'episode' | 'article' | 'affirmation' | 'aphorism'

interface CategoryInfo {
  key: FavoriteCategory
  label: string
  icon: string
  type?: number
}

const CATEGORIES: CategoryInfo[] = [
  { key: 'all', label: 'Tümü', icon: 'mingcute:star-line', type: undefined },
  { key: 'episode', label: 'İçerikler', icon: 'mingcute:headphone-line', type: 1 },
  { key: 'article', label: 'Makaleler', icon: 'mingcute:book-3-line', type: 2 },
  { key: 'affirmation', label: 'Olumlamalar', icon: 'mingcute:heart-line', type: 3 },
  { key: 'aphorism', label: 'Aforizmalar', icon: 'mingcute:quote-line', type: 4 },
]

const FavoritesPage = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<FavoriteCategory>('all')
  const [allFavorites, setAllFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<number | null>(null)

  // Favorileri yükle
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const userId = parseInt(user.id)
        const favorites = await favoritesService.getFavoritesByUser(userId)
        setAllFavorites(favorites)
      } catch (error) {
        console.error('Error loading favorites:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  // Aktif kategoriye göre favorileri filtrele
  const filteredFavorites = allFavorites.filter((fav) => {
    if (activeCategory === 'all') return true
    const category = CATEGORIES.find((c) => c.key === activeCategory)
    return category && fav.favoriteType === category.type
  })

  // Kategori bilgisi
  const activeCategoryInfo = CATEGORIES.find((c) => c.key === activeCategory) || CATEGORIES[0]

  const handleRemoveFavorite = async (favorite: Favorite) => {
    if (!user?.id || removingId) return

    if (!confirm('Bu favoriyi kaldırmak istediğinize emin misiniz?')) return

    setRemovingId(favorite.favoriteId)
    try {
      const userId = parseInt(user.id)
      await favoritesService.removeFavorite({
        userId,
        favoriteType: favorite.favoriteType || 1,
        episodeId: favorite.episodeId,
        articleId: favorite.articleId,
        affirmationId: favorite.affirmationId,
        aphorismId: favorite.aphorismId,
      })
      // Favoriyi listeden kaldır
      setAllFavorites((prev) => prev.filter((f) => f.favoriteId !== favorite.favoriteId))
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('Favori kaldırılırken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setRemovingId(null)
    }
  }

  const handleFavoriteClick = (favorite: Favorite) => {
    if (favorite.episodeId) {
      // Podcast episode için podcasts sayfasına yönlendir
      navigate('/podcasts', {
        state: {
          episodeId: favorite.episodeId,
        },
      })
    } else if (favorite.articleId) {
      // Article için article detail sayfasına yönlendir
      // Backend slug yoksa articleId'yi slug olarak kabul eder
      navigate(`/articles/${favorite.articleId}`)
    }
    // Affirmation ve Aphorism için yönlendirme yok (sadece metin)
  }

  const getFavoriteTitle = (favorite: Favorite): string => {
    if (favorite.episodeTitle) return favorite.episodeTitle
    if (favorite.articleTitle) return favorite.articleTitle
    if (favorite.affirmationText) return favorite.affirmationText
    if (favorite.aphorismText) return favorite.aphorismText
    return 'Favori'
  }

  const getFavoriteSubtitle = (favorite: Favorite): string | null => {
    if (favorite.seriesTitle) return favorite.seriesTitle
    return null
  }

  const getFavoriteIcon = (favorite: Favorite): string => {
    switch (favorite.favoriteType) {
      case 1:
        return 'mingcute:headphone-line'
      case 2:
        return 'mingcute:book-3-line'
      case 3:
        return 'mingcute:heart-line'
      case 4:
        return 'mingcute:quote-line'
      default:
        return 'mingcute:star-line'
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <>
      <PageTitle subName="KeciApp" title="Favorilerim" />

      <Card>
        <CardBody>
          {/* Desktop - Tab Navigation */}
          <div className="d-none d-md-block mb-4">
            <Nav variant="tabs" activeKey={activeCategory} onSelect={(k) => setActiveCategory(k as FavoriteCategory)}>
              {CATEGORIES.map((category) => {
                const count = category.key === 'all'
                  ? allFavorites.length
                  : allFavorites.filter((f) => f.favoriteType === category.type).length

                return (
                  <Nav.Item key={category.key}>
                    <Nav.Link eventKey={category.key} className="d-flex align-items-center gap-2">
                      <Icon icon={category.icon} style={{ fontSize: '1.1rem' }} />
                      <span>{category.label}</span>
                      {count > 0 && (
                        <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.7rem' }}>
                          {count}
                        </span>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                )
              })}
            </Nav>
          </div>

          {/* Mobile - Dropdown Selection */}
          <div className="d-block d-md-none mb-3">
            <Form.Select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as FavoriteCategory)}
              className="form-select-lg"
            >
              {CATEGORIES.map((category) => {
                const count = category.key === 'all'
                  ? allFavorites.length
                  : allFavorites.filter((f) => f.favoriteType === category.type).length

                return (
                  <option key={category.key} value={category.key}>
                    {category.label} ({count})
                  </option>
                )
              })}
            </Form.Select>
          </div>

          {/* Favoriler Listesi */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="text-primary" />
              <p className="text-muted mt-2 mb-0">Yükleniyor...</p>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-5">
              <Icon icon={activeCategoryInfo.icon} style={{ fontSize: '4rem', opacity: 0.3 }} className="text-muted mb-3" />
              <h6 className="text-muted mb-2">
                {activeCategory === 'all' ? 'Henüz favori eklenmemiş' : `${activeCategoryInfo.label} kategorisinde favori bulunmuyor`}
              </h6>
              <p className="text-muted small mb-0">
                {activeCategory === 'all'
                  ? 'Beğendiğiniz içerikleri favorilere ekleyerek burada görebilirsiniz.'
                  : 'Bu kategoride favori eklemek için ilgili içerik sayfasından favori butonunu kullanın.'}
              </p>
            </div>
          ) : (
            <Row className="g-3">
              {filteredFavorites.map((favorite) => (
                <Col xs={12} sm={6} lg={4} key={favorite.favoriteId}>
                  <Card
                    className="h-100 shadow-sm border"
                    style={{
                      cursor: favorite.episodeId || favorite.articleId ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => (favorite.episodeId || favorite.articleId) && handleFavoriteClick(favorite)}
                    onMouseEnter={(e) => {
                      if (favorite.episodeId || favorite.articleId) {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <CardBody className="p-3">
                      <div className="d-flex align-items-start gap-2 mb-2">
                        <div
                          className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <Icon icon={getFavoriteIcon(favorite)} style={{ fontSize: '1.25rem' }} />
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <h6 className="mb-1 fw-semibold">{getFavoriteTitle(favorite)}</h6>
                          {getFavoriteSubtitle(favorite) && (
                            <p className="text-muted small mb-0 text-truncate">{getFavoriteSubtitle(favorite)}</p>
                          )}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-danger flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFavorite(favorite)
                          }}
                          disabled={removingId === favorite.favoriteId}
                          style={{
                            minWidth: '32px',
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.15)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                          aria-label="Favoriden çıkar"
                        >
                          {removingId === favorite.favoriteId ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <Icon icon="mingcute:heart-fill" style={{ fontSize: '1.25rem' }} />
                          )}
                        </Button>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top flex-wrap gap-2">
                        <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                          {CATEGORIES.find((c) => c.type === favorite.favoriteType)?.label || 'Favori'}
                        </span>
                        <span className="text-muted small d-flex align-items-center">
                          <Icon icon="mingcute:time-line" className="me-1" style={{ fontSize: '0.875rem' }} />
                          <span className="d-none d-sm-inline">{formatDate(favorite.createdAt)}</span>
                          <span className="d-inline d-sm-none">{new Date(favorite.createdAt).toLocaleDateString('tr-TR')}</span>
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </CardBody>
      </Card>
    </>
  )
}

export default FavoritesPage

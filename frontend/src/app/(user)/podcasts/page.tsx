import PageTitle from '@/components/PageTitle'
import { useEffect, useState, useRef } from 'react'
import { useAuthContext } from '@/context/useAuthContext'
import { userSeriesAccessService, podcastService, favoritesService, notesService, questionsService } from '@/services'
import type { PodcastSeries, PodcastEpisode, Question } from '@/types/keci'
import { Card, CardBody, Row, Col, Spinner, Button, Form, Collapse } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useLocation } from 'react-router-dom'
import PDFViewer from '@/components/podcast/PDFViewer'
import GalleryViewer from '@/components/podcast/GalleryViewer'
import ModernAudioPlayer from '@/components/podcast/ModernAudioPlayer'
import VideoPlayer from '@/components/podcast/VideoPlayer'

interface EpisodeWithAccess extends PodcastEpisode {
  lastAccessedAt?: string
}

const PodcastsPage = () => {
  const { user } = useAuthContext()
  const location = useLocation()
  const [seriesList, setSeriesList] = useState<PodcastSeries[]>([])
  const [selectedSeries, setSelectedSeries] = useState<PodcastSeries | null>(null)
  const [episodes, setEpisodes] = useState<EpisodeWithAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [episodesLoading, setEpisodesLoading] = useState(false)
  const [showOtherEpisodes, setShowOtherEpisodes] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [existingQuestion, setExistingQuestion] = useState<Question | null>(null)
  const [noteLoading, setNoteLoading] = useState(false)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [existingNote, setExistingNote] = useState<any>(null)
  const [showNotesAndQuestions, setShowNotesAndQuestions] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)

  // Kullanıcının erişimi olan serileri yükle
  useEffect(() => {
    const loadSeries = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const userId = parseInt(user.id)
        const accesses = await userSeriesAccessService.getAccessByUserId(userId)
        
        // Her erişim için seri bilgisini al
        const seriesPromises = accesses
          .filter((access) => access.seriesId && access.podcastSeries)
          .map(async (access) => {
            if (access.podcastSeries) {
              return access.podcastSeries
            }
            // Eğer podcastSeries yoksa API'den al
            if (access.seriesId) {
              return await podcastService.getSeriesById(access.seriesId)
            }
            return null
          })

        const series = (await Promise.all(seriesPromises)).filter((s): s is PodcastSeries => s !== null)
        
        // En son güncellenen seriye göre sırala
        const sortedSeries = series.sort((a, b) => {
          const accessA = accesses.find((acc) => acc.seriesId === a.seriesId)
          const accessB = accesses.find((acc) => acc.seriesId === b.seriesId)
          if (!accessA || !accessB) return 0
          return new Date(accessB.updatedAt).getTime() - new Date(accessA.updatedAt).getTime()
        })

        setSeriesList(sortedSeries)
        
        // Location state'ten gelen seriesId varsa onu seç, yoksa ilk seriyi seç
        const locationState = location.state as { seriesId?: number; episodeId?: number } | null
        if (locationState?.seriesId) {
          const targetSeries = sortedSeries.find((s) => s.seriesId === locationState.seriesId)
          if (targetSeries) {
            setSelectedSeries(targetSeries)
          } else if (sortedSeries.length > 0) {
            setSelectedSeries(sortedSeries[0])
          }
        } else if (sortedSeries.length > 0) {
          setSelectedSeries(sortedSeries[0])
        }
      } catch (error) {
        console.error('Error loading series:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSeries()
  }, [user])

  // Seçili serinin bölümlerini yükle
  useEffect(() => {
    const loadEpisodes = async () => {
      if (!selectedSeries || !user?.id) return

      setEpisodesLoading(true)
      try {
        const userId = parseInt(user.id)
        const userAccess = await userSeriesAccessService.getUserSeriesAccess(userId, selectedSeries.seriesId)
        const allEpisodes = await podcastService.getEpisodesBySeries(selectedSeries.seriesId)
        
        // Kullanıcının erişimi olan bölümleri filtrele
        const accessibleEpisodes = allEpisodes.filter(
          (ep) => ep.isActive && ep.sequenceNumber <= userAccess.currentAccessibleSequence
        )

        // Her bölüm için erişim zamanını ekle
        // En son erişilen bölüm: sequenceNumber === currentAccessibleSequence olan bölüm
        const episodesWithAccess: EpisodeWithAccess[] = accessibleEpisodes.map((ep) => ({
          ...ep,
          lastAccessedAt: ep.sequenceNumber === userAccess.currentAccessibleSequence ? userAccess.updatedAt : undefined,
        }))

        // En son erişilen bölümü bul (sequenceNumber === currentAccessibleSequence)
        const lastAccessedEpisode = episodesWithAccess.find(
          (ep) => ep.sequenceNumber === userAccess.currentAccessibleSequence
        )
        const otherEpisodes = episodesWithAccess.filter((ep) => !ep.lastAccessedAt)

        // Sıralama: En son erişilen en üstte, diğerleri sequenceNumber'a göre
        const sortedEpisodes: EpisodeWithAccess[] = []
        if (lastAccessedEpisode) {
          sortedEpisodes.push(lastAccessedEpisode)
        }
        sortedEpisodes.push(...otherEpisodes.sort((a, b) => b.sequenceNumber - a.sequenceNumber))

        setEpisodes(sortedEpisodes)
        setShowOtherEpisodes(false)

        // Location state'ten gelen episodeId varsa o bölümü aç (öncelikli)
        const locationState = location.state as { seriesId?: number; episodeId?: number } | null
        if (locationState?.episodeId && selectedSeries.seriesId === locationState.seriesId) {
          const targetEpisode = sortedEpisodes.find((ep) => ep.episodesId === locationState.episodeId)
          if (targetEpisode) {
            // Location state'i temizle
            window.history.replaceState({}, document.title)
            // Episodes yüklendikten sonra player'ı aç
            setTimeout(() => {
              setCurrentEpisode(targetEpisode)
              // Player'a scroll et
              setTimeout(() => {
                playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 100)
            }, 100)
            setEpisodesLoading(false)
            return // Location state varsa son kaldığı bölümü açma
          }
        }

        // Son kaldığı bölümü otomatik seç (en son erişilen bölüm) - sadece location state yoksa
        if (lastAccessedEpisode) {
          // Episodes yüklendikten sonra player'ı aç
          setTimeout(() => {
            setCurrentEpisode(lastAccessedEpisode)
            // Player'a scroll et
            setTimeout(() => {
              if (playerRef.current) {
                playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }, 150)
          }, 100)
        }
      } catch (error) {
        console.error('Error loading episodes:', error)
      } finally {
        setEpisodesLoading(false)
      }
    }

    loadEpisodes()
  }, [selectedSeries, user])

  const handleSeriesSelect = (series: PodcastSeries) => {
    setSelectedSeries(series)
    setCurrentEpisode(null)
    setShowNotesAndQuestions(false)
  }

  const handleEpisodeClick = (episode: PodcastEpisode) => {
    setCurrentEpisode(episode)
    setShowNotesAndQuestions(false)
    // Player'a scroll et
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Episode değiştiğinde favori durumunu ve notu kontrol et
  useEffect(() => {
    if (currentEpisode && user?.id) {
      const userId = parseInt(user.id)
      // Favori durumunu kontrol et
      favoritesService
        .isFavorited(userId, currentEpisode.episodesId)
        .then((favorited) => setIsFavorited(favorited))
        .catch(() => setIsFavorited(false))

      // Mevcut notu yükle
      notesService
        .getNoteByUserAndEpisode(userId, currentEpisode.episodesId)
        .then((note) => {
          if (note) {
            setExistingNote(note)
            setNoteTitle(note.title || '')
            setNoteText(note.noteText || '')
          } else {
            setExistingNote(null)
            setNoteTitle('')
            setNoteText('')
          }
        })
        .catch(() => {
          setExistingNote(null)
          setNoteTitle('')
          setNoteText('')
        })

      // Mevcut soruyu yükle
      questionsService
        .getQuestionByUserAndEpisode(userId, currentEpisode.episodesId)
        .then((question) => {
          if (question) {
            setExistingQuestion(question)
            setQuestionText(question.questionText || '')
          } else {
            setExistingQuestion(null)
            setQuestionText('')
          }
        })
        .catch(() => {
          setExistingQuestion(null)
          setQuestionText('')
        })
    } else {
      setIsFavorited(false)
      setExistingNote(null)
      setNoteTitle('')
      setNoteText('')
      setExistingQuestion(null)
      setQuestionText('')
    }
  }, [currentEpisode, user])

  const handleSaveNote = async () => {
    if (!currentEpisode || !user?.id || !noteText.trim()) return

    setNoteLoading(true)
    try {
      const userId = parseInt(user.id)
      const savedNote = existingNote
        ? await notesService.updateNote({
            userId,
            episodeId: currentEpisode.episodesId,
            title: noteTitle || currentEpisode.title,
            noteText: noteText.trim(),
          })
        : await notesService.createNote({
            userId,
            episodeId: currentEpisode.episodesId,
            title: noteTitle || currentEpisode.title,
            noteText: noteText.trim(),
          })
      setExistingNote(savedNote)
      // Başarı geri bildirimi
      const successMsg = document.createElement('div')
      successMsg.className = 'alert alert-success position-fixed'
      successMsg.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 250px;'
      successMsg.innerHTML = '<strong>Başarılı!</strong> Not kaydedildi.'
      document.body.appendChild(successMsg)
      setTimeout(() => {
        successMsg.remove()
      }, 2000)
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Not kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setNoteLoading(false)
    }
  }

  const handleSubmitQuestion = async () => {
    if (!currentEpisode || !user?.id || !questionText.trim() || existingQuestion) return

    setQuestionLoading(true)
    try {
      const userId = parseInt(user.id)
      const newQuestion = await questionsService.createQuestion({
        userId,
        episodeId: currentEpisode.episodesId,
        questionText: questionText.trim(),
      })
      setExistingQuestion(newQuestion)
      setQuestionText('')
      // Başarı geri bildirimi için geçici mesaj göster
      const successMsg = document.createElement('div')
      successMsg.className = 'alert alert-success position-fixed'
      successMsg.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 250px;'
      successMsg.innerHTML = '<strong>Başarılı!</strong> Sorunuz admin\'e gönderildi.'
      document.body.appendChild(successMsg)
      setTimeout(() => {
        successMsg.remove()
      }, 3000)
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('Soru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setQuestionLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!currentEpisode || !user?.id || favoriteLoading) return

    setFavoriteLoading(true)
    const userId = parseInt(user.id)

    try {
      if (isFavorited) {
        // Favorilerden çıkar
        await favoritesService.removeFavorite({
          userId,
          favoriteType: 1, // 1 = Episode
          episodeId: currentEpisode.episodesId,
        })
        setIsFavorited(false)
      } else {
        // Favorilere ekle
        await favoritesService.addFavorite({
          userId,
          favoriteType: 1, // 1 = Episode
          episodeId: currentEpisode.episodesId,
        })
        setIsFavorited(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Hata durumunda state'i geri al
      setIsFavorited(!isFavorited)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const getAudioUrl = (episode: PodcastEpisode): string | null => {
    const extractFileId = (url: string): string | null => {
      // Google Drive URL formatları: /file/d/{fileId} veya ?id={fileId}
      const fileIdMatch = url.match(/\/file\/d\/([^\/\?]+)/) || url.match(/[?&]id=([^&]+)/)
      if (fileIdMatch && fileIdMatch[1]) {
        return fileIdMatch[1]
      }
      // Eğer zaten file ID gibi görünüyorsa (kısa alfanumerik string)
      if (url.length < 50 && /^[a-zA-Z0-9_-]+$/.test(url)) {
        return url
      }
      return null
    }

    const audioSource = episode.content?.audio || episode.audioLink
    if (!audioSource) return null

    // Eğer Google Drive URL'si ise, file ID'yi çıkar ve API endpoint'ini kullan
    if (audioSource.includes('drive.google.com') || audioSource.includes('drive') || audioSource.includes('/file/d/')) {
      const fileId = extractFileId(audioSource)
      if (fileId) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://app.keciyibesle.com/api'
        return `${baseUrl}/UserSeriesAccess/audio/${fileId}`
      }
    }

    // Eğer zaten tam URL ise (http/https ile başlıyorsa), direkt kullan
    if (audioSource.startsWith('http://') || audioSource.startsWith('https://')) {
      return audioSource
    }

    // Diğer durumlarda, file ID olarak kabul et ve API endpoint'ini kullan
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://app.keciyibesle.com/api'
    return `${baseUrl}/UserSeriesAccess/audio/${audioSource}`
  }

  const getVideoUrl = (episode: PodcastEpisode): string | null => {
    return episode.content?.video || null
  }

  const getPdfUrl = (episode: PodcastEpisode): string | null => {
    // Önce content.pdf'yi kontrol et
    if (episode.content?.pdf) {
      return episode.content.pdf
    }
    // Eğer images array'inde PDF varsa onu kullan
    if (episode.content?.images && episode.content.images.length > 0) {
      const pdfUrl = episode.content.images.find((url) => url.toLowerCase().endsWith('.pdf'))
      if (pdfUrl) return pdfUrl
    }
    return null
  }

  const getGalleryImages = (episode: PodcastEpisode): string[] => {
    if (!episode.content?.images || !Array.isArray(episode.content.images)) return []
    // PDF'leri ve boş/null değerleri filtrele, sadece geçerli görselleri döndür
    return episode.content.images.filter((url) => {
      if (!url || typeof url !== 'string') return false
      const trimmedUrl = url.trim()
      if (trimmedUrl === '' || trimmedUrl === 'null' || trimmedUrl === 'undefined') return false
      // PDF'leri filtrele
      return !trimmedUrl.toLowerCase().endsWith('.pdf')
    })
  }

  // İçerik tipini tespit et
  type ContentType = 'audio' | 'video' | 'pdf' | 'gallery' | 'none'
  const getContentType = (episode: PodcastEpisode): ContentType => {
    // Video kontrolü - null, undefined, boş string kontrolü
    const hasVideo = episode.content?.video && 
                     episode.content.video !== null && 
                     episode.content.video !== 'null' && 
                     episode.content.video.trim() !== ''
    
    // Audio kontrolü - null, undefined, boş string kontrolü
    const hasAudio = (episode.content?.audio && 
                      episode.content.audio !== null && 
                      episode.content.audio !== 'null' && 
                      episode.content.audio.trim() !== '') ||
                     (episode.audioLink && 
                      episode.audioLink !== null && 
                      episode.audioLink !== 'null' && 
                      episode.audioLink.trim() !== '')
    
    // Öncelik sırası: video > audio > pdf > gallery > none
    if (hasVideo) return 'video'
    if (hasAudio) return 'audio'
    
    const pdfUrl = getPdfUrl(episode)
    if (pdfUrl) return 'pdf'
    
    const galleryImages = getGalleryImages(episode)
    if (galleryImages.length > 0) return 'gallery'
    
    return 'none'
  }

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Önceki ve sonraki bölümleri bul
  const getPreviousEpisode = (): PodcastEpisode | null => {
    if (!currentEpisode || !episodes.length) return null
    
    // Episodes'ı sequenceNumber'a göre sırala
    const sortedEpisodes = [...episodes].sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    const currentIndex = sortedEpisodes.findIndex(ep => ep.episodesId === currentEpisode.episodesId)
    
    if (currentIndex > 0) {
      return sortedEpisodes[currentIndex - 1]
    }
    return null
  }

  const getNextEpisode = (): PodcastEpisode | null => {
    if (!currentEpisode || !episodes.length) return null
    
    // Episodes'ı sequenceNumber'a göre sırala
    const sortedEpisodes = [...episodes].sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    const currentIndex = sortedEpisodes.findIndex(ep => ep.episodesId === currentEpisode.episodesId)
    
    if (currentIndex < sortedEpisodes.length - 1) {
      return sortedEpisodes[currentIndex + 1]
    }
    return null
  }

  const handlePreviousEpisode = () => {
    const prevEpisode = getPreviousEpisode()
    if (prevEpisode) {
      setCurrentEpisode(prevEpisode)
      setShowNotesAndQuestions(false)
      setTimeout(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const handleNextEpisode = () => {
    const nextEpisode = getNextEpisode()
    if (nextEpisode) {
      setCurrentEpisode(nextEpisode)
      setShowNotesAndQuestions(false)
      setTimeout(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  return (
    <>
      <PageTitle subName="KeciApp" title="Podcasts" />
      
      {/* Player/Viewer */}
      {currentEpisode && (() => {
        const contentType = getContentType(currentEpisode)
        const getIcon = () => {
          switch (contentType) {
            case 'video':
              return 'mingcute:video-line'
            case 'audio':
              return 'mingcute:headphone-line'
            case 'pdf':
              return 'mingcute:file-pdf-line'
            case 'gallery':
              return 'mingcute:image-line'
            default:
              return 'mingcute:file-line'
          }
        }

        return (
          <div
            ref={playerRef}
            className="bg-white shadow-sm border-bottom mb-3 mb-md-4"
          >
            <Card className="border-0 shadow-none mb-0">
              <CardBody className="p-2 p-md-3">
                {/* Header */}
                <Row className="align-items-center g-2 mb-2">
                  <Col xs={12} sm="auto" className="text-center text-sm-start">
                    <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-2">
                      <Icon icon={getIcon()} className="text-primary" style={{ fontSize: '1.75rem' }} />
                      <div className="d-none d-sm-block">
                        <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>
                          {currentEpisode.title}
                        </div>
                        {currentEpisode.seriesTitle && (
                          <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                            {currentEpisode.seriesTitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm="auto" className="text-center order-2 order-sm-3 ms-auto">
                    <div className="d-flex align-items-center justify-content-center justify-content-sm-end gap-2 gap-md-3">
                      {/* Favori Butonu */}
                      <button
                        className="btn btn-link p-1 p-md-2 border-0 bg-transparent position-relative"
                        onClick={handleToggleFavorite}
                        disabled={favoriteLoading}
                        aria-label={isFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: 'scale(1)',
                          minWidth: '40px',
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                          if (!favoriteLoading) {
                            e.currentTarget.style.transform = 'scale(1.2)'
                            e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'
                            e.currentTarget.style.borderRadius = '50%'
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                        onTouchStart={(e) => {
                          if (!favoriteLoading) {
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
                        {favoriteLoading ? (
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
                      </button>
                      {/* Kapat Butonu */}
                      <button
                        className="btn btn-link text-muted p-1 p-md-2 border-0 bg-transparent"
                        onClick={() => {
                          setCurrentEpisode(null)
                          setIsFavorited(false)
                        }}
                        aria-label="Close player"
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: 'scale(1)',
                          minWidth: '40px',
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.2)'
                          e.currentTarget.style.color = '#dc3545'
                          e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'
                          e.currentTarget.style.borderRadius = '50%'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.color = '#6c757d'
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                        onTouchStart={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)'
                          e.currentTarget.style.color = '#dc3545'
                          e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'
                          e.currentTarget.style.borderRadius = '50%'
                        }}
                        onTouchEnd={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.color = '#6c757d'
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <Icon icon="mingcute:close-line" style={{ fontSize: '1.5rem' }} />
                      </button>
                    </div>
                  </Col>
                </Row>

                {/* Mobile Title */}
                <div className="d-block d-sm-none mb-2 text-center">
                  <div className="fw-semibold text-truncate">{currentEpisode.title}</div>
                  {currentEpisode.seriesTitle && (
                    <div className="text-muted small text-truncate">{currentEpisode.seriesTitle}</div>
                  )}
                </div>

                {/* Content Renderer */}
                <div className="mt-2">
                  {contentType === 'video' && (
                    <VideoPlayer
                      src={getVideoUrl(currentEpisode) || ''}
                      episodeId={currentEpisode.episodesId}
                      className="w-100 rounded"
                      style={{ maxHeight: '400px' }}
                      controlsList="nodownload"
                    />
                  )}
                  {contentType === 'audio' && (
                    <ModernAudioPlayer
                      src={getAudioUrl(currentEpisode) || ''}
                      title={currentEpisode.title}
                      episodeId={currentEpisode.episodesId}
                      userId={user?.id ? parseInt(user.id) : undefined}
                    />
                  )}
                  {contentType === 'pdf' && (
                    <PDFViewer
                      pdfUrl={getPdfUrl(currentEpisode) || ''}
                      title={currentEpisode.title}
                      onClose={() => setCurrentEpisode(null)}
                    />
                  )}
                  {contentType === 'gallery' && (
                    <GalleryViewer
                      images={getGalleryImages(currentEpisode)}
                      title={currentEpisode.title}
                      onClose={() => setCurrentEpisode(null)}
                    />
                  )}
                  {contentType === 'none' && (
                    <div className="text-center py-4 text-muted">
                      <Icon icon="mingcute:file-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                      <p className="mt-2 mb-0">Bu bölüm için içerik bulunamadı</p>
                    </div>
                  )}
                </div>

                {/* Önceki/Sonraki Navigasyon Butonları */}
                {(() => {
                  const prevEpisode = getPreviousEpisode()
                  const nextEpisode = getNextEpisode()
                  
                  if (!prevEpisode && !nextEpisode) return null
                  
                  return (
                    <div className="mt-3 pt-3 border-top">
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        {/* Önceki Butonu */}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handlePreviousEpisode}
                          disabled={!prevEpisode}
                          className="d-flex align-items-center justify-content-center gap-1 gap-sm-2"
                          style={{
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '0.875rem',
                            minHeight: '38px',
                            borderRadius: '8px',
                            borderWidth: '1.5px',
                            fontWeight: '500',
                            flex: '1 1 0',
                            opacity: prevEpisode ? 1 : 0.5,
                          }}
                          onMouseEnter={(e) => {
                            if (prevEpisode) {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--bs-primary-rgb), 0.2)'
                              e.currentTarget.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.1)'
                              e.currentTarget.style.borderColor = 'var(--bs-primary)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.borderColor = 'var(--bs-border-color)'
                          }}
                          onTouchStart={(e) => {
                            if (prevEpisode) {
                              e.currentTarget.style.transform = 'scale(0.98)'
                            }
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                        >
                          <Icon 
                            icon="mingcute:arrow-left-line" 
                            style={{ fontSize: '1.125rem', flexShrink: 0 }} 
                          />
                          <span className="d-none d-sm-inline">Önceki</span>
                          {prevEpisode && (
                            <span className="d-none d-lg-inline text-truncate ms-1" style={{ maxWidth: '100px', fontSize: '0.8rem' }}>
                              {prevEpisode.title}
                            </span>
                          )}
                        </Button>

                        {/* Sonraki Butonu */}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleNextEpisode}
                          disabled={!nextEpisode}
                          className="d-flex align-items-center justify-content-center gap-1 gap-sm-2"
                          style={{
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '0.875rem',
                            minHeight: '38px',
                            borderRadius: '8px',
                            fontWeight: '500',
                            flex: '1 1 0',
                            opacity: nextEpisode ? 1 : 0.5,
                          }}
                          onMouseEnter={(e) => {
                            if (nextEpisode) {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--bs-primary-rgb), 0.3)'
                              e.currentTarget.style.backgroundColor = 'var(--bs-primary)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                            e.currentTarget.style.backgroundColor = 'var(--bs-primary)'
                          }}
                          onTouchStart={(e) => {
                            if (nextEpisode) {
                              e.currentTarget.style.transform = 'scale(0.98)'
                            }
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                        >
                          {nextEpisode && (
                            <span className="d-none d-lg-inline text-truncate me-1" style={{ maxWidth: '100px', fontSize: '0.8rem' }}>
                              {nextEpisode.title}
                            </span>
                          )}
                          <span className="d-none d-sm-inline">Sonraki</span>
                          <Icon 
                            icon="mingcute:arrow-right-line" 
                            style={{ fontSize: '1.125rem', flexShrink: 0 }} 
                          />
                        </Button>
                      </div>
                    </div>
                  )
                })()}

                {/* Not ve Soru Toggle Butonu */}
                <div className="mt-3 pt-3 border-top">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowNotesAndQuestions(!showNotesAndQuestions)}
                    className="w-100 w-md-auto d-flex align-items-center justify-content-center gap-2"
                    style={{
                      transition: 'all 0.2s',
                      fontSize: '0.875rem',
                    }}
                  >
                    <Icon
                      icon={showNotesAndQuestions ? 'mingcute:up-line' : 'mingcute:down-line'}
                      style={{ fontSize: '1rem' }}
                    />
                    <span>Not ve Soru</span>
                    {existingNote && (
                      <span 
                        className="badge ms-1" 
                        style={{ 
                          fontSize: '0.65rem',
                          backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                          color: 'var(--bs-primary)',
                          border: '1px solid rgba(var(--bs-primary-rgb), 0.2)'
                        }}
                      >
                        Not Var
                      </span>
                    )}
                  </Button>

                  {/* Not ve Soru Bölümleri - Collapse */}
                  <Collapse in={showNotesAndQuestions}>
                    <div>
                      <Row className="g-2 g-md-3 mt-2">
                        {/* Not Bölümü */}
                        <Col xs={12} md={6}>
                          <Card
                            className="border h-100 shadow-sm"
                            style={{
                              backgroundColor: 'var(--bs-body-bg)',
                              transition: 'all 0.2s ease',
                              borderColor: 'var(--bs-border-color)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--bs-primary-rgb), 0.1)'
                              e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb), 0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                              e.currentTarget.style.borderColor = 'var(--bs-border-color)'
                            }}
                          >
                            <CardBody className="p-2 p-md-3">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Icon 
                                  icon="mingcute:notebook-3-line" 
                                  style={{ 
                                    fontSize: '1.1rem',
                                    color: 'var(--bs-primary)'
                                  }} 
                                />
                                <h6 
                                  className="mb-0 fw-semibold"
                                  style={{ fontSize: '0.95rem' }}
                                >
                                  Notlarım
                                </h6>
                                {existingNote && (
                                  <span 
                                    className="badge ms-auto" 
                                    style={{ 
                                      fontSize: '0.7rem',
                                      backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                                      color: 'var(--bs-primary)',
                                      border: '1px solid rgba(var(--bs-primary-rgb), 0.2)',
                                      fontWeight: '500'
                                    }}
                                  >
                                    <Icon icon="mingcute:check-fill" className="me-1" style={{ fontSize: '0.7rem' }} />
                                    Kaydedildi
                                  </span>
                                )}
                              </div>
                              {existingNote && (
                                <div className="alert alert-info py-2 px-2 mb-2" style={{ fontSize: '0.8rem' }}>
                                  <Icon icon="mingcute:information-line" className="me-1" style={{ fontSize: '0.875rem' }} />
                                  Mevcut notunuz düzenlenebilir. Değişiklikler kaydedildiğinde güncellenecektir.
                                </div>
                              )}
                              <Form.Group className="mb-2">
                                <Form.Control
                                  type="text"
                                  placeholder="Not başlığı (opsiyonel)"
                                  value={noteTitle}
                                  onChange={(e) => setNoteTitle(e.target.value)}
                                  size="sm"
                                  className="mb-2"
                                  style={{ 
                                    fontSize: '0.85rem',
                                    borderColor: 'var(--bs-border-color)'
                                  }}
                                />
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  placeholder="Bu bölüm hakkında notlarınızı yazın..."
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  style={{
                                    resize: 'vertical',
                                    fontSize: '0.85rem',
                                    minHeight: '70px',
                                    borderColor: 'var(--bs-border-color)'
                                  }}
                                />
                              </Form.Group>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSaveNote}
                                disabled={noteLoading || !noteText.trim()}
                                className="w-100"
                                style={{
                                  transition: 'all 0.2s',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {noteLoading ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Kaydediliyor...
                                  </>
                                ) : existingNote ? (
                                  <>
                                    <Icon icon="mingcute:save-line" className="me-1" style={{ fontSize: '1rem' }} />
                                    Notu Güncelle
                                  </>
                                ) : (
                                  <>
                                    <Icon icon="mingcute:save-line" className="me-1" style={{ fontSize: '1rem' }} />
                                    Notu Kaydet
                                  </>
                                )}
                              </Button>
                            </CardBody>
                          </Card>
                        </Col>

                        {/* Soru Bölümü */}
                        <Col xs={12} md={6}>
                          <Card
                            className="border h-100 shadow-sm"
                            style={{
                              backgroundColor: 'var(--bs-body-bg)',
                              transition: 'all 0.2s ease',
                              borderColor: 'var(--bs-border-color)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--bs-warning-rgb), 0.1)'
                              e.currentTarget.style.borderColor = 'rgba(var(--bs-warning-rgb), 0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                              e.currentTarget.style.borderColor = 'var(--bs-border-color)'
                            }}
                          >
                            <CardBody className="p-2 p-md-3">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Icon 
                                  icon="mingcute:question-line" 
                                  style={{ 
                                    fontSize: '1.1rem',
                                    color: 'var(--bs-warning)'
                                  }} 
                                />
                                <h6 
                                  className="mb-0 fw-semibold"
                                  style={{ fontSize: '0.95rem' }}
                                >
                                  Soru Sor
                                </h6>
                                {existingQuestion ? (
                                  <span 
                                    className="badge ms-auto" 
                                    style={{ 
                                      fontSize: '0.7rem',
                                      backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                                      color: 'var(--bs-primary)',
                                      border: '1px solid rgba(var(--bs-primary-rgb), 0.2)',
                                      fontWeight: '500'
                                    }}
                                  >
                                    <Icon icon="mingcute:check-fill" className="me-1" style={{ fontSize: '0.7rem' }} />
                                    Soru Gönderildi
                                  </span>
                                ) : (
                                  <span 
                                    className="badge ms-auto" 
                                    style={{ 
                                      fontSize: '0.7rem',
                                      backgroundColor: 'rgba(var(--bs-warning-rgb), 0.1)',
                                      color: 'var(--bs-warning)',
                                      border: '1px solid rgba(var(--bs-warning-rgb), 0.2)',
                                      fontWeight: '500'
                                    }}
                                  >
                                    Admin'e Gönderilir
                                  </span>
                                )}
                              </div>
                              {existingQuestion ? (
                                <>
                                  <div 
                                    className="py-2 px-2 mb-2 rounded"
                                    style={{ 
                                      fontSize: '0.8rem',
                                      backgroundColor: 'rgba(var(--bs-info-rgb), 0.1)',
                                      border: '1px solid rgba(var(--bs-info-rgb), 0.2)',
                                      color: 'var(--bs-body-color)'
                                    }}
                                  >
                                    <Icon 
                                      icon="mingcute:information-line" 
                                      className="me-1" 
                                      style={{ 
                                        fontSize: '0.875rem',
                                        color: 'var(--bs-info)'
                                      }} 
                                    />
                                    Bu bölüm için daha önce soru gönderilmiş. Sorunuz admin tarafından inceleniyor.
                                  </div>
                                  <div 
                                    className="border rounded p-2"
                                    style={{
                                      backgroundColor: 'rgba(var(--bs-primary-rgb), 0.03)',
                                      borderColor: 'rgba(var(--bs-primary-rgb), 0.1)'
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                      <Icon 
                                        icon="mingcute:question-line" 
                                        style={{ 
                                          fontSize: '0.9rem',
                                          color: 'var(--bs-warning)'
                                        }} 
                                      />
                                      <span 
                                        className="fw-semibold small"
                                        style={{ fontSize: '0.85rem' }}
                                      >
                                        Gönderilen Soru
                                      </span>
                                      {existingQuestion.createdAt && (
                                        <span className="text-muted small ms-auto">
                                          {new Date(existingQuestion.createdAt).toLocaleDateString('tr-TR', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                          })}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-muted small mb-0" style={{ lineHeight: '1.6', fontSize: '0.875rem' }}>
                                      {existingQuestion.questionText}
                                    </p>
                                    {existingQuestion.isAnswered && existingQuestion.answer && (
                                      <div 
                                        className="mt-2 pt-2 border-top rounded p-2"
                                        style={{
                                          backgroundColor: 'rgba(var(--bs-primary-rgb), 0.05)',
                                          borderColor: 'rgba(var(--bs-primary-rgb), 0.2) !important'
                                        }}
                                      >
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                          <Icon 
                                            icon="mingcute:check-fill" 
                                            style={{ 
                                              fontSize: '0.875rem',
                                              color: 'var(--bs-primary)'
                                            }} 
                                          />
                                          <span 
                                            className="fw-semibold small"
                                            style={{ color: 'var(--bs-primary)' }}
                                          >
                                            Cevap
                                          </span>
                                        </div>
                                        <p 
                                          className="small mb-0" 
                                          style={{ 
                                            lineHeight: '1.6', 
                                            fontSize: '0.875rem',
                                            color: 'var(--bs-body-color)'
                                          }}
                                        >
                                          {existingQuestion.answer.answerText}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Form.Group className="mb-2">
                                    <Form.Control
                                      as="textarea"
                                      rows={4}
                                      placeholder="Bu bölüm hakkında sorunuzu yazın. Sorunuz admin'e gönderilecektir..."
                                      value={questionText}
                                      onChange={(e) => setQuestionText(e.target.value)}
                                      style={{
                                        resize: 'vertical',
                                        fontSize: '0.875rem',
                                        minHeight: '80px',
                                      }}
                                    />
                                  </Form.Group>
                                  <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={handleSubmitQuestion}
                                    disabled={questionLoading || !questionText.trim()}
                                    className="w-100"
                                    style={{
                                      transition: 'all 0.2s',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {questionLoading ? (
                                      <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Gönderiliyor...
                                      </>
                                    ) : (
                                      <>
                                        <Icon icon="mingcute:send-line" className="me-1" style={{ fontSize: '1rem' }} />
                                        Soruyu Gönder
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  </Collapse>
                </div>
              </CardBody>
            </Card>
          </div>
        )
      })()}

      <Row className="g-3 g-md-4">
        {/* Sol taraf - Seriler Listesi */}
        <Col xs={12} md={4} lg={3} className="order-2 order-md-1">
          <Card>
            <CardBody>
              <h5 className="mb-3 fw-semibold">Podcast Serileri</h5>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" className="text-primary" />
                </div>
              ) : seriesList.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <Icon icon="mingcute:headphone-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                  <p className="mt-2 mb-0">Henüz erişiminiz olan seri bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {seriesList.map((series) => (
                    <button
                      key={series.seriesId}
                      className={`list-group-item list-group-item-action border-0 px-2 py-2 ${
                        selectedSeries?.seriesId === series.seriesId ? 'active' : ''
                      }`}
                      onClick={() => handleSeriesSelect(series)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        backgroundColor: selectedSeries?.seriesId === series.seriesId ? 'var(--bs-primary)' : 'transparent',
                        color: selectedSeries?.seriesId === series.seriesId ? '#ffffff' : 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedSeries?.seriesId !== series.seriesId) {
                          e.currentTarget.style.backgroundColor = 'var(--bs-primary)'
                          e.currentTarget.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.1)'
                          e.currentTarget.style.color = 'var(--bs-primary)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedSeries?.seriesId !== series.seriesId) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = 'inherit'
                        }
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <Icon
                          icon={series.isVideo ? 'mingcute:video-line' : 'mingcute:headphone-line'}
                          style={{ 
                            fontSize: '1.25rem', 
                            flexShrink: 0,
                            color: selectedSeries?.seriesId === series.seriesId ? '#ffffff' : 'var(--bs-primary)',
                            transition: 'color 0.2s ease'
                          }}
                        />
                        <div className="flex-grow-1 text-start min-w-0">
                          <div
                            className="fw-semibold text-truncate"
                            style={{ 
                              color: selectedSeries?.seriesId === series.seriesId ? '#ffffff' : 'inherit',
                              fontSize: '0.9rem'
                            }}
                          >
                            {series.title}
                          </div>
                          {series.description && (
                            <div
                              className="small text-truncate"
                              style={{ 
                                maxWidth: '200px',
                                color: selectedSeries?.seriesId === series.seriesId ? 'rgba(255, 255, 255, 0.8)' : 'var(--bs-secondary)',
                                fontSize: '0.8rem'
                              }}
                            >
                              {series.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Sağ taraf - Bölümler Listesi */}
        <Col xs={12} md={8} lg={9} className="order-1 order-md-2">
          {!selectedSeries ? (
            <Card>
              <CardBody>
                <div className="text-center text-muted py-5">
                  <Icon icon="mingcute:headphone-line" style={{ fontSize: '4rem', opacity: 0.3 }} />
                  <p className="mt-3 mb-0">Lütfen bir seri seçin</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="mb-1 fw-semibold">{selectedSeries.title}</h5>
                    {selectedSeries.description && (
                      <p className="text-muted small mb-0">{selectedSeries.description}</p>
                    )}
                  </div>
                </div>

                {episodesLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" className="text-primary" />
                  </div>
                ) : episodes.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <Icon icon="mingcute:file-list-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                    <p className="mt-2 mb-0">Bu seride henüz erişebileceğiniz bölüm bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div>
                    {/* En son erişilen bölüm */}
                    {episodes[0]?.lastAccessedAt && (
                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Icon icon="mingcute:time-line" className="text-primary" />
                          <span className="small fw-semibold text-muted">Son Dinlenen</span>
                        </div>
                        <div
                          className="card border"
                          style={{ 
                            cursor: 'pointer', 
                            transition: 'all 0.2s ease',
                            borderColor: 'rgba(var(--bs-primary-rgb), 0.3)',
                            backgroundColor: 'var(--bs-body-bg)'
                          }}
                          onClick={() => handleEpisodeClick(episodes[0])}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.05)'
                            e.currentTarget.style.borderColor = 'var(--bs-primary)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--bs-primary-rgb), 0.15)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bs-body-bg)'
                            e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb), 0.3)'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          <CardBody className="p-2 p-md-3">
                            <Row className="align-items-center g-2">
                                    <Col xs="auto">
                                      <div
                                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ 
                                          width: '44px', 
                                          height: '44px',
                                          backgroundColor: 'var(--bs-primary)',
                                          color: '#ffffff',
                                          transition: 'transform 0.2s ease'
                                        }}
                                      >
                                        <Icon
                                          icon={
                                            getContentType(episodes[0]) === 'video'
                                              ? 'mingcute:play-fill'
                                              : getContentType(episodes[0]) === 'pdf'
                                                ? 'mingcute:file-pdf-fill'
                                                : getContentType(episodes[0]) === 'gallery'
                                                  ? 'mingcute:image-fill'
                                                  : 'mingcute:headphone-fill'
                                          }
                                          style={{ fontSize: '1.5rem' }}
                                        />
                                      </div>
                                    </Col>
                              <Col className="min-w-0">
                                <div className="fw-semibold text-truncate">{episodes[0].title}</div>
                                {episodes[0].description && (
                                  <div className="text-muted small text-truncate">{episodes[0].description}</div>
                                )}
                                <div className="d-flex align-items-center flex-wrap gap-2 gap-md-3 mt-1">
                                  <span 
                                    className="badge"
                                    style={{
                                      backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                                      color: 'var(--bs-primary)',
                                      border: '1px solid rgba(var(--bs-primary-rgb), 0.2)',
                                      fontSize: '0.75rem',
                                      fontWeight: '500',
                                      padding: '0.25rem 0.5rem'
                                    }}
                                  >
                                    Bölüm {episodes[0].sequenceNumber}
                                  </span>
                                  {episodes[0].duration && (
                                    <span className="text-muted small d-flex align-items-center">
                                      <Icon icon="mingcute:time-line" className="me-1" />
                                      {formatDuration(episodes[0].duration)}
                                    </span>
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </CardBody>
                        </div>
                      </div>
                    )}

                    {/* Diğer bölümler - Toggle ile */}
                    {episodes.filter((ep) => !ep.lastAccessedAt).length > 0 && (
                      <div>
                        <button
                          className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2 mb-2"
                          onClick={() => setShowOtherEpisodes(!showOtherEpisodes)}
                        >
                          <Icon
                            icon={showOtherEpisodes ? 'mingcute:arrow-up-line' : 'mingcute:arrow-down-line'}
                            className="text-primary"
                          />
                          <span className="small fw-semibold text-muted">
                            Diğer Bölümler ({episodes.filter((ep) => !ep.lastAccessedAt).length})
                          </span>
                        </button>

                        {showOtherEpisodes && (
                          <div className="list-group">
                            {episodes
                              .filter((ep) => !ep.lastAccessedAt)
                              .map((episode) => (
                                <div
                                  key={episode.episodesId}
                                  className="list-group-item border rounded mb-2"
                                  style={{ 
                                    cursor: 'pointer', 
                                    transition: 'all 0.2s ease',
                                    backgroundColor: 'var(--bs-body-bg)',
                                    borderColor: 'var(--bs-border-color)'
                                  }}
                                  onClick={() => handleEpisodeClick(episode)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.05)'
                                    e.currentTarget.style.borderColor = 'var(--bs-primary)'
                                    e.currentTarget.style.transform = 'translateX(4px)'
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(var(--bs-primary-rgb), 0.1)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bs-body-bg)'
                                    e.currentTarget.style.borderColor = 'var(--bs-border-color)'
                                    e.currentTarget.style.transform = 'translateX(0)'
                                    e.currentTarget.style.boxShadow = 'none'
                                  }}
                                >
                                  <Row className="align-items-center g-2">
                                    <Col xs="auto">
                                      <div
                                        className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: '40px', height: '40px' }}
                                      >
                                        <Icon
                                          icon={
                                            getContentType(episode) === 'video'
                                              ? 'mingcute:play-fill'
                                              : getContentType(episode) === 'pdf'
                                                ? 'mingcute:file-pdf-fill'
                                                : getContentType(episode) === 'gallery'
                                                  ? 'mingcute:image-fill'
                                                  : 'mingcute:headphone-fill'
                                          }
                                          style={{ fontSize: '1.25rem' }}
                                        />
                                      </div>
                                    </Col>
                                    <Col className="min-w-0">
                                      <div className="fw-semibold text-truncate">{episode.title}</div>
                                      {episode.description && (
                                        <div className="text-muted small text-truncate">{episode.description}</div>
                                      )}
                                      <div className="d-flex align-items-center flex-wrap gap-2 gap-md-3 mt-1">
                                        <span 
                                          className="badge"
                                          style={{
                                            backgroundColor: 'rgba(var(--bs-secondary-rgb), 0.1)',
                                            color: 'var(--bs-secondary)',
                                            border: '1px solid rgba(var(--bs-secondary-rgb), 0.2)',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            padding: '0.25rem 0.5rem'
                                          }}
                                        >
                                          Bölüm {episode.sequenceNumber}
                                        </span>
                                        {episode.duration && (
                                          <span className="text-muted small d-flex align-items-center">
                                            <Icon icon="mingcute:time-line" className="me-1" />
                                            {formatDuration(episode.duration)}
                                          </span>
                                        )}
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </>
  )
}

export default PodcastsPage

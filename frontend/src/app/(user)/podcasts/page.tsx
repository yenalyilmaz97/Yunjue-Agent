import PageTitle from '@/components/PageTitle'
import { useEffect, useState, useRef } from 'react'
import { useAuthContext } from '@/context/useAuthContext'
import { userSeriesAccessService, podcastService, favoritesService, notesService, questionsService } from '@/services'
import type { PodcastSeries, PodcastEpisode, Question, Note } from '@/types/keci'
import { Card, CardBody, Row, Col, Spinner, Button, Form, Collapse } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useLocation } from 'react-router-dom'
import PDFViewer from '@/components/podcast/PDFViewer'
import GalleryViewer from '@/components/podcast/GalleryViewer'
import ModernAudioPlayer from '@/components/podcast/ModernAudioPlayer'
import VideoPlayer from '@/components/podcast/VideoPlayer'
import { CONTENT_ICONS } from '@/context/constants'

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
  const [existingNote, setExistingNote] = useState<Note | null>(null)
  const [showNotesAndQuestions, setShowNotesAndQuestions] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)

  // Load user's accessible series
  useEffect(() => {
    const loadSeries = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const userId = parseInt(user.id)
        const accesses = await userSeriesAccessService.getAccessByUserId(userId)
        
        const seriesPromises = accesses
          .filter((access) => access.seriesId && access.podcastSeries)
          .map(async (access) => {
            if (access.podcastSeries) return access.podcastSeries
            if (access.seriesId) return await podcastService.getSeriesById(access.seriesId)
            return null
          })

        const series = (await Promise.all(seriesPromises)).filter((s): s is PodcastSeries => s !== null)
        
        const sortedSeries = series.sort((a, b) => {
          const accessA = accesses.find((acc) => acc.seriesId === a.seriesId)
          const accessB = accesses.find((acc) => acc.seriesId === b.seriesId)
          if (!accessA || !accessB) return 0
          return new Date(accessB.updatedAt).getTime() - new Date(accessA.updatedAt).getTime()
        })

        setSeriesList(sortedSeries)
        
        const locationState = location.state as { seriesId?: number; episodeId?: number } | null
        if (locationState?.seriesId) {
          const targetSeries = sortedSeries.find((s) => s.seriesId === locationState.seriesId)
          if (targetSeries) setSelectedSeries(targetSeries)
          else if (sortedSeries.length > 0) setSelectedSeries(sortedSeries[0])
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

  // Load episodes for selected series
  useEffect(() => {
    const loadEpisodes = async () => {
      if (!selectedSeries || !user?.id) return

      setEpisodesLoading(true)
      try {
        const userId = parseInt(user.id)
        const userAccess = await userSeriesAccessService.getUserSeriesAccess(userId, selectedSeries.seriesId)
        const allEpisodes = await podcastService.getEpisodesBySeries(selectedSeries.seriesId)
        
        const accessibleEpisodes = allEpisodes.filter(
          (ep) => ep.isActive && ep.sequenceNumber <= userAccess.currentAccessibleSequence
        )

        const episodesWithAccess: EpisodeWithAccess[] = accessibleEpisodes.map((ep) => ({
          ...ep,
          lastAccessedAt: ep.sequenceNumber === userAccess.currentAccessibleSequence ? userAccess.updatedAt : undefined,
        }))

        const lastAccessedEpisode = episodesWithAccess.find(
          (ep) => ep.sequenceNumber === userAccess.currentAccessibleSequence
        )
        const otherEpisodes = episodesWithAccess.filter((ep) => !ep.lastAccessedAt)

        const sortedEpisodes: EpisodeWithAccess[] = []
        if (lastAccessedEpisode) sortedEpisodes.push(lastAccessedEpisode)
        sortedEpisodes.push(...otherEpisodes.sort((a, b) => b.sequenceNumber - a.sequenceNumber))

        setEpisodes(sortedEpisodes)
        setShowOtherEpisodes(false)

        const locationState = location.state as { seriesId?: number; episodeId?: number } | null
        if (locationState?.episodeId && selectedSeries.seriesId === locationState.seriesId) {
          const targetEpisode = sortedEpisodes.find((ep) => ep.episodesId === locationState.episodeId)
          if (targetEpisode) {
            window.history.replaceState({}, document.title)
            setTimeout(() => {
              setCurrentEpisode(targetEpisode)
              setTimeout(() => {
                playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 100)
            }, 100)
            setEpisodesLoading(false)
            return
          }
        }

        if (lastAccessedEpisode) {
          setTimeout(() => {
            setCurrentEpisode(lastAccessedEpisode)
            setTimeout(() => {
              playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Load favorite status and notes when episode changes
  useEffect(() => {
    if (currentEpisode && user?.id) {
      const userId = parseInt(user.id)
      
      favoritesService
        .isFavorited(userId, currentEpisode.episodesId)
        .then((favorited) => setIsFavorited(favorited))
        .catch(() => setIsFavorited(false))

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

  const showSuccessToast = (message: string) => {
    const successMsg = document.createElement('div')
    successMsg.className = 'alert alert-success position-fixed'
    successMsg.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 250px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);'
    successMsg.innerHTML = `<strong>Başarılı!</strong> ${message}`
    document.body.appendChild(successMsg)
    setTimeout(() => successMsg.remove(), 2500)
  }

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
      showSuccessToast('Not kaydedildi.')
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
      showSuccessToast("Sorunuz admin'e gönderildi.")
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
        await favoritesService.removeFavorite({
          userId,
          favoriteType: 1,
          episodeId: currentEpisode.episodesId,
        })
        setIsFavorited(false)
      } else {
        await favoritesService.addFavorite({
          userId,
          favoriteType: 1,
          episodeId: currentEpisode.episodesId,
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

  const getAudioUrl = (episode: PodcastEpisode): string | null => {
    const extractFileId = (url: string): string | null => {
      const fileIdMatch = url.match(/\/file\/d\/([^\/\?]+)/) || url.match(/[?&]id=([^&]+)/)
      if (fileIdMatch && fileIdMatch[1]) return fileIdMatch[1]
      if (url.length < 50 && /^[a-zA-Z0-9_-]+$/.test(url)) return url
      return null
    }

    const audioSource = episode.content?.audio || episode.audioLink
    if (!audioSource) return null

    if (audioSource.includes('drive.google.com') || audioSource.includes('drive') || audioSource.includes('/file/d/')) {
      const fileId = extractFileId(audioSource)
      if (fileId) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://app.keciyibesle.com/api'
        return `${baseUrl}/UserSeriesAccess/audio/${fileId}`
      }
    }

    if (audioSource.startsWith('http://') || audioSource.startsWith('https://')) return audioSource

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://app.keciyibesle.com/api'
    return `${baseUrl}/UserSeriesAccess/audio/${audioSource}`
  }

  const getVideoUrl = (episode: PodcastEpisode): string | null => episode.content?.video || null

  const getPdfUrl = (episode: PodcastEpisode): string | null => {
    if (episode.content?.pdf) return episode.content.pdf
    if (episode.content?.images && episode.content.images.length > 0) {
      const pdfUrl = episode.content.images.find((url) => url.toLowerCase().endsWith('.pdf'))
      if (pdfUrl) return pdfUrl
    }
    return null
  }

  const getGalleryImages = (episode: PodcastEpisode): string[] => {
    if (!episode.content?.images || !Array.isArray(episode.content.images)) return []
    return episode.content.images.filter((url) => {
      if (!url || typeof url !== 'string') return false
      const trimmedUrl = url.trim()
      if (trimmedUrl === '' || trimmedUrl === 'null' || trimmedUrl === 'undefined') return false
      return !trimmedUrl.toLowerCase().endsWith('.pdf')
    })
  }

  type ContentType = 'audio' | 'video' | 'pdf' | 'gallery' | 'none'
  const getContentType = (episode: PodcastEpisode): ContentType => {
    const hasVideo = episode.content?.video && episode.content.video !== null && episode.content.video !== 'null' && episode.content.video.trim() !== ''
    const hasAudio = (episode.content?.audio && episode.content.audio !== null && episode.content.audio !== 'null' && episode.content.audio.trim() !== '') ||
                     (episode.audioLink && episode.audioLink !== null && episode.audioLink !== 'null' && episode.audioLink.trim() !== '')
    
    if (hasVideo) return 'video'
    if (hasAudio) return 'audio'
    if (getPdfUrl(episode)) return 'pdf'
    if (getGalleryImages(episode).length > 0) return 'gallery'
    return 'none'
  }

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPreviousEpisode = (): PodcastEpisode | null => {
    if (!currentEpisode || !episodes.length) return null
    const sortedEpisodes = [...episodes].sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    const currentIndex = sortedEpisodes.findIndex(ep => ep.episodesId === currentEpisode.episodesId)
    if (currentIndex > 0) return sortedEpisodes[currentIndex - 1]
    return null
  }

  const getNextEpisode = (): PodcastEpisode | null => {
    if (!currentEpisode || !episodes.length) return null
    const sortedEpisodes = [...episodes].sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    const currentIndex = sortedEpisodes.findIndex(ep => ep.episodesId === currentEpisode.episodesId)
    if (currentIndex < sortedEpisodes.length - 1) return sortedEpisodes[currentIndex + 1]
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

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'video': return CONTENT_ICONS.video
      case 'audio': return CONTENT_ICONS.audio
      case 'pdf': return CONTENT_ICONS.pdf
      case 'gallery': return CONTENT_ICONS.gallery
      default: return CONTENT_ICONS.default
    }
  }

  return (
    <>
      <PageTitle subName="KeciApp" title="Podcasts" />
      
      {/* Player/Viewer */}
      {currentEpisode && (() => {
        const contentType = getContentType(currentEpisode)

        return (
          <div ref={playerRef} className="mb-3 mb-md-4">
            <Card 
              className="border-0 shadow-sm overflow-hidden"
              style={{ 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.03) 0%, rgba(var(--bs-primary-rgb), 0.06) 100%)'
              }}
            >
              <CardBody className="p-3">
                {/* Header */}
                <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2 min-w-0 flex-grow-1">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                      }}
                    >
                      <Icon icon={getContentIcon(contentType)} style={{ fontSize: '1.25rem', color: 'var(--bs-primary)' }} />
                    </div>
                    <div className="min-w-0">
                      <div className="fw-semibold text-truncate" style={{ fontSize: '0.95rem' }}>
                        {currentEpisode.title}
                      </div>
                      {currentEpisode.seriesTitle && (
                        <div className="text-muted small text-truncate">{currentEpisode.seriesTitle}</div>
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-1 flex-shrink-0">
                    {/* Favorite Button */}
                    <button
                      className="btn btn-link p-2 border-0 bg-transparent"
                      onClick={handleToggleFavorite}
                      disabled={favoriteLoading}
                      style={{ borderRadius: '10px', transition: 'all 0.2s' }}
                    >
                      {favoriteLoading ? (
                        <Spinner animation="border" size="sm" style={{ color: 'var(--bs-primary)', width: '18px', height: '18px' }} />
                      ) : (
                        <Icon
                          icon={isFavorited ? 'mingcute:heart-fill' : 'mingcute:heart-line'}
                          style={{ fontSize: '1.25rem', color: isFavorited ? 'var(--bs-danger)' : 'var(--bs-secondary)' }}
                        />
                      )}
                    </button>
                    {/* Close Button */}
                    <button
                      className="btn btn-link p-2 text-muted border-0 bg-transparent"
                      onClick={() => { setCurrentEpisode(null); setIsFavorited(false) }}
                      style={{ borderRadius: '10px', transition: 'all 0.2s' }}
                    >
                      <Icon icon="mingcute:close-line" style={{ fontSize: '1.25rem' }} />
                    </button>
                  </div>
                </div>

                {/* Content Renderer */}
                <div className="mb-3">
                  {contentType === 'video' && (
                    <VideoPlayer src={getVideoUrl(currentEpisode) || ''} episodeId={currentEpisode.episodesId} controlsList="nodownload" />
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
                    <PDFViewer pdfUrl={getPdfUrl(currentEpisode) || ''} title={currentEpisode.title} />
                  )}
                  {contentType === 'gallery' && (
                    <GalleryViewer images={getGalleryImages(currentEpisode)} title={currentEpisode.title} />
                  )}
                  {contentType === 'none' && (
                    <div className="text-center py-4 text-muted">
                      <Icon icon="mingcute:file-line" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                      <p className="mt-2 mb-0 small">Bu bölüm için içerik bulunamadı</p>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                {(() => {
                  const prevEpisode = getPreviousEpisode()
                  const nextEpisode = getNextEpisode()
                  if (!prevEpisode && !nextEpisode) return null
                  
                  return (
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-3 pt-3 border-top" style={{ borderColor: 'rgba(var(--bs-primary-rgb), 0.1) !important' }}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handlePreviousEpisode}
                        disabled={!prevEpisode}
                        className="d-flex align-items-center justify-content-center gap-1"
                        style={{
                          flex: '1 1 0',
                          borderRadius: '10px',
                          borderWidth: '1.5px',
                          fontWeight: '500',
                          fontSize: '0.8rem',
                          padding: '0.5rem',
                          opacity: prevEpisode ? 1 : 0.5,
                        }}
                      >
                        <Icon icon="mingcute:arrow-left-line" style={{ fontSize: '1rem' }} />
                        <span className="d-none d-sm-inline">Önceki</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleNextEpisode}
                        disabled={!nextEpisode}
                        className="d-flex align-items-center justify-content-center gap-1"
                        style={{
                          flex: '1 1 0',
                          borderRadius: '10px',
                          fontWeight: '500',
                          fontSize: '0.8rem',
                          padding: '0.5rem',
                          opacity: nextEpisode ? 1 : 0.5,
                        }}
                      >
                        <span className="d-none d-sm-inline">Sonraki</span>
                        <Icon icon="mingcute:arrow-right-line" style={{ fontSize: '1rem' }} />
                      </Button>
                    </div>
                  )
                })()}

                {/* Notes & Questions Toggle */}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowNotesAndQuestions(!showNotesAndQuestions)}
                  className="w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{ borderRadius: '10px', borderWidth: '1.5px', fontWeight: '500', fontSize: '0.8rem' }}
                >
                  <Icon icon={showNotesAndQuestions ? 'mingcute:up-line' : 'mingcute:notebook-3-line'} style={{ fontSize: '1rem' }} />
                  <span>Not ve Soru</span>
                  {existingNote && (
                    <span className="badge" style={{ fontSize: '0.6rem', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.15)', color: 'var(--bs-primary)', borderRadius: '6px' }}>
                      Not Var
                    </span>
                  )}
                  {existingQuestion && (
                    <span className="badge" style={{ fontSize: '0.6rem', backgroundColor: 'rgba(var(--bs-warning-rgb), 0.15)', color: 'var(--bs-warning)', borderRadius: '6px' }}>
                      Soru Var
                    </span>
                  )}
                </Button>

                {/* Notes & Questions Collapse */}
                <Collapse in={showNotesAndQuestions}>
                  <div>
                    <Row className="g-2 mt-2">
                      {/* Notes Section */}
                      <Col xs={12} md={6}>
                        <Card className="border h-100" style={{ borderRadius: '12px', borderColor: 'rgba(var(--bs-primary-rgb), 0.15)' }}>
                          <CardBody className="p-2 p-md-3">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <div className="d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)' }}>
                                <Icon icon="mingcute:notebook-3-line" style={{ fontSize: '0.9rem', color: 'var(--bs-primary)' }} />
                              </div>
                              <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.85rem' }}>Notlarım</h6>
                              {existingNote && (
                                <span className="badge ms-auto" style={{ fontSize: '0.6rem', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)', borderRadius: '6px' }}>
                                  <Icon icon="mingcute:check-fill" className="me-1" style={{ fontSize: '0.55rem' }} />
                                  Kaydedildi
                                </span>
                              )}
                            </div>
                            <Form.Group className="mb-2">
                              <Form.Control
                                type="text"
                                placeholder="Not başlığı"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                size="sm"
                                className="mb-2"
                                style={{ fontSize: '0.8rem', borderRadius: '8px', borderColor: 'rgba(var(--bs-primary-rgb), 0.15)' }}
                              />
                              <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Notlarınızı yazın..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                style={{ resize: 'vertical', fontSize: '0.8rem', minHeight: '60px', borderRadius: '8px', borderColor: 'rgba(var(--bs-primary-rgb), 0.15)' }}
                              />
                            </Form.Group>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleSaveNote}
                              disabled={noteLoading || !noteText.trim()}
                              className="w-100 d-flex align-items-center justify-content-center gap-2"
                              style={{ fontSize: '0.8rem', borderRadius: '8px' }}
                            >
                              {noteLoading ? <Spinner animation="border" size="sm" /> : <Icon icon="mingcute:save-line" style={{ fontSize: '0.9rem' }} />}
                              <span>{existingNote ? 'Güncelle' : 'Kaydet'}</span>
                            </Button>
                          </CardBody>
                        </Card>
                      </Col>

                      {/* Questions Section */}
                      <Col xs={12} md={6}>
                        <Card className="border h-100" style={{ borderRadius: '12px', borderColor: 'rgba(var(--bs-warning-rgb), 0.15)' }}>
                          <CardBody className="p-2 p-md-3">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <div className="d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(var(--bs-warning-rgb), 0.1)' }}>
                                <Icon icon="mingcute:question-line" style={{ fontSize: '0.9rem', color: 'var(--bs-warning)' }} />
                              </div>
                              <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.85rem' }}>Soru Sor</h6>
                              <span className="badge ms-auto" style={{ fontSize: '0.6rem', backgroundColor: existingQuestion ? 'rgba(var(--bs-primary-rgb), 0.1)' : 'rgba(var(--bs-warning-rgb), 0.1)', color: existingQuestion ? 'var(--bs-primary)' : 'var(--bs-warning)', borderRadius: '6px' }}>
                                {existingQuestion ? 'Gönderildi' : "Admin'e Gönderilir"}
                              </span>
                            </div>
                            {existingQuestion ? (
                              <div className="border rounded p-2" style={{ backgroundColor: 'rgba(var(--bs-primary-rgb), 0.02)', borderRadius: '8px', borderColor: 'rgba(var(--bs-primary-rgb), 0.1)' }}>
                                <p className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>{existingQuestion.questionText}</p>
                                {existingQuestion.isAnswered && existingQuestion.answer && (
                                  <div className="mt-2 pt-2 border-top">
                                    <div className="d-flex align-items-center gap-1 mb-1">
                                      <Icon icon="mingcute:check-fill" style={{ fontSize: '0.75rem', color: 'var(--bs-primary)' }} />
                                      <span className="fw-semibold" style={{ color: 'var(--bs-primary)', fontSize: '0.75rem' }}>Cevap</span>
                                    </div>
                                    <p className="mb-0" style={{ fontSize: '0.75rem' }}>{existingQuestion.answer.answerText}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <Form.Group className="mb-2">
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Sorunuzu yazın..."
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    style={{ resize: 'vertical', fontSize: '0.8rem', minHeight: '60px', borderRadius: '8px', borderColor: 'rgba(var(--bs-warning-rgb), 0.15)' }}
                                  />
                                </Form.Group>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={handleSubmitQuestion}
                                  disabled={questionLoading || !questionText.trim()}
                                  className="w-100 d-flex align-items-center justify-content-center gap-2"
                                  style={{ fontSize: '0.8rem', borderRadius: '8px', color: '#1a1a1a' }}
                                >
                                  {questionLoading ? <Spinner animation="border" size="sm" /> : <Icon icon="mingcute:send-line" style={{ fontSize: '0.9rem' }} />}
                                  <span>Gönder</span>
                                </Button>
                              </>
                            )}
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Collapse>
              </CardBody>
            </Card>
          </div>
        )
      })()}

      <Row className="g-3">
        {/* Series List - Left Side */}
        <Col xs={12} md={4} lg={3} className="order-2 order-md-1">
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <CardBody className="p-3">
              <h6 className="mb-3 fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                <Icon icon="mingcute:list-check-line" style={{ color: 'var(--bs-primary)' }} />
                Podcast Serileri
              </h6>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" style={{ color: 'var(--bs-primary)' }} />
                </div>
              ) : seriesList.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <Icon icon="mingcute:headphone-line" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                  <p className="mt-2 mb-0 small">Henüz erişiminiz olan seri bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {seriesList.map((series) => (
                    <button
                      key={series.seriesId}
                      className="btn text-start p-2 border-0"
                      onClick={() => handleSeriesSelect(series)}
                      style={{
                        borderRadius: '10px',
                        transition: 'all 0.2s ease',
                        backgroundColor: selectedSeries?.seriesId === series.seriesId ? 'var(--bs-primary)' : 'transparent',
                        color: selectedSeries?.seriesId === series.seriesId ? '#ffffff' : 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedSeries?.seriesId !== series.seriesId) {
                          e.currentTarget.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.08)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedSeries?.seriesId !== series.seriesId) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: selectedSeries?.seriesId === series.seriesId ? 'rgba(255,255,255,0.2)' : 'rgba(var(--bs-primary-rgb), 0.1)',
                          }}
                        >
                          <Icon
                            icon={series.isVideo ? 'mingcute:video-line' : 'mingcute:headphone-line'}
                            style={{ fontSize: '1rem', color: selectedSeries?.seriesId === series.seriesId ? '#ffffff' : 'var(--bs-primary)' }}
                          />
                        </div>
                        <div className="min-w-0 flex-grow-1 overflow-hidden">
                          <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem' }}>{series.title}</div>
                          {series.description && (
                            <div 
                              className="small" 
                              style={{ 
                                fontSize: '0.7rem', 
                                opacity: selectedSeries?.seriesId === series.seriesId ? 0.8 : 0.6,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: '1.3',
                                maxWidth: '100%',
                              }}
                            >
                              {series.description.length > 40 ? `${series.description.substring(0, 40)}...` : series.description}
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

        {/* Episodes List - Right Side */}
        <Col xs={12} md={8} lg={9} className="order-1 order-md-2">
          {!selectedSeries ? (
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="text-center text-muted py-5">
                <Icon icon="mingcute:headphone-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                <p className="mt-3 mb-0 small">Lütfen bir seri seçin</p>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="p-3">
                <div className="mb-3">
                  <h5 className="mb-1 fw-semibold" style={{ fontSize: '1rem' }}>{selectedSeries.title}</h5>
                  {selectedSeries.description && (
                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>{selectedSeries.description}</p>
                  )}
                </div>

                {episodesLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" style={{ color: 'var(--bs-primary)' }} />
                  </div>
                ) : episodes.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <Icon icon="mingcute:file-list-line" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                    <p className="mt-2 mb-0 small">Henüz erişebileceğiniz bölüm bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div>
                    {/* Current Episode */}
                    {episodes[0]?.lastAccessedAt && (
                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Icon icon="mingcute:time-line" style={{ fontSize: '0.9rem', color: 'var(--bs-primary)' }} />
                          <span className="small fw-semibold text-muted" style={{ fontSize: '0.75rem' }}>Son Dinlenen</span>
                        </div>
                        <div
                          className="card border p-2 p-md-3"
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderRadius: '12px',
                            borderColor: 'rgba(var(--bs-primary-rgb), 0.2)',
                            background: 'linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.03) 0%, rgba(var(--bs-primary-rgb), 0.06) 100%)',
                          }}
                          onClick={() => handleEpisodeClick(episodes[0])}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--bs-primary)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--bs-primary-rgb), 0.15)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb), 0.2)'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: '36px', height: '36px', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)' }}
                            >
                              <Icon
                                icon={getContentIcon(getContentType(episodes[0]))}
                                style={{ fontSize: '1rem', color: 'var(--bs-primary)' }}
                              />
                            </div>
                            <div className="min-w-0 flex-grow-1">
                              <div className="fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>{episodes[0].title}</div>
                              <div className="d-flex align-items-center flex-wrap gap-2 mt-1">
                                <span className="badge" style={{ backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)', fontSize: '0.7rem', borderRadius: '6px' }}>
                                  Bölüm {episodes[0].sequenceNumber}
                                </span>
                                {episodes[0].duration && (
                                  <span className="text-muted d-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                                    <Icon icon="mingcute:time-line" className="me-1" style={{ fontSize: '0.75rem' }} />
                                    {formatDuration(episodes[0].duration)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other Episodes */}
                    {episodes.filter((ep) => !ep.lastAccessedAt).length > 0 && (
                      <div>
                        <button
                          className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2 mb-2"
                          onClick={() => setShowOtherEpisodes(!showOtherEpisodes)}
                        >
                          <Icon icon={showOtherEpisodes ? 'mingcute:arrow-up-line' : 'mingcute:arrow-down-line'} style={{ color: 'var(--bs-primary)', fontSize: '0.9rem' }} />
                          <span className="small fw-semibold text-muted" style={{ fontSize: '0.75rem' }}>
                            Diğer Bölümler ({episodes.filter((ep) => !ep.lastAccessedAt).length})
                          </span>
                        </button>

                        {showOtherEpisodes && (
                          <div className="d-flex flex-column gap-2">
                            {episodes.filter((ep) => !ep.lastAccessedAt).map((episode) => (
                              <div
                                key={episode.episodesId}
                                className="card border p-2"
                                style={{
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  borderRadius: '10px',
                                  borderColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                                }}
                                onClick={() => handleEpisodeClick(episode)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--bs-primary)'
                                  e.currentTarget.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.03)'
                                  e.currentTarget.style.transform = 'translateX(4px)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb), 0.1)'
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                  e.currentTarget.style.transform = 'translateX(0)'
                                }}
                              >
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{ width: '36px', height: '36px', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)' }}
                                  >
                                    <Icon
                                      icon={getContentIcon(getContentType(episode))}
                                      style={{ fontSize: '1rem', color: 'var(--bs-primary)' }}
                                    />
                                  </div>
                                  <div className="min-w-0 flex-grow-1">
                                    <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem' }}>{episode.title}</div>
                                    <div className="d-flex align-items-center flex-wrap gap-2 mt-1">
                                      <span className="badge" style={{ backgroundColor: 'rgba(var(--bs-secondary-rgb), 0.1)', color: 'var(--bs-secondary)', fontSize: '0.65rem', borderRadius: '6px' }}>
                                        Bölüm {episode.sequenceNumber}
                                      </span>
                                      {episode.duration && (
                                        <span className="text-muted d-flex align-items-center" style={{ fontSize: '0.65rem' }}>
                                          <Icon icon="mingcute:time-line" className="me-1" style={{ fontSize: '0.7rem' }} />
                                          {formatDuration(episode.duration)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
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

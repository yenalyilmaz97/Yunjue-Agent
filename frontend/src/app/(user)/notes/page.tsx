import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/context/useAuthContext'
import { notesService, podcastService } from '@/services'
import type { Note } from '@/types/keci'
import { Card, CardBody, Row, Col, Spinner, Button, Collapse } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'

interface GroupedNotes {
  seriesId: number
  seriesTitle: string
  notes: Note[]
}

const NotesPage = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [groupedNotes, setGroupedNotes] = useState<GroupedNotes[]>([])
  const [selectedSeries, setSelectedSeries] = useState<GroupedNotes | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set())

  // Notları yükle ve serilere göre grupla
  useEffect(() => {
    const loadNotes = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const userId = parseInt(user.id)
        const notes = await notesService.getNotesByUser(userId)
        
        // Sadece episode notlarını al (seri bilgisi olanlar)
        const episodeNotes = notes.filter((note) => note.episodeId && note.seriesTitle)

        // Serilere göre grupla
        const grouped: { [key: string]: GroupedNotes } = {}
        
        episodeNotes.forEach((note) => {
          if (note.seriesTitle && note.episodeId) {
            const key = note.seriesTitle
            if (!grouped[key]) {
              grouped[key] = {
                seriesId: 0, // Series ID'yi bulmak için podcastService kullanılabilir
                seriesTitle: note.seriesTitle,
                notes: [],
              }
            }
            grouped[key].notes.push(note)
          }
        })

        // Her seri için seriesId'yi bul
        const seriesPromises = Object.values(grouped).map(async (group) => {
          try {
            const allSeries = await podcastService.getAllSeries()
            const series = allSeries.find((s) => s.title === group.seriesTitle)
            if (series) {
              group.seriesId = series.seriesId
            }
          } catch (error) {
            console.error('Error finding series:', error)
          }
          return group
        })

        const groupedWithSeries = await Promise.all(seriesPromises)
        
        // En son güncellenen notlara göre sırala
        groupedWithSeries.sort((a, b) => {
          const aLastUpdate = a.notes[0]?.updatedAt || a.notes[0]?.createdAt || ''
          const bLastUpdate = b.notes[0]?.updatedAt || b.notes[0]?.createdAt || ''
          return new Date(bLastUpdate).getTime() - new Date(aLastUpdate).getTime()
        })

        // Notları her seri içinde güncelleme tarihine göre sırala
        groupedWithSeries.forEach((group) => {
          group.notes.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt).getTime()
            const dateB = new Date(b.updatedAt || b.createdAt).getTime()
            return dateB - dateA
          })
        })

        setGroupedNotes(groupedWithSeries)

        // İlk seriyi otomatik seç
        if (groupedWithSeries.length > 0) {
          setSelectedSeries(groupedWithSeries[0])
        }
      } catch (error) {
        console.error('Error loading notes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [user])

  const handleSeriesSelect = (series: GroupedNotes) => {
    setSelectedSeries(series)
  }

  const handleNoteClick = (note: Note) => {
    // Kartı aç/kapat
    const newExpanded = new Set(expandedNotes)
    if (newExpanded.has(note.noteId)) {
      newExpanded.delete(note.noteId)
    } else {
      newExpanded.add(note.noteId)
    }
    setExpandedNotes(newExpanded)
  }

  const handleGoToEpisode = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    if (note.episodeId && note.seriesTitle) {
      // Note'un seri ID'sini bul
      let seriesId = selectedSeries?.seriesId
      if (!seriesId || selectedSeries?.seriesTitle !== note.seriesTitle) {
        // Eğer seçili seri bu note'un serisi değilse, seriyi bul
        try {
          const allSeries = await podcastService.getAllSeries()
          const series = allSeries.find((s) => s.title === note.seriesTitle)
          if (series) {
            seriesId = series.seriesId
          }
        } catch (error) {
          console.error('Error finding series:', error)
        }
      }
      
      navigate('/podcasts', {
        state: {
          episodeId: note.episodeId,
          seriesId: seriesId,
        },
      })
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <PageTitle subName="KeciApp" title="Notlarım" />

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
              ) : groupedNotes.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <Icon icon="mingcute:notebook-3-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                  <p className="mt-2 mb-0">Henüz not bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {groupedNotes.map((series, index) => (
                    <button
                      key={index}
                      className={`list-group-item list-group-item-action border-0 px-0 py-2 ${
                        selectedSeries?.seriesTitle === series.seriesTitle ? 'active' : ''
                      }`}
                      onClick={() => handleSeriesSelect(series)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <Icon
                          icon="mingcute:notebook-3-line"
                          className={selectedSeries?.seriesTitle === series.seriesTitle ? 'text-white' : 'text-primary'}
                          style={{ fontSize: '1.5rem', flexShrink: 0 }}
                        />
                        <div className="flex-grow-1 text-start">
                          <div
                            className={`fw-semibold ${
                              selectedSeries?.seriesTitle === series.seriesTitle ? 'text-white' : ''
                            }`}
                          >
                            {series.seriesTitle}
                          </div>
                          <div
                            className={`small ${
                              selectedSeries?.seriesTitle === series.seriesTitle ? 'text-white-50' : 'text-muted'
                            }`}
                          >
                            {series.notes.length} not
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Sağ taraf - Notlar Listesi */}
        <Col xs={12} md={8} lg={9} className="order-1 order-md-2">
          {!selectedSeries ? (
            <Card>
              <CardBody>
                <div className="text-center text-muted py-5">
                  <Icon icon="mingcute:notebook-3-line" style={{ fontSize: '4rem', opacity: 0.3 }} />
                  <p className="mt-3 mb-0">Lütfen bir seri seçin</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="mb-1 fw-semibold">{selectedSeries.seriesTitle}</h5>
                    <p className="text-muted small mb-0">{selectedSeries.notes.length} not</p>
                  </div>
                </div>

                {selectedSeries.notes.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <Icon icon="mingcute:file-list-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                    <p className="mt-2 mb-0">Bu seride henüz not bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {selectedSeries.notes.map((note) => {
                      const isExpanded = expandedNotes.has(note.noteId)
                      return (
                        <div
                          key={note.noteId}
                          className="list-group-item border rounded mb-2 p-0"
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            overflow: 'hidden',
                          }}
                          onClick={() => handleNoteClick(note)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa'
                            e.currentTarget.style.borderColor = '#0d6efd'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white'
                            e.currentTarget.style.borderColor = '#dee2e6'
                          }}
                        >
                          {/* Card Header - Always Visible */}
                          <div className="p-3">
                            <div className="d-flex align-items-start gap-2 mb-2">
                              <div
                                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: '36px', height: '36px' }}
                              >
                                <Icon icon="mingcute:notebook-3-line" style={{ fontSize: '1.1rem' }} />
                              </div>
                              <div className="flex-grow-1 min-w-0">
                                <div className="d-flex align-items-center justify-content-between gap-2">
                                  <h6 className="mb-1 fw-semibold">{note.title || note.episodeTitle || 'Not'}</h6>
                                  <Icon
                                    icon={isExpanded ? 'mingcute:up-line' : 'mingcute:down-line'}
                                    style={{ fontSize: '1.2rem', color: 'var(--bs-primary)', flexShrink: 0 }}
                                  />
                                </div>
                                {note.episodeTitle && note.episodeTitle !== note.title && (
                                  <p className="text-muted small mb-1">Bölüm: {note.episodeTitle}</p>
                                )}
                                {!isExpanded && (
                                  <p className="text-muted small mb-0" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                                    {note.noteText.length > 150 ? `${note.noteText.substring(0, 150)}...` : note.noteText}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                              <span className="text-muted small">
                                <Icon icon="mingcute:time-line" className="me-1" style={{ fontSize: '0.875rem' }} />
                                <span className="d-none d-sm-inline">{formatDateTime(note.updatedAt || note.createdAt)}</span>
                                <span className="d-inline d-sm-none">{formatDate(note.updatedAt || note.createdAt)}</span>
                              </span>
                              {note.episodeId && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={(e) => handleGoToEpisode(note, e)}
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  <Icon icon="mingcute:arrow-right-line" className="me-1" />
                                  Bölüme Git
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Expanded Content */}
                          <Collapse in={isExpanded}>
                            <div>
                              <div className="px-3 pb-3 border-top bg-light">
                                <div className="pt-3">
                                  <h6 className="small fw-semibold mb-2 text-muted">Not Detayı</h6>
                                  <p className="mb-0" style={{ fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {note.noteText}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Collapse>
                        </div>
                      )
                    })}
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

export default NotesPage

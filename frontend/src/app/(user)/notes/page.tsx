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
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <CardBody className="p-3">
              <h6 className="mb-3 fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                <Icon icon="mingcute:notebook-line" style={{ color: 'var(--bs-primary)' }} />
                Podcast Serileri
              </h6>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" style={{ color: 'var(--bs-primary)' }} />
                </div>
              ) : groupedNotes.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <Icon icon="mingcute:notebook-line" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                  <p className="mt-2 mb-0 small">Henüz not bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {groupedNotes.map((series, index) => {
                    const isSelected = selectedSeries?.seriesTitle === series.seriesTitle
                    return (
                      <button
                        key={index}
                        className="btn text-start p-2 border-0"
                        onClick={() => handleSeriesSelect(series)}
                        style={{
                          borderRadius: '10px',
                          transition: 'all 0.2s ease',
                          backgroundColor: isSelected ? 'var(--bs-primary)' : 'transparent',
                          color: isSelected ? '#ffffff' : 'inherit',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.08)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
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
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(var(--bs-primary-rgb), 0.1)',
                            }}
                          >
                            <Icon
                              icon="mingcute:notebook-line"
                              style={{ fontSize: '1rem', color: isSelected ? '#ffffff' : 'var(--bs-primary)' }}
                            />
                          </div>
                          <div className="min-w-0 flex-grow-1 text-start">
                            <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem' }}>
                              {series.seriesTitle}
                            </div>
                            <div 
                              className="small" 
                              style={{ 
                                fontSize: '0.7rem', 
                                opacity: isSelected ? 0.8 : 0.6,
                              }}
                            >
                              {series.notes.length} not
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Sağ taraf - Notlar Listesi */}
        <Col xs={12} md={8} lg={9} className="order-1 order-md-2">
          {!selectedSeries ? (
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="text-center text-muted py-5">
                <Icon icon="mingcute:notebook-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                <p className="mt-3 mb-0 small">Lütfen bir seri seçin</p>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="p-3">
                <div className="mb-3">
                  <h5 className="mb-1 fw-semibold" style={{ fontSize: '1rem' }}>{selectedSeries.seriesTitle}</h5>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>{selectedSeries.notes.length} not</p>
                </div>

                {selectedSeries.notes.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <Icon icon="mingcute:file-list-line" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                    <p className="mt-2 mb-0 small">Bu seride henüz not bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {selectedSeries.notes.map((note) => {
                      const isExpanded = expandedNotes.has(note.noteId)
                      return (
                        <div
                          key={note.noteId}
                          className="card border p-0"
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            overflow: 'hidden',
                            borderRadius: '12px',
                            borderColor: isExpanded ? 'var(--bs-primary)' : 'rgba(var(--bs-primary-rgb), 0.1)',
                            background: isExpanded ? 'linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.03) 0%, rgba(var(--bs-primary-rgb), 0.06) 100%)' : 'transparent',
                          }}
                          onClick={() => handleNoteClick(note)}
                          onMouseEnter={(e) => {
                            if (!isExpanded) {
                              e.currentTarget.style.borderColor = 'var(--bs-primary)'
                              e.currentTarget.style.background = 'rgba(var(--bs-primary-rgb), 0.03)'
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--bs-primary-rgb), 0.1)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isExpanded) {
                              e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb), 0.1)'
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }
                          }}
                        >
                          {/* Card Header - Always Visible */}
                          <div className="p-2 p-md-3">
                            <div className="d-flex align-items-start gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ 
                                  width: '36px', 
                                  height: '36px',
                                  backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                                }}
                              >
                                <Icon icon="mingcute:notebook-line" style={{ fontSize: '1rem', color: 'var(--bs-primary)' }} />
                              </div>
                              <div className="flex-grow-1 min-w-0">
                                <div className="d-flex align-items-center justify-content-between gap-2">
                                  <h6 className="mb-0 fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>
                                    {note.title || note.episodeTitle || 'Not'}
                                  </h6>
                                  <Icon
                                    icon={isExpanded ? 'mingcute:up-line' : 'mingcute:down-line'}
                                    style={{ fontSize: '1rem', color: 'var(--bs-primary)', flexShrink: 0 }}
                                  />
                                </div>
                                {note.episodeTitle && note.episodeTitle !== note.title && (
                                  <p className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>Bölüm: {note.episodeTitle}</p>
                                )}
                                {!isExpanded && (
                                  <p className="text-muted mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                    {note.noteText.length > 100 ? `${note.noteText.substring(0, 100)}...` : note.noteText}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(var(--bs-primary-rgb), 0.08)' }}>
                              <span className="text-muted d-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                                <Icon icon="mingcute:time-line" className="me-1" style={{ fontSize: '0.75rem' }} />
                                <span className="d-none d-sm-inline">{formatDateTime(note.updatedAt || note.createdAt)}</span>
                                <span className="d-inline d-sm-none">{formatDate(note.updatedAt || note.createdAt)}</span>
                              </span>
                              {note.episodeId && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={(e) => handleGoToEpisode(note, e)}
                                  className="d-flex align-items-center gap-1"
                                  style={{ 
                                    fontSize: '0.7rem', 
                                    borderRadius: '8px',
                                    padding: '0.25rem 0.5rem',
                                    borderWidth: '1.5px',
                                    borderColor: 'rgba(var(--bs-primary-rgb), 0.4)',
                                    color: 'rgba(var(--bs-primary-rgb), 0.8)',
                                    backgroundColor: 'rgba(var(--bs-primary-rgb), 0.05)',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb), 0.6)'
                                    e.currentTarget.style.color = 'var(--bs-primary)'
                                    e.currentTarget.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.1)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb), 0.4)'
                                    e.currentTarget.style.color = 'rgba(var(--bs-primary-rgb), 0.8)'
                                    e.currentTarget.style.backgroundColor = 'rgba(var(--bs-primary-rgb), 0.05)'
                                  }}
                                >
                                  <span className="d-none d-sm-inline">Bölüme Git</span>
                                  <Icon icon="mingcute:arrow-right-line" style={{ fontSize: '0.85rem' }} />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Expanded Content */}
                          <Collapse in={isExpanded}>
                            <div>
                              <div 
                                className="px-2 px-md-3 pb-2 pb-md-3" 
                                style={{ 
                                  borderTop: '1px solid rgba(var(--bs-primary-rgb), 0.1)',
                                  background: 'rgba(var(--bs-primary-rgb), 0.02)',
                                }}
                              >
                                <div className="pt-2 pt-md-3">
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <Icon icon="mingcute:document-line" style={{ fontSize: '0.85rem', color: 'var(--bs-primary)' }} />
                                    <span className="fw-semibold text-muted" style={{ fontSize: '0.75rem' }}>Not Detayı</span>
                                  </div>
                                  <p className="mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
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

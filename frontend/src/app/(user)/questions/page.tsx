import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/context/useAuthContext'
import { questionsService, podcastService } from '@/services'
import type { Question } from '@/types/keci'
import { Card, CardBody, Row, Col, Spinner, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'

interface GroupedQuestions {
  seriesId: number
  seriesTitle: string
  questions: Question[]
}

const QuestionsPage = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [groupedQuestions, setGroupedQuestions] = useState<GroupedQuestions[]>([])
  const [selectedSeries, setSelectedSeries] = useState<GroupedQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  // Soruları yükle ve serilere göre grupla
  useEffect(() => {
    const loadQuestions = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const userId = parseInt(user.id)
        const questions = await questionsService.getQuestionsByUser(userId)
        
        // Sadece episode sorularını al (seri bilgisi olanlar)
        const episodeQuestions = questions.filter((q) => q.episodeId && q.seriesTitle)

        // Serilere göre grupla
        const grouped: { [key: string]: GroupedQuestions } = {}
        
        episodeQuestions.forEach((question) => {
          if (question.seriesTitle && question.episodeId) {
            const key = question.seriesTitle
            if (!grouped[key]) {
              grouped[key] = {
                seriesId: 0,
                seriesTitle: question.seriesTitle,
                questions: [],
              }
            }
            grouped[key].questions.push(question)
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
        
        // En son sorulan sorulara göre sırala
        groupedWithSeries.sort((a, b) => {
          const aLastQuestion = a.questions[0]?.createdAt || ''
          const bLastQuestion = b.questions[0]?.createdAt || ''
          return new Date(bLastQuestion).getTime() - new Date(aLastQuestion).getTime()
        })

        // Soruları her seri içinde tarihe göre sırala
        groupedWithSeries.forEach((group) => {
          group.questions.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            return dateB - dateA
          })
        })

        setGroupedQuestions(groupedWithSeries)

        // İlk seriyi otomatik seç
        if (groupedWithSeries.length > 0) {
          setSelectedSeries(groupedWithSeries[0])
        }
      } catch (error) {
        console.error('Error loading questions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [user])

  const handleSeriesSelect = (series: GroupedQuestions) => {
    setSelectedSeries(series)
  }

  const handleQuestionClick = (question: Question) => {
    // Kartı aç/kapat
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(question.questionId)) {
      newExpanded.delete(question.questionId)
    } else {
      newExpanded.add(question.questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const handleGoToEpisode = async (question: Question, e: React.MouseEvent) => {
    e.stopPropagation()
    if (question.episodeId && question.seriesTitle) {
      // Question'un seri ID'sini bul
      let seriesId: number | undefined
      try {
        const allSeries = await podcastService.getAllSeries()
        const series = allSeries.find((s) => s.title === question.seriesTitle)
        if (series) {
          seriesId = series.seriesId
        }
      } catch (error) {
        console.error('Error finding series:', error)
      }
      
      navigate('/podcasts', {
        state: {
          episodeId: question.episodeId,
          seriesId: seriesId,
        },
      })
    } else if (question.articleId) {
      navigate(`/articles/${question.articleId}`)
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
      <PageTitle subName="KeciApp" title="Sorularım" />

      <Row className="g-3 g-md-4">
        {/* Sol taraf - Seriler Listesi */}
        <Col xs={12} md={4} lg={3} className="order-2 order-md-1">
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <CardBody className="p-3">
              <h6 className="mb-3 fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                <Icon icon="mingcute:question-line" style={{ color: 'var(--bs-primary)' }} />
                Podcast Serileri
              </h6>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" style={{ color: 'var(--bs-primary)' }} />
                </div>
              ) : groupedQuestions.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <Icon icon="mingcute:question-line" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                  <p className="mt-2 mb-0 small">Henüz soru bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {groupedQuestions.map((series, index) => {
                    const unansweredCount = series.questions.filter((q) => !q.isAnswered).length
                    const answeredCount = series.questions.filter((q) => q.isAnswered).length
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
                              backgroundColor: isSelected 
                                ? 'rgba(255,255,255,0.2)' 
                                : unansweredCount > 0 
                                  ? 'rgba(var(--bs-danger-rgb), 0.1)' 
                                  : 'rgba(var(--bs-success-rgb), 0.1)',
                            }}
                          >
                            <Icon
                              icon={unansweredCount > 0 ? 'mingcute:time-line' : 'mingcute:check-fill'}
                              style={{ 
                                fontSize: '1rem',
                                color: isSelected 
                                  ? '#ffffff' 
                                  : unansweredCount > 0 
                                    ? 'var(--bs-danger)' 
                                    : 'var(--bs-success)'
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-grow-1 text-start">
                            <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem' }}>
                              {series.seriesTitle}
                            </div>
                            <div className="d-flex align-items-center gap-1 flex-wrap" style={{ fontSize: '0.65rem' }}>
                              {unansweredCount > 0 && (
                                <span 
                                  className="badge" 
                                  style={{ 
                                    fontSize: '0.6rem',
                                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(var(--bs-danger-rgb), 0.15)',
                                    color: isSelected ? '#ffffff' : 'var(--bs-danger)',
                                  }}
                                >
                                  {unansweredCount} Beklemede
                                </span>
                              )}
                              {answeredCount > 0 && (
                                <span 
                                  className="badge" 
                                  style={{ 
                                    fontSize: '0.6rem',
                                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(var(--bs-success-rgb), 0.15)',
                                    color: isSelected ? '#ffffff' : 'var(--bs-success)',
                                  }}
                                >
                                  {answeredCount} Cevaplandı
                                </span>
                              )}
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

        {/* Sağ taraf - Sorular Listesi */}
        <Col xs={12} md={8} lg={9} className="order-1 order-md-2">
          {!selectedSeries ? (
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="text-center text-muted py-5">
                <Icon icon="mingcute:question-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                <p className="mt-3 mb-0 small">Lütfen bir seri seçin</p>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="p-3">
                <div className="mb-3">
                  <h5 className="mb-1 fw-semibold" style={{ fontSize: '1rem' }}>{selectedSeries.seriesTitle}</h5>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
                    {selectedSeries.questions.length} soru
                    {selectedSeries.questions.filter((q) => !q.isAnswered).length > 0 && (
                      <span className="ms-2" style={{ color: 'var(--bs-danger)' }}>
                        • {selectedSeries.questions.filter((q) => !q.isAnswered).length} beklemede
                      </span>
                    )}
                  </p>
                </div>

                {selectedSeries.questions.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <Icon icon="mingcute:file-list-line" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                    <p className="mt-2 mb-0 small">Bu seride henüz soru bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {selectedSeries.questions.map((question) => {
                      const isExpanded = expandedQuestions.has(question.questionId)
                      const accentColor = question.isAnswered ? '--bs-primary' : '--bs-warning'
                      const accentColorRgb = question.isAnswered ? '--bs-primary-rgb' : '--bs-warning-rgb'
                      
                      return (
                        <div
                          key={question.questionId}
                          className="card border p-0"
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            overflow: 'hidden',
                            borderRadius: '12px',
                            borderColor: isExpanded 
                              ? `var(${accentColor})` 
                              : `rgba(var(${accentColorRgb}), 0.15)`,
                            background: isExpanded 
                              ? `linear-gradient(135deg, rgba(var(${accentColorRgb}), 0.03) 0%, rgba(var(${accentColorRgb}), 0.06) 100%)` 
                              : 'transparent',
                          }}
                          onClick={() => handleQuestionClick(question)}
                          onMouseEnter={(e) => {
                            if (!isExpanded) {
                              e.currentTarget.style.borderColor = `var(${accentColor})`
                              e.currentTarget.style.background = `rgba(var(${accentColorRgb}), 0.03)`
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = `0 4px 12px rgba(var(${accentColorRgb}), 0.1)`
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isExpanded) {
                              e.currentTarget.style.borderColor = `rgba(var(${accentColorRgb}), 0.15)`
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }
                          }}
                        >
                          {/* Card Header */}
                          <div className="p-2 p-md-3">
                            <div className="d-flex align-items-start gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ 
                                  width: '36px', 
                                  height: '36px',
                                  backgroundColor: `rgba(var(${accentColorRgb}), 0.1)`,
                                }}
                              >
                                <Icon
                                  icon={question.isAnswered ? 'mingcute:check-fill' : 'mingcute:time-line'}
                                  style={{ fontSize: '1rem', color: `var(${accentColor})` }}
                                />
                              </div>
                              <div className="flex-grow-1 min-w-0">
                                <div className="d-flex align-items-center justify-content-between gap-2">
                                  <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <span 
                                      className="badge" 
                                      style={{ 
                                        fontSize: '0.65rem',
                                        backgroundColor: `rgba(var(${accentColorRgb}), 0.1)`,
                                        color: `var(${accentColor})`,
                                        borderRadius: '6px',
                                      }}
                                    >
                                      {question.isAnswered ? (
                                        <>
                                          <Icon icon="mingcute:check-fill" className="me-1" style={{ fontSize: '0.6rem' }} />
                                          Cevaplandı
                                        </>
                                      ) : (
                                        <>
                                          <Icon icon="mingcute:time-line" className="me-1" style={{ fontSize: '0.6rem' }} />
                                          Beklemede
                                        </>
                                      )}
                                    </span>
                                  </div>
                                  <Icon
                                    icon={isExpanded ? 'mingcute:up-line' : 'mingcute:down-line'}
                                    style={{ fontSize: '1rem', color: `var(${accentColor})`, flexShrink: 0 }}
                                  />
                                </div>
                                
                                {question.episodeTitle && (
                                  <p className="text-muted mb-1 d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                                    <Icon icon="mingcute:headphone-line" className="me-1" style={{ fontSize: '0.75rem' }} />
                                    {question.episodeTitle}
                                  </p>
                                )}
                                
                                {/* Soru Metni */}
                                <p className="text-muted mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                  {!isExpanded && question.questionText.length > 100
                                    ? `${question.questionText.substring(0, 100)}...`
                                    : question.questionText}
                                </p>

                                {/* Cevap - Sadece expanded durumda göster */}
                                {isExpanded && question.isAnswered && question.answer && (
                                  <div 
                                    className="mt-2 p-2 rounded" 
                                    style={{ 
                                      backgroundColor: 'rgba(var(--bs-primary-rgb), 0.05)',
                                      border: '1px solid rgba(var(--bs-primary-rgb), 0.1)',
                                      borderRadius: '8px',
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                      <Icon icon="mingcute:message-2-line" style={{ fontSize: '0.75rem', color: 'var(--bs-primary)' }} />
                                      <span className="fw-semibold" style={{ fontSize: '0.75rem', color: 'var(--bs-primary)' }}>Cevap</span>
                                      {question.answer.updatedAt && (
                                        <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                                          {formatDateTime(question.answer.updatedAt)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                      {question.answer.answerText}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="d-flex align-items-center justify-content-between mt-2 pt-2" style={{ borderTop: `1px solid rgba(var(${accentColorRgb}), 0.08)` }}>
                              <span className="text-muted d-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                                <Icon icon="mingcute:time-line" className="me-1" style={{ fontSize: '0.75rem' }} />
                                <span className="d-none d-sm-inline">{formatDateTime(question.createdAt)}</span>
                                <span className="d-inline d-sm-none">{formatDate(question.createdAt)}</span>
                              </span>
                              {question.episodeId && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={(e) => handleGoToEpisode(question, e)}
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

export default QuestionsPage

import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/context/useAuthContext'
import { questionsService, podcastService } from '@/services'
import type { Question } from '@/types/keci'
import { Card, CardBody, Row, Col, Spinner, Button, Badge } from 'react-bootstrap'
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

  const handleContentClick = (question: Question) => {
    if (question.episodeId) {
      navigate('/podcasts', {
        state: {
          episodeId: question.episodeId,
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
          <Card>
            <CardBody>
              <h5 className="mb-3 fw-semibold">Podcast Serileri</h5>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" className="text-primary" />
                </div>
              ) : groupedQuestions.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <Icon icon="mingcute:question-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                  <p className="mt-2 mb-0">Henüz soru bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {groupedQuestions.map((series, index) => {
                    const unansweredCount = series.questions.filter((q) => !q.isAnswered).length
                    const answeredCount = series.questions.filter((q) => q.isAnswered).length
                    
                    return (
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
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                              selectedSeries?.seriesTitle === series.seriesTitle
                                ? 'bg-white bg-opacity-20'
                                : unansweredCount > 0
                                  ? 'bg-danger bg-opacity-10'
                                  : 'bg-success bg-opacity-10'
                            }`}
                            style={{ width: '40px', height: '40px' }}
                          >
                            <Icon
                              icon={
                                unansweredCount > 0
                                  ? 'mingcute:time-line'
                                  : 'mingcute:check-fill'
                              }
                              className={
                                selectedSeries?.seriesTitle === series.seriesTitle
                                  ? 'text-white'
                                  : unansweredCount > 0
                                    ? 'text-danger'
                                    : 'text-success'
                              }
                              style={{ fontSize: '1.5rem' }}
                            />
                          </div>
                          <div className="flex-grow-1 text-start">
                            <div
                              className={`fw-semibold ${
                                selectedSeries?.seriesTitle === series.seriesTitle ? 'text-white' : ''
                              }`}
                            >
                              {series.seriesTitle}
                            </div>
                            <div
                              className={`small d-flex align-items-center gap-2 ${
                                selectedSeries?.seriesTitle === series.seriesTitle ? 'text-white-50' : 'text-muted'
                              }`}
                            >
                              {unansweredCount > 0 && (
                                <span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>
                                  {unansweredCount} Beklemede
                                </span>
                              )}
                              {answeredCount > 0 && (
                                <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>
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
            <Card>
              <CardBody>
                <div className="text-center text-muted py-5">
                  <Icon icon="mingcute:question-line" style={{ fontSize: '4rem', opacity: 0.3 }} />
                  <p className="mt-3 mb-0">Lütfen bir seri seçin</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1 fw-semibold">{selectedSeries.seriesTitle}</h5>
                    <p className="text-muted small mb-0">
                      {selectedSeries.questions.length} soru
                      {selectedSeries.questions.filter((q) => !q.isAnswered).length > 0 && (
                        <span className="text-danger ms-2">
                          • {selectedSeries.questions.filter((q) => !q.isAnswered).length} beklemede
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {selectedSeries.questions.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <Icon icon="mingcute:file-list-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                    <p className="mt-2 mb-0">Bu seride henüz soru bulunmamaktadır.</p>
                  </div>
                ) : (
                  <Row className="g-3">
                    {selectedSeries.questions.map((question) => (
                      <Col xs={12} key={question.questionId}>
                        <Card
                          className={`h-100 shadow-sm ${
                            question.isAnswered ? 'border-success border-opacity-50' : 'border-danger border-opacity-50'
                          }`}
                          style={{
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        >
                          <CardBody className="p-3">
                            {/* Soru Başlığı ve Durum */}
                            <div className="d-flex align-items-start gap-2 mb-3">
                              <div
                                className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                                  question.isAnswered ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'
                                }`}
                                style={{ width: '40px', height: '40px' }}
                              >
                                <Icon
                                  icon={question.isAnswered ? 'mingcute:check-fill' : 'mingcute:time-line'}
                                  className={question.isAnswered ? 'text-success' : 'text-danger'}
                                  style={{ fontSize: '1.25rem' }}
                                />
                              </div>
                              <div className="flex-grow-1 min-w-0">
                                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                  <h6 className="mb-0 fw-semibold flex-grow-1">{question.questionText}</h6>
                                  <Badge
                                    bg={question.isAnswered ? 'success' : 'danger'}
                                    className="flex-shrink-0"
                                    style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                                  >
                                    {question.isAnswered ? (
                                      <>
                                        <Icon icon="mingcute:check-fill" className="me-1" style={{ fontSize: '0.7rem' }} />
                                        Cevaplandı
                                      </>
                                    ) : (
                                      <>
                                        <Icon icon="mingcute:time-line" className="me-1" style={{ fontSize: '0.7rem' }} />
                                        Beklemede
                                      </>
                                    )}
                                  </Badge>
                                </div>
                                {question.episodeTitle && (
                                  <p className="text-muted small mb-1 d-flex align-items-center">
                                    <Icon icon="mingcute:headphone-line" className="me-1" style={{ fontSize: '0.875rem' }} />
                                    Bölüm: {question.episodeTitle}
                                  </p>
                                )}
                                <div className="mt-2">
                                  <span className="text-muted small d-flex align-items-center">
                                    <Icon icon="mingcute:time-line" className="me-1" style={{ fontSize: '0.875rem' }} />
                                    <span className="d-none d-sm-inline">{formatDateTime(question.createdAt)}</span>
                                    <span className="d-inline d-sm-none">{formatDate(question.createdAt)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Cevap Bölümü */}
                            {question.isAnswered && question.answer && (
                              <Card
                                className="bg-success bg-opacity-5 border-success border-opacity-25 mt-3"
                                style={{ borderWidth: '1px' }}
                              >
                                <CardBody className="p-2 p-md-3">
                                  <div className="d-flex align-items-start gap-2">
                                    <div
                                      className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                      style={{ width: '32px', height: '32px' }}
                                    >
                                      <Icon icon="mingcute:check-fill" style={{ fontSize: '1rem' }} />
                                    </div>
                                    <div className="flex-grow-1">
                                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                        <span className="fw-semibold small text-success d-flex align-items-center">
                                          <Icon icon="mingcute:message-2-line" className="me-1" style={{ fontSize: '0.875rem' }} />
                                          Cevap
                                        </span>
                                        {question.answer.updatedAt && (
                                          <span className="text-muted small">
                                            {formatDateTime(question.answer.updatedAt)}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-dark mb-0" style={{ lineHeight: '1.6', fontSize: '0.875rem' }}>
                                        {question.answer.answerText}
                                      </p>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            )}

                            {/* Alt Butonlar */}
                            {question.episodeId && (
                              <div className="mt-3 pt-2 border-top">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleContentClick(question)}
                                  className="w-100 w-sm-auto"
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  <Icon icon="mingcute:arrow-right-line" className="me-1" />
                                  Bölüme Git
                                </Button>
                              </div>
                            )}
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
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

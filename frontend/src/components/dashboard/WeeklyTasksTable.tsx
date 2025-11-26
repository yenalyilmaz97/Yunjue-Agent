import { Button, Badge, Modal, Card, CardBody, Nav, NavItem, NavLink, TabContainer, TabContent, TabPane } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { weeklyService, weeklyQuestionAnswerService, userProgressService } from '@/services'
import type { WeeklyContent } from '@/types/keci'
import { useAuthContext } from '@/context/useAuthContext'
import type { AnswerWeeklyQuestionRequest } from '@/services/weeklyQuestionAnswer'
import type { CreateUserProgressRequest } from '@/services/userProgress'

const WeeklyTasksTable = () => {
  const { user } = useAuthContext()
  const [weeklyContent, setWeeklyContent] = useState<WeeklyContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [taskCompleted, setTaskCompleted] = useState(false)
  const [questionAnswered, setQuestionAnswered] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [questionAnswer, setQuestionAnswer] = useState('')
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [activeTab, setActiveTab] = useState('music')

  useEffect(() => {
    if (user?.id) {
      const userId = parseInt(user.id)
      Promise.all([
        weeklyService.getCurrentWeeklyContent(userId),
      ])
        .then(([weeklyData]) => {
          setWeeklyContent(weeklyData)
          
          // Kullanıcının görev durumunu UserProgress'ten kontrol et
          if (weeklyData?.weekId) {
            userProgressService
              .getUserProgressByUserIdAndWeekId(userId, weeklyData.weekId)
              .then((userProgress) => {
                setTaskCompleted(userProgress?.isCompleted || false)
              })
              .catch(() => {
                setTaskCompleted(false)
              })
          } else {
            setTaskCompleted(false)
          }
          
          // Soru yanıtının olup olmadığını kontrol et
          if (weeklyData?.weeklyQuestionId) {
            weeklyQuestionAnswerService
              .getWeeklyQuestionAnswerByUserAndQuestion(userId, weeklyData.weeklyQuestionId)
              .then(() => {
                setQuestionAnswered(true)
              })
              .catch(() => {
                setQuestionAnswered(false)
              })
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

  const handleTaskComplete = async () => {
    if (!user?.id || !weeklyContent) {
      return
    }

    try {
      const userId = parseInt(user.id)
      const request: CreateUserProgressRequest = {
        userId,
        weekId: weeklyContent.weekId,
        isCompleted: true,
      }
      await userProgressService.createOrUpdateUserProgress(request)
      setTaskCompleted(true)
    } catch (error) {
      console.error('Error completing task:', error)
      // TODO: Error toast göster
    }
  }

  const handleQuestionClick = () => {
    setShowQuestionModal(true)
  }

  const handleSubmitAnswer = async () => {
    if (!questionAnswer.trim() || !user?.id || !weeklyContent) {
      return
    }

    setSubmittingAnswer(true)
    try {
      const request: AnswerWeeklyQuestionRequest = {
        userId: parseInt(user.id),
        weeklyQuestionId: weeklyContent.weeklyQuestionId,
        weeklyQuestionAnswerText: questionAnswer.trim(),
      }
      await weeklyQuestionAnswerService.createWeeklyQuestionAnswer(request)
      setQuestionAnswered(true)
      setShowQuestionModal(false)
      setQuestionAnswer('')
    } catch (error) {
      console.error('Error submitting answer:', error)
      // TODO: Error toast göster
    } finally {
      setSubmittingAnswer(false)
    }
  }

  if (loading) {
    return (
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!weeklyContent) {
    return (
      <div className="mb-4">
        <div className="text-center text-muted py-4">
          <p>Henüz haftalık görev bulunmamaktadır.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <h5 className="mb-3">Haftalık Görevler</h5>
        <Card>
          <CardBody>
            <TabContainer activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'music')}>
              <Nav variant="tabs" className="border-bottom">
                <NavItem>
                  <NavLink eventKey="music">
                    <i className="bx bx-music me-2"></i>
                    <span className="d-none d-sm-inline">Müzik</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink eventKey="movie">
                    <i className="bx bx-movie me-2"></i>
                    <span className="d-none d-sm-inline">Film</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink eventKey="task">
                    <i className="bx bx-task me-2"></i>
                    <span className="d-none d-sm-inline">Görev</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink eventKey="question">
                    <i className="bx bx-question-mark me-2"></i>
                    <span className="d-none d-sm-inline">Soru</span>
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent className="pt-4">
                {/* Müzik Tab */}
                <TabPane eventKey="music">
                  <div>
                    <h6 className="mb-3">
                      <i className="bx bx-music me-2 text-primary"></i>
                      {weeklyContent.music?.musicTitle || 'Müzik bulunamadı'}
                    </h6>
                    {weeklyContent.music?.musicDescription && (
                      <p className="text-muted mb-3">{weeklyContent.music.musicDescription}</p>
                    )}
                    {weeklyContent.music?.musicURL && (
                      <div className="mt-3">
                        <Button
                          variant="primary"
                          as="a"
                          href={weeklyContent.music.musicURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="d-inline-flex align-items-center"
                        >
                          <i className="bx bx-headphone me-1"></i>Dinle
                        </Button>
                      </div>
                    )}
                  </div>
                </TabPane>

                {/* Film Tab */}
                <TabPane eventKey="movie">
                  <div>
                    <h6 className="mb-3">
                      <i className="bx bx-movie me-2 text-primary"></i>
                      {weeklyContent.movie?.movieTitle || 'Film bulunamadı'}
                    </h6>
                  </div>
                </TabPane>

                {/* Görev Tab */}
                <TabPane eventKey="task">
                  <div>
                    <h6 className="mb-3">
                      <i className="bx bx-task me-2 text-primary"></i>Görev
                    </h6>
                    <p
                      className="mb-3"
                      style={{
                        color: taskCompleted ? '#28a745' : '#dc3545',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                      }}>
                      {weeklyContent.task?.taskDescription || 'Görev bulunamadı'}
                    </p>
                    <div className="mt-3">
                      {taskCompleted ? (
                        <Badge bg="success" className="p-2">
                          <i className="bx bx-check me-1"></i>Yapıldı
                        </Badge>
                      ) : (
                        <Button variant="outline-primary" onClick={handleTaskComplete}>
                          <i className="bx bx-check me-1"></i>Yaptım
                        </Button>
                      )}
                    </div>
                  </div>
                </TabPane>

                {/* Soru Tab */}
                <TabPane eventKey="question">
                  <div>
                    <h6 className="mb-3">
                      <i className="bx bx-question-mark me-2 text-primary"></i>Soru
                    </h6>
                    <p className="mb-3">{weeklyContent.weeklyQuestion?.weeklyQuestionText || 'Soru bulunamadı'}</p>
                    <div className="mt-3">
                      {questionAnswered ? (
                        <Badge bg="success" className="p-2">
                          <i className="bx bx-check me-1"></i>Yanıtlandı
                        </Badge>
                      ) : (
                        <Button variant="primary" onClick={handleQuestionClick}>
                          <i className="bx bx-edit me-1"></i>Yanıtla
                        </Button>
                      )}
                    </div>
                  </div>
                </TabPane>
              </TabContent>
            </TabContainer>
          </CardBody>
        </Card>
      </div>

      {/* Soru Yanıtlama Modal */}
      <Modal show={showQuestionModal} onHide={() => setShowQuestionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Haftalık Soruya Yanıt Ver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Soru:</strong>
            <p className="mt-2">{weeklyContent.weeklyQuestion?.weeklyQuestionText}</p>
          </div>
          <div>
            <label htmlFor="questionAnswer" className="form-label">
              <strong>Yanıtınız:</strong>
            </label>
            <textarea
              id="questionAnswer"
              className="form-control"
              rows={5}
              value={questionAnswer}
              onChange={(e) => setQuestionAnswer(e.target.value)}
              placeholder="Yanıtınızı buraya yazın..."
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuestionModal(false)}>
            İptal
          </Button>
          <Button variant="primary" onClick={handleSubmitAnswer} disabled={!questionAnswer.trim() || submittingAnswer}>
            {submittingAnswer ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Gönderiliyor...
              </>
            ) : (
              'Gönder'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default WeeklyTasksTable


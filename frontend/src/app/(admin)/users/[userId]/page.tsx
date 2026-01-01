import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { userService, favoritesService, notesService, questionsService, weeklyQuestionAnswerService } from '@/services'
import type { User, Favorite, Note, Question } from '@/types/keci'
import type { WeeklyQuestionAnswerResponseDTO } from '@/services/weeklyQuestionAnswer'
import { Card, CardBody, CardHeader, CardTitle, Button, Row, Col, Nav, Modal, Form } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import DataTable from '@/components/table/DataTable'
import PasswordFormInput from '@/components/from/PasswordFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useI18n } from '@/i18n/context'

const UserDetailPage = () => {
  const { t } = useI18n()
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'favorites' | 'notes' | 'questions' | 'weeklyAnswers'>(
    (location.state as { activeTab?: 'favorites' | 'notes' | 'questions' | 'weeklyAnswers' })?.activeTab || 'favorites'
  )
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [weeklyAnswers, setWeeklyAnswers] = useState<WeeklyQuestionAnswerResponseDTO[]>([])
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailContent, setDetailContent] = useState<{
    title: string
    text: string
    type: 'note' | 'question' | 'weeklyAnswer'
    weeklyQuestion?: string
    weeklyAnswer?: string
    answer?: string
  } | null>(null)

  const resetSchema = yup.object({
    newPassword: yup.string().min(6, t('users.passwordMin')).required(t('users.enterNewPasswordRequired')),
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], t('users.passwordMatch'))
      .required(t('users.confirmNewPasswordRequired')),
  })

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    reset: resetResetForm,
    formState: { isSubmitting: isResetSubmitting },
  } = useForm<{ newPassword: string; confirmNewPassword: string }>({
    resolver: yupResolver(resetSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  })

  useEffect(() => {
    if (userId) {
      loadUserData()
    }
  }, [userId])

  const loadUserData = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [userData, favoritesData, notesData, questionsData, weeklyAnswersData] = await Promise.all([
        userService.getUserById(parseInt(userId)),
        favoritesService.getFavoritesByUser(parseInt(userId)),
        notesService.getNotesByUser(parseInt(userId)),
        questionsService.getQuestionsByUser(parseInt(userId)),
        weeklyQuestionAnswerService.getWeeklyQuestionAnswersByUser(parseInt(userId)),
      ])
      setUser(userData)
      setFavorites(favoritesData)
      setNotes(notesData)
      // Soruları en yeni üstte olacak şekilde sırala
      const sortedQuestions = [...questionsData].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
      setQuestions(sortedQuestions)
      setWeeklyAnswers(weeklyAnswersData)
    } finally {
      setLoading(false)
    }
  }

  const openResetModal = () => {
    setShowResetModal(true)
    resetResetForm({ newPassword: '', confirmNewPassword: '' })
  }

  const closeResetModal = () => setShowResetModal(false)

  const openDetailModal = (
    title: string,
    text: string,
    type: 'note' | 'question' | 'weeklyAnswer',
    weeklyQuestion?: string,
    weeklyAnswer?: string,
    answer?: string
  ) => {
    setDetailContent({ title, text, type, weeklyQuestion, weeklyAnswer, answer })
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setDetailContent(null)
  }

  const submitReset = handleResetSubmit(async (data) => {
    if (!user) return
    await userService.changePassword({ userId: user.userId, newPassword: data.newPassword })
    closeResetModal()
    alert(t('users.passwordResetSuccess'))
  })

  if (!user) {
    return (
      <>
        <PageTitle subName={t('pages.users')} title={t('users.userDetail')} />
        <Card>
          <CardBody>
            <p>{t('users.userNotFound')}</p>
            <Button variant="light" onClick={() => navigate('/admin/users')}>{t('users.goBack')}</Button>
          </CardBody>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageTitle subName={t('pages.users')} title={`${t('users.userDetail')} - ${user.userName}`} />

      {/* User Info Card */}
      <Card className="mb-3">
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <CardTitle as={'h5'} className="mb-0">{t('users.userInformation')}</CardTitle>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm" onClick={() => navigate('/admin/users/create', { state: { mode: 'edit', item: user } })}>
                <IconifyIcon icon="mdi:pencil" className="me-1" /> {t('common.edit')}
              </Button>
              <Button variant="outline-warning" size="sm" onClick={openResetModal}>
                <IconifyIcon icon="mdi:key-reset" className="me-1" /> {t('users.resetPassword')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <div className="mb-2"><strong>{t('users.userName')}:</strong> {user.userName}</div>
              <div className="mb-2"><strong>{t('users.email')}:</strong> {user.email}</div>
              <div className="mb-2"><strong>{t('users.firstName')}:</strong> {user.firstName}</div>
              <div className="mb-2"><strong>{t('users.lastName')}:</strong> {user.lastName}</div>
              <div className="mb-2"><strong>{t('users.role')}:</strong> {user.roleName}</div>
            </Col>
            <Col md={6}>
              <div className="mb-2"><strong>{t('users.city')}:</strong> {user.city || '-'}</div>
              <div className="mb-2"><strong>{t('users.phone')}:</strong> {user.phone || '-'}</div>
              <div className="mb-2"><strong>{t('users.dateOfBirth')}:</strong> {new Date(user.dateOfBirth).toLocaleDateString()}</div>
              <div className="mb-2"><strong>{t('users.gender')}:</strong> {user.gender ? t('users.male') : t('users.female')}</div>
              <div className="mb-2"><strong>{t('users.subscriptionEnd')}:</strong> {new Date(user.subscriptionEnd).toLocaleDateString()}</div>
              <div className="mb-2">
                <strong>{t('users.isKeci') || 'Keçi Üyesi'}:</strong>{' '}
                {user.keciTimeEnd ? (
                  <span className="text-success">{t('common.yes') || 'Evet'}</span>
                ) : (
                  <span className="text-danger">{t('common.no') || 'Hayır'}</span>
                )}
              </div>
              {user.keciTimeEnd && (
                <div className="mb-2">
                  <strong>{t('users.keciTimeEnd') || 'Keçi Süresi Bitiş'}:</strong>{' '}
                  {new Date(user.keciTimeEnd).toLocaleDateString()}
                </div>
              )}
              {user.description && <div className="mb-2"><strong>{t('users.description')}:</strong> {user.description}</div>}
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k as any)}>
            <Nav.Item>
              <Nav.Link eventKey="favorites">{t('users.favorites')} ({favorites.length})</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="notes">{t('users.notes')} ({notes.length})</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="questions">{t('users.questions')} ({questions.length})</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="weeklyAnswers">{t('users.weeklyAnswers')} ({weeklyAnswers.length})</Nav.Link>
            </Nav.Item>
          </Nav>
        </CardHeader>
        <CardBody>
          {activeTab === 'favorites' && (
            <DataTable
              isLoading={loading}
              data={favorites}
              rowKey={(r) => (r as Favorite).favoriteId}
              hideSearch
              columns={[
                { key: 'favoriteId', header: t('common.id') || 'ID', width: '80px', sortable: true },
                {
                  key: 'type',
                  header: t('users.type'),
                  render: (r) => {
                    const f = r as Favorite
                    if (f.episodeId) return t('users.episode')
                    if (f.articleId) return t('users.article')
                    if (f.affirmationId) return t('users.affirmation')
                    if (f.aphorismId) return t('users.aphorism')
                    return '-'
                  },
                },
                {
                  key: 'title',
                  header: t('common.title'),
                  render: (r) => {
                    const f = r as Favorite
                    return f.episodeTitle || f.articleTitle || f.affirmationText || f.aphorismText || '-'
                  },
                },
                {
                  key: 'seriesTitle',
                  header: t('users.series'),
                  render: (r) => (r as Favorite).seriesTitle || '-',
                },
                {
                  key: 'createdAt',
                  header: t('users.createdAt'),
                  render: (r) => new Date((r as Favorite).createdAt).toLocaleDateString(),
                },
              ]}
            />
          )}

          {activeTab === 'notes' && (
            <DataTable
              isLoading={loading}
              data={notes}
              rowKey={(r) => (r as Note).noteId}
              hideSearch
              columns={[
                { key: 'noteId', header: t('common.id') || 'ID', width: '80px', sortable: true },
                { key: 'title', header: t('common.title'), sortable: true },
                {
                  key: 'noteText',
                  header: t('users.note'),
                  render: (r) => {
                    const n = r as Note
                    return n.noteText.length > 100 ? `${n.noteText.substring(0, 100)}...` : n.noteText
                  },
                },
                { key: 'episodeTitle', header: t('users.episode'), render: (r) => (r as Note).episodeTitle || '-' },
                { key: 'seriesTitle', header: t('users.series'), render: (r) => (r as Note).seriesTitle || '-' },
                {
                  key: 'createdAt',
                  header: t('users.createdAt'),
                  render: (r) => new Date((r as Note).createdAt).toLocaleDateString(),
                },
                {
                  key: 'actions',
                  header: t('common.actions'),
                  width: '120px',
                  render: (r) => {
                    const n = r as Note
                    return (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetailModal(n.title || t('users.note'), n.noteText, 'note')
                        }}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <IconifyIcon icon="mdi:eye" className="me-1" style={{ fontSize: '0.875rem' }} />
                        {t('common.detail')}
                      </Button>
                    )
                  },
                },
              ]}
            />
          )}

          {activeTab === 'questions' && (
            <DataTable
              isLoading={loading}
              data={questions}
              rowKey={(r) => (r as Question).questionId}
              hideSearch
              columns={[
                { key: 'questionId', header: t('common.id') || 'ID', width: '80px', sortable: true },
                {
                  key: 'questionText',
                  header: t('questions.questionText'),
                  render: (r) => {
                    const q = r as Question
                    return q.questionText.length > 100 ? `${q.questionText.substring(0, 100)}...` : q.questionText
                  },
                },
                {
                  key: 'episodeTitle',
                  header: t('users.episode'),
                  render: (r) => {
                    const q = r as Question
                    return q.episodeTitle || (q.articleId ? t('users.article') : '-')
                  },
                },
                { key: 'seriesTitle', header: t('users.series'), render: (r) => (r as Question).seriesTitle || '-' },
                {
                  key: 'isAnswered',
                  header: t('users.status'),
                  render: (r) => {
                    const q = r as Question
                    return q.isAnswered ? <span className="badge bg-success">{t('users.answered')}</span> : <span className="badge bg-warning">{t('users.pending')}</span>
                  },
                },
                {
                  key: 'createdAt',
                  header: t('users.createdAt'),
                  render: (r) => new Date((r as Question).createdAt).toLocaleDateString(),
                },
                {
                  key: 'actions',
                  header: t('common.actions'),
                  width: '120px',
                  render: (r) => {
                    const q = r as Question
                    const answerText = q.answer?.answerText || (q.answers && q.answers.length > 0 ? q.answers[0].answerText : undefined)
                    return (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetailModal(t('questions.questionText'), q.questionText, 'question', undefined, undefined, answerText)
                        }}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <IconifyIcon icon="mdi:eye" className="me-1" style={{ fontSize: '0.875rem' }} />
                        {t('common.detail')}
                      </Button>
                    )
                  },
                },
              ]}
            />
          )}

          {activeTab === 'weeklyAnswers' && (
            <DataTable
              isLoading={loading}
              data={weeklyAnswers}
              rowKey={(r) => (r as WeeklyQuestionAnswerResponseDTO).weeklyQuestionAnswerId}
              hideSearch
              columns={[
                { key: 'weeklyQuestionAnswerId', header: t('common.id') || 'ID', width: '80px', sortable: true },
                {
                  key: 'weeklyQuestionId',
                  header: t('users.questionId'),
                  width: '120px',
                  sortable: true,
                },
                {
                  key: 'weeklyQuestion',
                  header: t('questions.questionText'),
                  render: (r) => {
                    const answer = r as WeeklyQuestionAnswerResponseDTO
                    const question = answer.weeklyQuestion
                    if (question && 'weeklyQuestionText' in question) {
                      const text = question.weeklyQuestionText as string
                      return text.length > 100 ? `${text.substring(0, 100)}...` : text
                    }
                    return '-'
                  },
                },
                {
                  key: 'weeklyQuestionAnswerText',
                  header: t('users.answer'),
                  render: (r) => {
                    const answer = r as WeeklyQuestionAnswerResponseDTO
                    const text = answer.weeklyQuestionAnswerText || ''
                    return text.length > 150 ? `${text.substring(0, 150)}...` : text || '-'
                  },
                },
                {
                  key: 'actions',
                  header: t('common.actions'),
                  width: '120px',
                  render: (r) => {
                    const answer = r as WeeklyQuestionAnswerResponseDTO
                    const question = answer.weeklyQuestion
                    const questionText = question && 'weeklyQuestionText' in question
                      ? (question.weeklyQuestionText as string)
                      : ''
                    const answerText = answer.weeklyQuestionAnswerText || ''
                    return (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetailModal(
                            t('users.weeklyAnswers'),
                            '',
                            'weeklyAnswer',
                            questionText,
                            answerText
                          )
                        }}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <IconifyIcon icon="mdi:eye" className="me-1" style={{ fontSize: '0.875rem' }} />
                        {t('common.detail')}
                      </Button>
                    )
                  },
                },
              ]}
            />
          )}
        </CardBody>
      </Card>

      <Modal show={showResetModal} onHide={closeResetModal} centered>
        <Form onSubmit={submitReset}>
          <Modal.Header closeButton>
            <Modal.Title>{t('users.resetPasswordTitle')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">{t('users.user')}: <strong>{user.firstName} {user.lastName}</strong></p>
            <PasswordFormInput control={resetControl} name="newPassword" label={t('users.newPassword')} placeholder={t('users.newPasswordPlaceholder')} />
            <PasswordFormInput control={resetControl} name="confirmNewPassword" label={t('users.confirmNewPassword')} placeholder={t('users.confirmNewPassword')} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={closeResetModal}>{t('common.cancel')}</Button>
            <Button type="submit" variant="primary" disabled={isResetSubmitting}>{isResetSubmitting ? t('users.resetting') : t('users.reset')}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={closeDetailModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{detailContent?.title || t('common.detail')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailContent?.type === 'weeklyAnswer' ? (
            <div>
              {detailContent.weeklyQuestion && (
                <div className="mb-4">
                  <h6 className="fw-semibold mb-2 d-flex align-items-center">
                    <IconifyIcon icon="mdi:help-circle" className="me-2" style={{ fontSize: '1.1rem', color: 'var(--bs-primary)' }} />
                    {t('questions.questionText')}
                  </h6>
                  <div style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.6',
                    padding: '12px',
                    backgroundColor: 'rgba(var(--bs-primary-rgb), 0.05)',
                    border: '1px solid rgba(var(--bs-primary-rgb), 0.1)',
                    borderRadius: '8px',
                    color: 'var(--bs-body-color)'
                  }}>
                    {detailContent.weeklyQuestion}
                  </div>
                </div>
              )}
              {detailContent.weeklyAnswer && (
                <div>
                  <h6 className="fw-semibold mb-2 d-flex align-items-center">
                    <IconifyIcon icon="mdi:message-text" className="me-2" style={{ fontSize: '1.1rem', color: 'var(--bs-success)' }} />
                    {t('users.answer')}
                  </h6>
                  <div style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.6',
                    padding: '12px',
                    backgroundColor: 'rgba(var(--bs-success-rgb), 0.05)',
                    border: '1px solid rgba(var(--bs-success-rgb), 0.1)',
                    borderRadius: '8px',
                    color: 'var(--bs-body-color)'
                  }}>
                    {detailContent.weeklyAnswer}
                  </div>
                </div>
              )}
            </div>
          ) : detailContent?.type === 'question' ? (
            <div>
              <div className="mb-4">
                <h6 className="fw-semibold mb-2 d-flex align-items-center">
                  <IconifyIcon icon="mdi:help-circle" className="me-2" style={{ fontSize: '1.1rem', color: 'var(--bs-primary)' }} />
                  {t('questions.questionText')}
                </h6>
                <div style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.6',
                  padding: '12px',
                  backgroundColor: 'rgba(var(--bs-primary-rgb), 0.05)',
                  border: '1px solid rgba(var(--bs-primary-rgb), 0.1)',
                  borderRadius: '8px',
                  color: 'var(--bs-body-color)'
                }}>
                  {detailContent.text}
                </div>
              </div>
              {detailContent.answer && (
                <div>
                  <h6 className="fw-semibold mb-2 d-flex align-items-center">
                    <IconifyIcon icon="mdi:message-text" className="me-2" style={{ fontSize: '1.1rem', color: 'var(--bs-success)' }} />
                    {t('users.answer')}
                  </h6>
                  <div style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.6',
                    padding: '12px',
                    backgroundColor: 'rgba(var(--bs-success-rgb), 0.05)',
                    border: '1px solid rgba(var(--bs-success-rgb), 0.1)',
                    borderRadius: '8px',
                    color: 'var(--bs-body-color)'
                  }}>
                    {detailContent.answer}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
              {detailContent?.text || ''}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeDetailModal}>{t('common.close')}</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default UserDetailPage


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

const UserDetailPage = () => {
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

  const resetSchema = yup.object({
    newPassword: yup.string().min(6, 'Password should be at least 6 characters').required('Please enter new password'),
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm new password'),
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

  const submitReset = handleResetSubmit(async (data) => {
    if (!user) return
    await userService.changePassword({ userId: user.userId, newPassword: data.newPassword })
    closeResetModal()
    alert('Password reset successfully!')
  })

  if (!user) {
    return (
      <>
        <PageTitle subName="Users" title="User Detail" />
        <Card>
          <CardBody>
            <p>User not found.</p>
            <Button variant="light" onClick={() => navigate('/admin/users')}>Go Back</Button>
          </CardBody>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageTitle subName="Users" title={`User Detail - ${user.userName}`} />
      
      {/* User Info Card */}
      <Card className="mb-3">
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <CardTitle as={'h5'} className="mb-0">User Information</CardTitle>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm" onClick={() => navigate('/admin/users/create', { state: { mode: 'edit', item: user } })}>
                <IconifyIcon icon="mdi:pencil" className="me-1" /> Edit
              </Button>
              <Button variant="outline-warning" size="sm" onClick={openResetModal}>
                <IconifyIcon icon="mdi:key-reset" className="me-1" /> Reset Password
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <div className="mb-2"><strong>Username:</strong> {user.userName}</div>
              <div className="mb-2"><strong>Email:</strong> {user.email}</div>
              <div className="mb-2"><strong>First Name:</strong> {user.firstName}</div>
              <div className="mb-2"><strong>Last Name:</strong> {user.lastName}</div>
              <div className="mb-2"><strong>Role:</strong> {user.roleName}</div>
            </Col>
            <Col md={6}>
              <div className="mb-2"><strong>City:</strong> {user.city || '-'}</div>
              <div className="mb-2"><strong>Phone:</strong> {user.phone || '-'}</div>
              <div className="mb-2"><strong>Date of Birth:</strong> {new Date(user.dateOfBirth).toLocaleDateString()}</div>
              <div className="mb-2"><strong>Gender:</strong> {user.gender ? 'Female' : 'Male'}</div>
              <div className="mb-2"><strong>Subscription End:</strong> {new Date(user.subscriptionEnd).toLocaleDateString()}</div>
              {user.description && <div className="mb-2"><strong>Description:</strong> {user.description}</div>}
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k as any)}>
            <Nav.Item>
              <Nav.Link eventKey="favorites">Favorites ({favorites.length})</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="notes">Notes ({notes.length})</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="questions">Questions ({questions.length})</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="weeklyAnswers">Weekly Question Answers ({weeklyAnswers.length})</Nav.Link>
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
                  { key: 'favoriteId', header: 'ID', width: '80px', sortable: true },
                  {
                    key: 'type',
                    header: 'Type',
                    render: (r) => {
                      const f = r as Favorite
                      if (f.episodeId) return 'Episode'
                      if (f.articleId) return 'Article'
                      if (f.affirmationId) return 'Affirmation'
                      if (f.aphorismId) return 'Aphorism'
                      return '-'
                    },
                  },
                  {
                    key: 'title',
                    header: 'Title',
                    render: (r) => {
                      const f = r as Favorite
                      return f.episodeTitle || f.articleTitle || f.affirmationText || f.aphorismText || '-'
                    },
                  },
                  {
                    key: 'seriesTitle',
                    header: 'Series',
                    render: (r) => (r as Favorite).seriesTitle || '-',
                  },
                  {
                    key: 'createdAt',
                    header: 'Created At',
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
                  { key: 'noteId', header: 'ID', width: '80px', sortable: true },
                  { key: 'title', header: 'Title', sortable: true },
                  {
                    key: 'noteText',
                    header: 'Note',
                    render: (r) => {
                      const n = r as Note
                      return n.noteText.length > 100 ? `${n.noteText.substring(0, 100)}...` : n.noteText
                    },
                  },
                  { key: 'episodeTitle', header: 'Episode', render: (r) => (r as Note).episodeTitle || '-' },
                  { key: 'seriesTitle', header: 'Series', render: (r) => (r as Note).seriesTitle || '-' },
                  {
                    key: 'createdAt',
                    header: 'Created At',
                    render: (r) => new Date((r as Note).createdAt).toLocaleDateString(),
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
                  { key: 'questionId', header: 'ID', width: '80px', sortable: true },
                  {
                    key: 'questionText',
                    header: 'Question',
                    render: (r) => {
                      const q = r as Question
                      return q.questionText.length > 100 ? `${q.questionText.substring(0, 100)}...` : q.questionText
                    },
                  },
                  {
                    key: 'episodeTitle',
                    header: 'Episode',
                    render: (r) => {
                      const q = r as Question
                      return q.episodeTitle || (q.articleId ? 'Article' : '-')
                    },
                  },
                  { key: 'seriesTitle', header: 'Series', render: (r) => (r as Question).seriesTitle || '-' },
                  {
                    key: 'isAnswered',
                    header: 'Status',
                    render: (r) => {
                      const q = r as Question
                      return q.isAnswered ? <span className="badge bg-success">Answered</span> : <span className="badge bg-warning">Pending</span>
                    },
                  },
                  {
                    key: 'createdAt',
                    header: 'Created At',
                    render: (r) => new Date((r as Question).createdAt).toLocaleDateString(),
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
                  { key: 'weeklyQuestionAnswerId', header: 'ID', width: '80px', sortable: true },
                  {
                    key: 'weeklyQuestionId',
                    header: 'Question ID',
                    width: '120px',
                    sortable: true,
                  },
                  {
                    key: 'weeklyQuestion',
                    header: 'Question',
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
                    header: 'Answer',
                    render: (r) => {
                      const answer = r as WeeklyQuestionAnswerResponseDTO
                      const text = answer.weeklyQuestionAnswerText || ''
                      return text.length > 150 ? `${text.substring(0, 150)}...` : text || '-'
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
            <Modal.Title>Reset Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">User: <strong>{user.firstName} {user.lastName}</strong></p>
            <PasswordFormInput control={resetControl} name="newPassword" label="New Password" placeholder="New password" />
            <PasswordFormInput control={resetControl} name="confirmNewPassword" label="Confirm New Password" placeholder="Confirm new password" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={closeResetModal}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isResetSubmitting}>{isResetSubmitting ? 'Resetting...' : 'Reset'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default UserDetailPage


import PageTitle from '@/components/PageTitle'
import { useEffect, useMemo, useState } from 'react'
import { questionsService, userService } from '@/services'
import type { Question, User } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button, Badge } from 'react-bootstrap'
import DataTable from '@/components/table/DataTable'
import QuestionModal, { type QuestionGroup } from '@/components/questions/QuestionModal'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'

interface UserWithQuestionCount extends User {
  unansweredCount: number
  totalCount: number
}

const QuestionsPage = () => {
  const navigate = useNavigate()
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<QuestionGroup | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'unanswered' | 'answered'>('users')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [questions, users] = await Promise.all([
        questionsService.getQuestions(),
        userService.getAllUsers(),
      ])
      setAllQuestions(questions)
      setAllUsers(users)
    } finally {
      setLoading(false)
    }
  }

  const unansweredQuestions = useMemo(() => {
    return allQuestions.filter((q) => !q.isAnswered)
  }, [allQuestions])

  const answeredQuestions = useMemo(() => {
    return allQuestions.filter((q) => q.isAnswered)
  }, [allQuestions])

  const groupedUnanswered = useMemo(() => {
    const groups = new Map<number, QuestionGroup>()
    unansweredQuestions.forEach((q) => {
      if (!groups.has(q.userId)) {
        groups.set(q.userId, {
          userId: q.userId,
          userName: q.userName,
          userEmail: '', // Will be filled if available
          questions: [],
        })
      }
      groups.get(q.userId)!.questions.push(q)
    })
    return Array.from(groups.values())
  }, [unansweredQuestions])

  const groupedAnswered = useMemo(() => {
    const groups = new Map<number, QuestionGroup>()
    answeredQuestions.forEach((q) => {
      if (!groups.has(q.userId)) {
        groups.set(q.userId, {
          userId: q.userId,
          userName: q.userName,
          userEmail: '', // Will be filled if available
          questions: [],
        })
      }
      groups.get(q.userId)!.questions.push(q)
    })
    return Array.from(groups.values())
  }, [answeredQuestions])

  // Kullanıcıları cevaplanmamış soru sayısı ile birleştir
  const usersWithQuestionCount = useMemo(() => {
    const userCountMap = new Map<number, { unanswered: number; total: number }>()
    
    allQuestions.forEach((q) => {
      if (!userCountMap.has(q.userId)) {
        userCountMap.set(q.userId, { unanswered: 0, total: 0 })
      }
      const counts = userCountMap.get(q.userId)!
      counts.total++
      if (!q.isAnswered) {
        counts.unanswered++
      }
    })

    return allUsers
      .map((user) => {
        const counts = userCountMap.get(user.userId) || { unanswered: 0, total: 0 }
        return {
          ...user,
          unansweredCount: counts.unanswered,
          totalCount: counts.total,
        } as UserWithQuestionCount
      })
      .sort((a, b) => {
        // Önce cevaplanmamış soru sayısına göre, sonra toplam soru sayısına göre sırala
        if (b.unansweredCount !== a.unansweredCount) {
          return b.unansweredCount - a.unansweredCount
        }
        return b.totalCount - a.totalCount
      })
  }, [allUsers, allQuestions])

  const handleUserClick = (group: QuestionGroup) => {
    // Detay sayfasına yönlendir ve questions tab'ını aç
    navigate(`/admin/users/${group.userId}`, {
      state: { activeTab: 'questions' },
    })
  }

  const handleAnswerSaved = () => {
    loadData()
  }

  return (
    <>
      <PageTitle subName="Questions" title="User Questions" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>User Questions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="mb-3">
            <div className="btn-group" role="group">
              <Button
                variant={activeTab === 'users' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('users')}
              >
                <Icon icon="mingcute:user-line" className="me-1" />
                All Users ({usersWithQuestionCount.length})
              </Button>
              <Button
                variant={activeTab === 'unanswered' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('unanswered')}
              >
                <Icon icon="mingcute:time-line" className="me-1" />
                Unanswered ({unansweredQuestions.length})
              </Button>
              <Button
                variant={activeTab === 'answered' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('answered')}
              >
                <Icon icon="mingcute:check-line" className="me-1" />
                Answered ({answeredQuestions.length})
              </Button>
            </div>
          </div>

          {activeTab === 'users' && (
            <DataTable
              isLoading={loading}
              data={usersWithQuestionCount}
              rowKey={(r) => (r as UserWithQuestionCount).userId}
              hideSearch
              columns={[
                {
                  key: 'userName',
                  header: 'User',
                  render: (r) => {
                    const u = r as UserWithQuestionCount
                    return (
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '36px', height: '36px' }}
                        >
                          <Icon icon="mingcute:user-line" style={{ fontSize: '1.1rem' }} />
                        </div>
                        <div>
                          <div className="fw-semibold">{u.userName}</div>
                          {u.email && <div className="text-muted small">{u.email}</div>}
                        </div>
                      </div>
                    )
                  },
                },
                {
                  key: 'unansweredCount',
                  header: 'Unanswered Questions',
                  width: '180px',
                  sortable: true,
                  render: (r) => {
                    const u = r as UserWithQuestionCount
                    return (
                      <Badge
                        bg={u.unansweredCount > 0 ? 'danger' : 'success'}
                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                      >
                        <Icon
                          icon={u.unansweredCount > 0 ? 'mingcute:time-line' : 'mingcute:check-fill'}
                          className="me-1"
                        />
                        {u.unansweredCount}
                      </Badge>
                    )
                  },
                },
                {
                  key: 'totalCount',
                  header: 'Total Questions',
                  width: '150px',
                  sortable: true,
                  render: (r) => {
                    const u = r as UserWithQuestionCount
                    return (
                      <span className="text-muted">
                        <Icon icon="mingcute:question-line" className="me-1" />
                        {u.totalCount}
                      </span>
                    )
                  },
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  width: '150px',
                  render: (r) => {
                    const u = r as UserWithQuestionCount
                    const userUnansweredQuestions = allQuestions.filter((q) => q.userId === u.userId && !q.isAnswered)
                    
                    const userGroup: QuestionGroup = {
                      userId: u.userId,
                      userName: u.userName,
                      userEmail: u.email || '',
                      questions: userUnansweredQuestions,
                    }
                    
                    return (
                      <Button
                        variant={userUnansweredQuestions.length > 0 ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => {
                          setSelectedUser(userGroup)
                          setShowModal(true)
                        }}
                        disabled={userUnansweredQuestions.length === 0}
                      >
                        <Icon icon="mingcute:eye-line" className="me-1" />
                        {userUnansweredQuestions.length > 0 ? 'View Questions' : 'No Questions'}
                      </Button>
                    )
                  },
                },
              ]}
            />
          )}

          {activeTab === 'unanswered' && (
            <DataTable
              isLoading={loading}
              data={groupedUnanswered}
              rowKey={(r) => (r as QuestionGroup).userId}
              hideSearch
              columns={[
                {
                  key: 'userName',
                  header: 'User',
                  render: (r) => {
                    const g = r as QuestionGroup
                    return (
                      <Button variant="link" className="p-0 text-start" onClick={() => handleUserClick(g)}>
                        {g.userName}
                      </Button>
                    )
                  },
                },
                {
                  key: 'questions.length',
                  header: 'Question Count',
                  width: '150px',
                  sortable: true,
                },
              ]}
            />
          )}

          {activeTab === 'answered' && (
            <DataTable
              isLoading={loading}
              data={groupedAnswered}
              rowKey={(r) => (r as QuestionGroup).userId}
              hideSearch
              columns={[
                {
                  key: 'userName',
                  header: 'User',
                  render: (r) => {
                    const g = r as QuestionGroup
                    return (
                      <Button variant="link" className="p-0 text-start" onClick={() => handleUserClick(g)}>
                        {g.userName}
                      </Button>
                    )
                  },
                },
                {
                  key: 'questions.length',
                  header: 'Question Count',
                  width: '150px',
                  sortable: true,
                },
              ]}
            />
          )}
        </CardBody>
      </Card>

      <QuestionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        userGroup={selectedUser}
        onAnswerSaved={handleAnswerSaved}
      />
    </>
  )
}

export default QuestionsPage


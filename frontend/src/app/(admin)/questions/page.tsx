import PageTitle from '@/components/PageTitle'
import { useEffect, useMemo, useState } from 'react'
import { questionsService } from '@/services'
import type { Question } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import DataTable from '@/components/table/DataTable'
import QuestionModal, { type QuestionGroup } from '@/components/questions/QuestionModal'

const QuestionsPage = () => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<QuestionGroup | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'unanswered' | 'answered'>('unanswered')

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const questions = await questionsService.getQuestions()
      setAllQuestions(questions)
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

  const handleUserClick = (group: QuestionGroup) => {
    setSelectedUser(group)
    setShowModal(true)
  }

  const handleAnswerSaved = () => {
    loadQuestions()
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
                variant={activeTab === 'unanswered' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('unanswered')}
              >
                Unanswered Questions ({unansweredQuestions.length})
              </Button>
              <Button
                variant={activeTab === 'answered' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('answered')}
              >
                Answered Questions ({answeredQuestions.length})
              </Button>
            </div>
          </div>

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


import { useEffect, useMemo, useState } from 'react'
import { questionsService, answersService } from '@/services'
import type { Question } from '@/types/keci'
import { Modal, Form, Row, Col, Button } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuthContext } from '@/context/useAuthContext'

export type QuestionGroup = {
  userId: number
  userName: string
  userEmail: string
  questions: Question[]
}

type AnswerFormFields = {
  answerText: string
}

interface QuestionModalProps {
  show: boolean
  onHide: () => void
  userGroup: QuestionGroup | null
  onAnswerSaved?: () => void
}

const QuestionModal = ({ show, onHide, userGroup, onAnswerSaved }: QuestionModalProps) => {
  const { user } = useAuthContext()
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

  const answerSchema = yup.object({
    answerText: yup.string().required('Answer is required').max(1000, 'Answer must be at most 1000 characters'),
  })

  const { control, handleSubmit, reset, formState } = useForm<AnswerFormFields>({
    resolver: yupResolver(answerSchema),
    defaultValues: { answerText: '' },
  })
  const { isSubmitting } = formState

  useEffect(() => {
    if (show && userGroup) {
      setSelectedQuestion(null)
      reset({ answerText: '' })
    }
  }, [show, userGroup, reset])

  const groupedQuestionsBySeries = useMemo(() => {
    if (!userGroup) return []
    const groups = new Map<string, Question[]>()
    userGroup.questions.forEach((q) => {
      const key = q.episodeId && q.seriesTitle 
        ? `${q.seriesTitle} - ${q.episodeTitle || 'Episode'}` 
        : q.articleId 
        ? 'Article Questions' 
        : 'General Questions'
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(q)
    })
    return Array.from(groups.entries()).map(([seriesTitle, questions]) => ({
      seriesTitle,
      questions,
    }))
  }, [userGroup])

  const handleQuestionSelect = async (question: Question) => {
    setSelectedQuestion(question)
    // Load answer if exists
    if (question.answer) {
      reset({ answerText: question.answer.answerText })
    } else {
      try {
        const answer = await answersService.getAnswerByQuestion(question.questionId)
        reset({ answerText: answer.answerText })
      } catch {
        reset({ answerText: '' })
      }
    }
  }

  const onSubmitAnswer = handleSubmit(async (data) => {
    if (!selectedQuestion) return

    try {
      if (selectedQuestion.answer) {
        // Update existing answer
        await answersService.updateAnswer({
          userId: selectedQuestion.answer.userId,
          answerId: selectedQuestion.answer.answerId,
          answer: data.answerText,
        })
      } else {
        // Create new answer - use current admin user ID
        const currentUserId = user?.id ? parseInt(user.id) : 1
        await answersService.createAnswer({
          userId: currentUserId,
          questionId: selectedQuestion.questionId,
          answer: data.answerText,
        })
      }
      
      // Reload questions
      const updatedQuestions = await questionsService.getQuestions()
      const updatedQuestion = updatedQuestions.find((q) => q.questionId === selectedQuestion.questionId)
      if (updatedQuestion) {
        setSelectedQuestion(updatedQuestion)
        if (updatedQuestion.answer) {
          reset({ answerText: updatedQuestion.answer.answerText })
        }
      }
      
      if (onAnswerSaved) {
        onAnswerSaved()
      }
      alert('Answer saved successfully!')
    } catch (error) {
      console.error('Error saving answer:', error)
      alert('Failed to save answer. Please try again.')
    }
  })

  const getQuestionDisplayText = (question: Question) => {
    if (question.episodeId && question.seriesTitle && question.episodeTitle) {
      return `${question.seriesTitle} - ${question.episodeTitle}`
    }
    if (question.articleId) {
      return 'Article Question'
    }
    return 'General Question'
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Questions - {userGroup?.userName} ({userGroup?.questions.length || 0} questions)
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={4}>
            <div className="border-end pe-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <h6 className="mb-3">Questions by Series/Episode</h6>
              {groupedQuestionsBySeries.map((group) => (
                <div key={group.seriesTitle} className="mb-3">
                  <div className="fw-bold text-primary mb-2">{group.seriesTitle}</div>
                  <div className="list-group">
                    {group.questions.map((q) => (
                      <button
                        key={q.questionId}
                        type="button"
                        className={`list-group-item list-group-item-action ${selectedQuestion?.questionId === q.questionId ? 'active' : ''}`}
                        onClick={() => handleQuestionSelect(q)}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <small className="text-muted d-block">{q.questionText.substring(0, 60)}...</small>
                          </div>
                          {q.isAnswered && <span className="badge bg-success ms-2">✓</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Col>
          <Col md={8}>
            {selectedQuestion ? (
              <div>
                <h6 className="mb-3">Question</h6>
                <div className="mb-3 p-3 bg-light rounded">
                  <p className="mb-0">{selectedQuestion.questionText}</p>
                  <small className="text-muted">
                    {getQuestionDisplayText(selectedQuestion)} • {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                  </small>
                </div>

                <Form onSubmit={onSubmitAnswer}>
                  <h6 className="mb-3">Answer</h6>
                  <Controller
                    control={control}
                    name="answerText"
                    render={({ field, fieldState }) => (
                      <>
                        <Form.Control
                          as="textarea"
                          rows={6}
                          {...field}
                          className={fieldState.error ? 'is-invalid' : ''}
                          placeholder="Enter your answer here..."
                        />
                        {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                      </>
                    )}
                  />
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button type="button" variant="light" onClick={() => setSelectedQuestion(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : selectedQuestion.answer ? 'Update Answer' : 'Submit Answer'}
                    </Button>
                  </div>
                </Form>
              </div>
            ) : (
              <div className="text-center text-muted py-5">
                <p>Select a question from the left panel to view and answer it.</p>
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  )
}

export default QuestionModal


import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService, notesService, questionsService } from '@/services'
import type { Article, Question, Note } from '@/types/keci'
import DOMPurify from 'dompurify'
import { useParams } from 'react-router-dom'
import PDFViewer from '@/components/podcast/PDFViewer'
import { Card, Row, Col, Button, Form, Collapse, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useAuthContext } from '@/context/useAuthContext'

const ArticleDetailPage = () => {
  const params = useParams()
  const slugOrId = params['*'] || ''
  const { user } = useAuthContext()
  
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Notes & Questions state
  const [showNotesAndQuestions, setShowNotesAndQuestions] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [existingNote, setExistingNote] = useState<Note | null>(null)
  const [noteLoading, setNoteLoading] = useState(false)
  
  const [questionText, setQuestionText] = useState('')
  const [existingQuestion, setExistingQuestion] = useState<Question | null>(null)
  const [questionLoading, setQuestionLoading] = useState(false)

  useEffect(() => {
    if (!slugOrId) {
      setLoading(false)
      return
    }
    
    const loadArticle = async () => {
      setLoading(true)
      try {
        const articleId = parseInt(slugOrId, 10)
        if (!isNaN(articleId)) {
          const articles = await contentService.getPublicArticles()
          const foundArticle = articles.find(a => a.articleId === articleId)
          if (foundArticle) {
            setArticle(foundArticle)
          } else {
            setArticle(null)
          }
        } else {
          const articles = await contentService.getPublicArticles()
          const foundArticle = articles.find(a => a.slug === slugOrId)
          if (foundArticle) {
            setArticle(foundArticle)
          } else {
            setArticle(null)
          }
        }
      } catch (error) {
        console.error('Error loading article:', error)
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadArticle()
  }, [slugOrId])

  // Load existing note and question when article changes
  useEffect(() => {
    if (article && user?.id) {
      const userId = parseInt(user.id)
      
      // Load existing note
      notesService
        .getNoteByUserAndArticle(userId, article.articleId)
        .then((note) => {
          if (note) {
            setExistingNote(note)
            setNoteTitle(note.title || '')
            setNoteText(note.noteText || '')
          } else {
            setExistingNote(null)
            setNoteTitle('')
            setNoteText('')
          }
        })
        .catch(() => {
          setExistingNote(null)
          setNoteTitle('')
          setNoteText('')
        })
      
      // Load existing question
      questionsService
        .getQuestionByUserAndArticle(userId, article.articleId)
        .then((question) => {
          if (question) {
            setExistingQuestion(question)
            setQuestionText(question.questionText || '')
          } else {
            setExistingQuestion(null)
            setQuestionText('')
          }
        })
        .catch(() => {
          setExistingQuestion(null)
          setQuestionText('')
        })
    } else {
      setExistingNote(null)
      setNoteTitle('')
      setNoteText('')
      setExistingQuestion(null)
      setQuestionText('')
    }
  }, [article, user])

  const handleSaveNote = async () => {
    if (!article || !user?.id || !noteText.trim()) return

    setNoteLoading(true)
    try {
      const userId = parseInt(user.id)
      const savedNote = existingNote
        ? await notesService.updateNote({
            userId,
            articleId: article.articleId,
            title: noteTitle || article.title,
            noteText: noteText.trim(),
          })
        : await notesService.createNote({
            userId,
            articleId: article.articleId,
            title: noteTitle || article.title,
            noteText: noteText.trim(),
          })
      setExistingNote(savedNote)
      
      // Success notification
      const successMsg = document.createElement('div')
      successMsg.className = 'alert alert-success position-fixed'
      successMsg.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 250px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);'
      successMsg.innerHTML = '<strong>Başarılı!</strong> Not kaydedildi.'
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 2000)
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Not kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setNoteLoading(false)
    }
  }

  const handleSubmitQuestion = async () => {
    if (!article || !user?.id || !questionText.trim() || existingQuestion) return

    setQuestionLoading(true)
    try {
      const userId = parseInt(user.id)
      const newQuestion = await questionsService.createQuestion({
        userId,
        articleId: article.articleId,
        questionText: questionText.trim(),
      })
      setExistingQuestion(newQuestion)
      setQuestionText('')
      
      // Success notification
      const successMsg = document.createElement('div')
      successMsg.className = 'alert alert-success position-fixed'
      successMsg.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 250px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);'
      successMsg.innerHTML = '<strong>Başarılı!</strong> Sorunuz admin\'e gönderildi.'
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 3000)
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('Soru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setQuestionLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <PageTitle subName="Makale" title="Yükleniyor..." />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </>
    )
  }

  if (!article) {
    return (
      <>
        <PageTitle subName="Makale" title="Makale Bulunamadı" />
        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <Card.Body>
            <div className="text-center text-muted py-5">
              <Icon icon="mingcute:file-search-line" style={{ fontSize: '4rem', opacity: 0.3 }} />
              <p className="mt-3 mb-0">Makale bulunamadı.</p>
            </div>
          </Card.Body>
        </Card>
      </>
    )
  }

  const hasPdf = article.pdfLink && article.pdfLink.trim() !== ''
  const hasHtmlContent = article.contentHtml && article.contentHtml.trim() !== ''

  return (
    <>
      <PageTitle subName="Makale" title={article.title} />
      
      {/* Article Header Card */}
      <Card 
        className="border-0 shadow-sm mb-3 mb-md-4 overflow-hidden"
        style={{ 
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.03) 0%, rgba(var(--bs-primary-rgb), 0.08) 100%)'
        }}
      >
        <Card.Body className="p-3 p-md-4">
          {article.coverImageUrl && (
            <div className="mb-3 overflow-hidden" style={{ borderRadius: '12px' }}>
              <img 
                src={article.coverImageUrl} 
                alt={article.title} 
                className="img-fluid w-100" 
                style={{ 
                  maxHeight: '300px', 
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }} 
              />
            </div>
          )}
          
          <div className="d-flex align-items-center flex-wrap gap-2 text-muted small mb-3">
            <span className="d-flex align-items-center gap-1">
              <Icon icon="mingcute:calendar-line" style={{ fontSize: '0.9rem' }} />
              {(article.publishedAt || article.createdAt).slice(0, 10)}
            </span>
            {article.authorUserName && (
              <>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <Icon icon="mingcute:user-3-line" style={{ fontSize: '0.9rem' }} />
                  {article.authorUserName}
                </span>
              </>
            )}
          </div>

          {/* Notes & Questions Toggle Button */}
          {user && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowNotesAndQuestions(!showNotesAndQuestions)}
              className="d-flex align-items-center justify-content-center gap-2 w-100"
              style={{
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '0.875rem',
                borderRadius: '10px',
                padding: '0.6rem 1rem',
                borderWidth: '1.5px',
                fontWeight: '500',
              }}
            >
              <Icon
                icon={showNotesAndQuestions ? 'mingcute:up-line' : 'mingcute:notebook-3-line'}
                style={{ fontSize: '1.1rem' }}
              />
              <span>Not ve Soru</span>
              {existingNote && (
                <span 
                  className="badge ms-1" 
                  style={{ 
                    fontSize: '0.65rem',
                    backgroundColor: 'rgba(var(--bs-primary-rgb), 0.15)',
                    color: 'var(--bs-primary)',
                    border: '1px solid rgba(var(--bs-primary-rgb), 0.25)',
                    borderRadius: '6px'
                  }}
                >
                  <Icon icon="mingcute:check-fill" className="me-1" style={{ fontSize: '0.6rem' }} />
                  Not Var
                </span>
              )}
              {existingQuestion && (
                <span 
                  className="badge ms-1" 
                  style={{ 
                    fontSize: '0.65rem',
                    backgroundColor: 'rgba(var(--bs-warning-rgb), 0.15)',
                    color: 'var(--bs-warning)',
                    border: '1px solid rgba(var(--bs-warning-rgb), 0.25)',
                    borderRadius: '6px'
                  }}
                >
                  <Icon icon="mingcute:question-fill" className="me-1" style={{ fontSize: '0.6rem' }} />
                  Soru Var
                </span>
              )}
            </Button>
          )}

          {/* Notes & Questions Collapse */}
          <Collapse in={showNotesAndQuestions}>
            <div>
              <Row className="g-2 g-md-3 mt-2">
                {/* Notes Section */}
                <Col xs={12} md={6}>
                  <Card
                    className="border h-100"
                    style={{
                      backgroundColor: 'var(--bs-body-bg)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderColor: 'rgba(var(--bs-primary-rgb), 0.15)',
                      borderRadius: '12px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(var(--bs-primary-rgb), 0.12)'
                      e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb), 0.35)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb), 0.15)'
                    }}
                  >
                    <Card.Body className="p-2 p-md-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div 
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)'
                          }}
                        >
                          <Icon 
                            icon="mingcute:notebook-3-line" 
                            style={{ 
                              fontSize: '1rem',
                              color: 'var(--bs-primary)'
                            }} 
                          />
                        </div>
                        <h6 
                          className="mb-0 fw-semibold"
                          style={{ fontSize: '0.9rem' }}
                        >
                          Notlarım
                        </h6>
                        {existingNote && (
                          <span 
                            className="badge ms-auto" 
                            style={{ 
                              fontSize: '0.65rem',
                              backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                              color: 'var(--bs-primary)',
                              border: '1px solid rgba(var(--bs-primary-rgb), 0.2)',
                              fontWeight: '500',
                              borderRadius: '6px'
                            }}
                          >
                            <Icon icon="mingcute:check-fill" className="me-1" style={{ fontSize: '0.6rem' }} />
                            Kaydedildi
                          </span>
                        )}
                      </div>
                      
                      {existingNote && (
                        <div 
                          className="py-2 px-2 mb-2 rounded"
                          style={{ 
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(var(--bs-info-rgb), 0.08)',
                            border: '1px solid rgba(var(--bs-info-rgb), 0.15)',
                            borderRadius: '8px'
                          }}
                        >
                          <Icon icon="mingcute:information-line" className="me-1" style={{ fontSize: '0.8rem', color: 'var(--bs-info)' }} />
                          Mevcut notunuz düzenlenebilir.
                        </div>
                      )}
                      
                      <Form.Group className="mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Not başlığı (opsiyonel)"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          size="sm"
                          className="mb-2"
                          style={{ 
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            borderColor: 'rgba(var(--bs-primary-rgb), 0.15)',
                            padding: '0.5rem 0.75rem'
                          }}
                        />
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Bu makale hakkında notlarınızı yazın..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          style={{
                            resize: 'vertical',
                            fontSize: '0.8rem',
                            minHeight: '70px',
                            borderRadius: '8px',
                            borderColor: 'rgba(var(--bs-primary-rgb), 0.15)',
                            padding: '0.5rem 0.75rem'
                          }}
                        />
                      </Form.Group>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveNote}
                        disabled={noteLoading || !noteText.trim()}
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        style={{
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          fontSize: '0.8rem',
                          borderRadius: '8px',
                          padding: '0.5rem',
                          fontWeight: '500'
                        }}
                      >
                        {noteLoading ? (
                          <>
                            <Spinner animation="border" size="sm" />
                            <span>Kaydediliyor...</span>
                          </>
                        ) : existingNote ? (
                          <>
                            <Icon icon="mingcute:save-line" style={{ fontSize: '0.9rem' }} />
                            <span>Notu Güncelle</span>
                          </>
                        ) : (
                          <>
                            <Icon icon="mingcute:save-line" style={{ fontSize: '0.9rem' }} />
                            <span>Notu Kaydet</span>
                          </>
                        )}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Questions Section */}
                <Col xs={12} md={6}>
                  <Card
                    className="border h-100"
                    style={{
                      backgroundColor: 'var(--bs-body-bg)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderColor: 'rgba(var(--bs-warning-rgb), 0.15)',
                      borderRadius: '12px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(var(--bs-warning-rgb), 0.12)'
                      e.currentTarget.style.borderColor = 'rgba(var(--bs-warning-rgb), 0.35)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = 'rgba(var(--bs-warning-rgb), 0.15)'
                    }}
                  >
                    <Card.Body className="p-2 p-md-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div 
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(var(--bs-warning-rgb), 0.1)'
                          }}
                        >
                          <Icon 
                            icon="mingcute:question-line" 
                            style={{ 
                              fontSize: '1rem',
                              color: 'var(--bs-warning)'
                            }} 
                          />
                        </div>
                        <h6 
                          className="mb-0 fw-semibold"
                          style={{ fontSize: '0.9rem' }}
                        >
                          Soru Sor
                        </h6>
                        {existingQuestion ? (
                          <span 
                            className="badge ms-auto" 
                            style={{ 
                              fontSize: '0.65rem',
                              backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                              color: 'var(--bs-primary)',
                              border: '1px solid rgba(var(--bs-primary-rgb), 0.2)',
                              fontWeight: '500',
                              borderRadius: '6px'
                            }}
                          >
                            <Icon icon="mingcute:check-fill" className="me-1" style={{ fontSize: '0.6rem' }} />
                            Gönderildi
                          </span>
                        ) : (
                          <span 
                            className="badge ms-auto" 
                            style={{ 
                              fontSize: '0.65rem',
                              backgroundColor: 'rgba(var(--bs-warning-rgb), 0.1)',
                              color: 'var(--bs-warning)',
                              border: '1px solid rgba(var(--bs-warning-rgb), 0.2)',
                              fontWeight: '500',
                              borderRadius: '6px'
                            }}
                          >
                            Admin'e Gönderilir
                          </span>
                        )}
                      </div>
                      
                      {existingQuestion ? (
                        <>
                          <div 
                            className="py-2 px-2 mb-2 rounded"
                            style={{ 
                              fontSize: '0.75rem',
                              backgroundColor: 'rgba(var(--bs-info-rgb), 0.08)',
                              border: '1px solid rgba(var(--bs-info-rgb), 0.15)',
                              borderRadius: '8px'
                            }}
                          >
                            <Icon icon="mingcute:information-line" className="me-1" style={{ fontSize: '0.8rem', color: 'var(--bs-info)' }} />
                            Sorunuz admin tarafından inceleniyor.
                          </div>
                          
                          <div 
                            className="border rounded p-2"
                            style={{
                              backgroundColor: 'rgba(var(--bs-primary-rgb), 0.02)',
                              borderColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                              borderRadius: '8px'
                            }}
                          >
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <Icon icon="mingcute:question-line" style={{ fontSize: '0.85rem', color: 'var(--bs-warning)' }} />
                              <span className="fw-semibold" style={{ fontSize: '0.8rem' }}>Gönderilen Soru</span>
                              {existingQuestion.createdAt && (
                                <span className="text-muted ms-auto" style={{ fontSize: '0.7rem' }}>
                                  {new Date(existingQuestion.createdAt).toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                              )}
                            </div>
                            <p className="text-muted mb-0" style={{ lineHeight: '1.5', fontSize: '0.8rem' }}>
                              {existingQuestion.questionText}
                            </p>
                            
                            {existingQuestion.isAnswered && existingQuestion.answer && (
                              <div 
                                className="mt-2 pt-2 border-top rounded p-2"
                                style={{
                                  backgroundColor: 'rgba(var(--bs-primary-rgb), 0.05)',
                                  borderRadius: '6px'
                                }}
                              >
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <Icon icon="mingcute:check-fill" style={{ fontSize: '0.8rem', color: 'var(--bs-primary)' }} />
                                  <span className="fw-semibold" style={{ color: 'var(--bs-primary)', fontSize: '0.8rem' }}>Cevap</span>
                                </div>
                                <p className="mb-0" style={{ lineHeight: '1.5', fontSize: '0.8rem' }}>
                                  {existingQuestion.answer.answerText}
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <Form.Group className="mb-2">
                            <Form.Control
                              as="textarea"
                              rows={3}
                              placeholder="Bu makale hakkında sorunuzu yazın..."
                              value={questionText}
                              onChange={(e) => setQuestionText(e.target.value)}
                              style={{
                                resize: 'vertical',
                                fontSize: '0.8rem',
                                minHeight: '70px',
                                borderRadius: '8px',
                                borderColor: 'rgba(var(--bs-warning-rgb), 0.15)',
                                padding: '0.5rem 0.75rem'
                              }}
                            />
                          </Form.Group>
                          
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={handleSubmitQuestion}
                            disabled={questionLoading || !questionText.trim()}
                            className="w-100 d-flex align-items-center justify-content-center gap-2"
                            style={{
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              fontSize: '0.8rem',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              fontWeight: '500',
                              color: '#1a1a1a'
                            }}
                          >
                            {questionLoading ? (
                              <>
                                <Spinner animation="border" size="sm" />
                                <span>Gönderiliyor...</span>
                              </>
                            ) : (
                              <>
                                <Icon icon="mingcute:send-line" style={{ fontSize: '0.9rem' }} />
                                <span>Soruyu Gönder</span>
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Collapse>
        </Card.Body>
      </Card>

      {/* PDF Viewer */}
      {hasPdf && (
        <div className="mb-3 mb-md-4">
          <PDFViewer pdfUrl={article.pdfLink} title={article.title} />
        </div>
      )}

      {/* HTML Content */}
      {hasHtmlContent && (
        <Card 
          className="border-0 shadow-sm"
          style={{ borderRadius: '16px' }}
        >
          <Card.Body className="p-3 p-md-4">
            <div 
              className="article-content"
              style={{ 
                fontSize: '1rem',
                lineHeight: '1.8',
                color: 'var(--bs-body-color)'
              }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.contentHtml || '') }} 
            />
          </Card.Body>
        </Card>
      )}

      {/* No content message */}
      {!hasPdf && !hasHtmlContent && (
        <Card 
          className="border-0 shadow-sm"
          style={{ borderRadius: '16px' }}
        >
          <Card.Body>
            <div className="text-center text-muted py-5">
              <Icon icon="mingcute:file-line" style={{ fontSize: '4rem', opacity: 0.3 }} />
              <p className="mt-3 mb-0">Bu makale için içerik bulunamadı.</p>
            </div>
          </Card.Body>
        </Card>
      )}
    </>
  )
}

export default ArticleDetailPage

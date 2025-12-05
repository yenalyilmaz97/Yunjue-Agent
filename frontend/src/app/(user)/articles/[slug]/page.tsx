import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Article } from '@/types/keci'
import DOMPurify from 'dompurify'
import { useParams } from 'react-router-dom'
import PDFViewer from '@/components/podcast/PDFViewer'
import { Card } from 'react-bootstrap'

const ArticleDetailPage = () => {
  const params = useParams()
  const slugOrId = params['*'] || ''
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slugOrId) {
      setLoading(false)
      return
    }
    
    const loadArticle = async () => {
      setLoading(true)
      try {
        // Eğer slug sayı ise (articleId), direkt articleId ile getir
        const articleId = parseInt(slugOrId, 10)
        if (!isNaN(articleId)) {
          // Backend'de slug endpoint'i yok, articleId kullan
          const articles = await contentService.getPublicArticles()
          const foundArticle = articles.find(a => a.articleId === articleId)
          if (foundArticle) {
            setArticle(foundArticle)
          } else {
            setArticle(null)
          }
        } else {
          // Slug ise, önce public articles'dan bul
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

  if (loading) {
    return (
      <>
        <PageTitle subName="Article" title="Loading..." />
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
        <PageTitle subName="Article" title="Article Not Found" />
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="text-center text-muted py-5">
              <p className="mb-0">Makale bulunamadı.</p>
            </div>
          </Card.Body>
        </Card>
      </>
    )
  }

  // PDF varsa PDF viewer göster, yoksa HTML içerik göster
  const hasPdf = article.pdfLink && article.pdfLink.trim() !== ''
  const hasHtmlContent = article.contentHtml && article.contentHtml.trim() !== ''

  return (
    <>
      <PageTitle subName="Article" title={article.title} />
      {article.coverImageUrl && (
        <div className="mb-3">
          <img src={article.coverImageUrl} alt={article.title} className="img-fluid rounded" />
        </div>
      )}
      <div className="text-muted small mb-3">
        {(article.publishedAt || article.createdAt).slice(0, 10)} • {article.authorUserName}
      </div>

      {/* PDF Viewer */}
      {hasPdf && (
        <div className="mb-4">
          <PDFViewer pdfUrl={article.pdfLink} title={article.title} />
        </div>
      )}

      {/* HTML Content */}
      {hasHtmlContent && (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.contentHtml || '') }} />
          </Card.Body>
        </Card>
      )}

      {/* Eğer ne PDF ne de HTML içerik yoksa */}
      {!hasPdf && !hasHtmlContent && (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="text-center text-muted py-5">
              <p className="mb-0">Bu makale için içerik bulunamadı.</p>
            </div>
          </Card.Body>
        </Card>
      )}
    </>
  )
}

export default ArticleDetailPage



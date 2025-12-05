import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Article } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const page = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    contentService.getPublicArticles().then(setArticles).catch(() => setArticles([]))
  }, [])

  return (
    <>
      <PageTitle subName="Articles" title="Articles" />
      <div className="row g-3">
        {articles.map((a) => (
          <div className="col-md-6 col-lg-4" key={a.articleId}>
            <Card
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => navigate(`/articles/${a.slug || a.articleId}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--bs-primary-rgb), 0.15)'
                e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb), 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                e.currentTarget.style.borderColor = 'var(--bs-border-color)'
              }}
            >
              <CardHeader>
                <CardTitle as={'h5'} className="mb-0">
                  {a.title}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-muted mb-2">{a.excerpt || ''}</p>
                <div className="text-muted small">{(a.publishedAt || a.createdAt).slice(0,10)} • {a.authorUserName}</div>
              </CardBody>
            </Card>
          </div>
        ))}
        {articles.length === 0 && (
          <div className="col-12 text-center text-muted">No articles yet.</div>
        )}
      </div>
    </>
  )
}

export default page



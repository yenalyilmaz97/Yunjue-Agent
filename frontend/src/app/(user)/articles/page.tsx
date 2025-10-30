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
            <Card>
              <CardHeader>
                <CardTitle as={'h5'} className="mb-0">
                  <a href={`/articles/${a.slug}`} onClick={(e) => { e.preventDefault(); navigate(`/articles/${a.slug}`) }}>{a.title}</a>
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



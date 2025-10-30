import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Article } from '@/types/keci'
import DOMPurify from 'dompurify'
import { useParams } from 'react-router-dom'

const page = () => {
  const params = useParams()
  const slug = params['*'] || ''
  const [article, setArticle] = useState<Article | null>(null)

  useEffect(() => {
    if (!slug) return
    contentService.getArticleBySlug(slug).then(setArticle).catch(() => setArticle(null))
  }, [slug])

  if (!article) return null

  return (
    <>
      <PageTitle subName="Article" title={article.title} />
      {article.coverImageUrl && (
        <div className="mb-3">
          <img src={article.coverImageUrl} alt={article.title} className="img-fluid rounded" />
        </div>
      )}
      <div className="text-muted small mb-3">{(article.publishedAt || article.createdAt).slice(0,10)} • {article.authorUserName}</div>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.contentHtml) }} />
    </>
  )
}

export default page



import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Article } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
  const [items, setItems] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const navigate = useNavigate()
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await contentService.getAllArticlesAdmin()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <PageTitle subName={t('pages.content')} title={t('articles.title')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>{t('articles.list')}</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder={t('articles.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/articles/create')}>{t('articles.addNew')}</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as Article).articleId}
            hideSearch
            searchQuery={search}
            onSearchQueryChange={setSearch}
            searchPlaceholder={t('articles.searchPlaceholder')}
            searchKeys={['title', 'pdfLink']}
            actionsHeader={t('common.actions')}
            renderRowActions={(row) => {
              const a = row as Article
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/articles/create', { state: { mode: 'edit', item: a } })}>{t('common.edit')}</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm(t('articles.deleteConfirm'))) {
                      await contentService.deleteArticle(a.articleId)
                      const data = await contentService.getAllArticlesAdmin()
                      setItems(data)
                    }
                  }}>{t('common.delete')}</Button>
                </div>
              )
            }}
            columns={[
              { key: 'articleId', header: t('common.id') || 'ID', width: '80px', sortable: true },
              { key: 'title', header: t('articles.titleLabel'), sortable: true },
              { key: 'pdfLink', header: t('articles.pdfLink'), sortable: true, render: (r) => {
                const link = (r as Article).pdfLink
                return link ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>{link}</a> : '-'
              }},
              { key: 'isActive', header: t('articles.active'), sortable: true, render: (r) => ((r as Article).isActive ? t('common.yes') : t('common.no')) },
              { key: 'createdAt', header: t('articles.date'), sortable: true, render: (r) => ((r as Article).createdAt)?.slice(0,10) },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



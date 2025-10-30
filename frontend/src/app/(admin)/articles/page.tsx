import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Article } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/table/DataTable'

const page = () => {
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
      <PageTitle subName="Content" title="Articles" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>Articles</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/articles/create')}>Add New</Button>
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
            searchPlaceholder="Search article..."
            searchKeys={['title', 'slug', 'authorUserName']}
            actionsHeader="Actions"
            renderRowActions={(row) => {
              const a = row as Article
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/articles/create', { state: { mode: 'edit', item: a } })}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm('Delete this article?')) {
                      await contentService.deleteArticle(a.articleId)
                      const data = await contentService.getAllArticlesAdmin()
                      setItems(data)
                    }
                  }}>Delete</Button>
                </div>
              )
            }}
            columns={[
              { key: 'articleId', header: 'ID', width: '80px', sortable: true },
              { key: 'title', header: 'Title', sortable: true },
              { key: 'slug', header: 'Slug', sortable: true },
              { key: 'authorUserName', header: 'Author', sortable: true },
              { key: 'isPublished', header: 'Published', sortable: true, render: (r) => ((r as Article).isPublished ? 'Yes' : 'No') },
              { key: 'publishedAt', header: 'Date', sortable: true, render: (r) => ((r as Article).publishedAt || (r as Article).createdAt)?.slice(0,10) },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



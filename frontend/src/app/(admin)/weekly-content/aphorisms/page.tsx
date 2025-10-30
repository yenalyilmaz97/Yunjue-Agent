import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Aphorism } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/table/DataTable'

const page = () => {
  const [items, setItems] = useState<Aphorism[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const navigate = useNavigate()
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await contentService.getAllAphorisms()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <PageTitle subName="Content" title="Aphorisms" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>Aphorisms</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search aphorism..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/content/aphorisms/create')}>Add New</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => `${(r as Aphorism).order ?? (r as Aphorism).aphorismId}`}
            hideSearch
            searchQuery={search}
            onSearchQueryChange={setSearch}
            searchPlaceholder="Search aphorism..."
            searchKeys={['aphorismText', 'order']}
            actionsHeader="Actions"
            renderRowActions={(row) => {
              const a = row as Aphorism
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/aphorisms/create', { state: { mode: 'edit', item: a } })}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm('Delete this aphorism?')) {
                      await contentService.deleteAphorism(a.aphorismId)
                      const data = await contentService.getAllAphorisms()
                      setItems(data)
                    }
                  }}>Delete</Button>
                </div>
              )
            }}
            columns={[
              { key: 'order', header: 'Sira', width: '80px', sortable: true },
              { key: 'aphorismText', header: 'Title', sortable: true },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



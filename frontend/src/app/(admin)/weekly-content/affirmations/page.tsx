import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Affirmation } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'

const page = () => {
  const [items, setItems] = useState<Affirmation[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const navigate = useNavigate()
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await contentService.getAllAffirmations()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <PageTitle subName="Content" title="Affirmations" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>Affirmations</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search affirmation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/content/affirmations/create')}>Add New</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => `${(r as Affirmation).order ?? (r as Affirmation).affirmationId}`}
            hideSearch
            searchQuery={search}
            onSearchQueryChange={setSearch}
            searchPlaceholder="Search affirmation..."
            searchKeys={['affirmationText', 'order']}
            actionsHeader="Actions"
            renderRowActions={(row) => {
              const a = row as Affirmation
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/affirmations/create', { state: { mode: 'edit', item: a } })}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm('Delete this affirmation?')) {
                      await contentService.deleteAffirmation(a.affirmationId)
                      const data = await contentService.getAllAffirmations()
                      setItems(data)
                    }
                  }}>Delete</Button>
                </div>
              )
            }}
            columns={[
              { key: 'order', header: 'Sira', width: '80px', sortable: true },
              { key: 'affirmationText', header: 'Title', sortable: true },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



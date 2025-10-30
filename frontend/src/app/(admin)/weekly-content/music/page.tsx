import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Music } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'

const page = () => {
  const [items, setItems] = useState<Music[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const navigate = useNavigate()
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await contentService.getAllMusic()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <PageTitle subName="Content" title="Music" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>Music List</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search music..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/content/music/create')}>Add New</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as Music).musicId}
            hideSearch
            searchQuery={search}
            onSearchQueryChange={setSearch}
            searchPlaceholder="Search music..."
            searchKeys={['musicTitle', 'musicURL', 'musicDescription', 'musicId']}
            actionsHeader="Actions"
            renderRowActions={(row) => {
              const m = row as Music
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/music/create', { state: { mode: 'edit', item: m } })}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm('Delete this music?')) {
                      await contentService.deleteMusic(m.musicId)
                      const data = await contentService.getAllMusic()
                      setItems(data)
                    }
                  }}>Delete</Button>
                </div>
              )
            }}
            columns={[
              { key: 'musicId', header: 'ID', width: '80px', sortable: true },
              { key: 'musicTitle', header: 'Title', sortable: true },
              { key: 'musicURL', header: 'URL' },
              { key: 'musicDescription', header: 'Description' },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



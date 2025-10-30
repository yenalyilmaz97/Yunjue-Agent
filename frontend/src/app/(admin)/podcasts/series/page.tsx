import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { podcastService } from '@/services'
import type { PodcastSeries } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'

const page = () => {
  const [items, setItems] = useState<PodcastSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const handleDeleteSeries = async (seriesId: number) => {
    if (!confirm('Bu seriyi silmek istediğinize emin misiniz?')) return
    await podcastService.deleteSeries(seriesId)
    setItems((prev) => prev.filter((s) => s.seriesId !== seriesId))
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await podcastService.getAllSeries()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <PageTitle subName="Podcasts" title="Series" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">Series</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search series..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/podcasts/series/create')}>Add New</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as PodcastSeries).seriesId}
            hideSearch
            searchQuery={search}
            searchKeys={['seriesId', 'title', 'description', 'episodes.title', 'episodes.description', 'episodes.audioLink']}
            renderRowActions={(row) => {
              const s = row as PodcastSeries
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/podcasts/series/create', { state: { mode: 'edit', item: s } })}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDeleteSeries(s.seriesId)}>Delete</Button>
                </div>
              )
            }}
            actionsHeader="Actions"
            accordion
            renderAccordionContent={(row) => {
              const s = row as PodcastSeries
              return (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: 80 }}>Ep. #</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th style={{ width: 120 }}>Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(s.episodes || []).sort((a, b) => a.sequenceNumber - b.sequenceNumber).map((e) => (
                        <tr key={e.episodesId}>
                          <td>#{e.sequenceNumber}</td>
                          <td>{e.title}</td>
                          <td>{e.description || '-'}</td>
                          <td>{e.isActive ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }}
            columns={[
              { key: 'seriesId', header: 'ID', width: '80px', sortable: true },
              { key: 'title', header: 'Title', sortable: true },
              { key: 'description', header: 'Description' },
              { key: 'episodes.length', header: 'Episodes', render: (s) => (s as PodcastSeries).episodes?.length ?? 0 },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



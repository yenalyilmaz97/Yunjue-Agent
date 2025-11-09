import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { podcastService } from '@/services'
import type { PodcastEpisode } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'

const page = () => {
  const [items, setItems] = useState<PodcastEpisode[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<{ title: string; isVideo: boolean; src: string } | null>(null)
  const navigate = useNavigate()

  const handleDeleteEpisode = async (episodesId: number) => {
    if (!confirm('Bu bölümü silmek istediğinize emin misiniz?')) return
    await podcastService.deleteEpisode(episodesId)
    setItems((prev) => prev.filter((e) => e.episodesId !== episodesId))
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await podcastService.getAllEpisodes()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <PageTitle subName="Podcasts" title="Episodes" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">Episodes</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search episodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/podcasts/episodes/create')}>Add New</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as PodcastEpisode).episodesId}
            hideSearch
            searchQuery={search}
            searchKeys={['episodesId', 'seriesId', 'title', 'description']}
            renderRowActions={(row) => {
              const e = row as PodcastEpisode
              const previewSrc = e.content?.video || e.content?.audio || e.audioLink
              return (
                <div className="d-inline-flex gap-2">
                  {previewSrc && (
                    <Button size="sm" variant="outline-primary" onClick={() => setPreview({ title: e.title, isVideo: !!e.isVideo, src: previewSrc })}>Preview</Button>
                  )}
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/podcasts/episodes/create', { state: { mode: 'edit', item: e } })}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDeleteEpisode(e.episodesId)}>Delete</Button>
                </div>
              )
            }}
            actionsHeader="Actions"
            columns={[
              { key: 'episodesId', header: 'ID', width: '80px', sortable: true },
              { key: 'seriesId', header: 'Series ID', width: '100px', sortable: true },
              { key: 'title', header: 'Title', sortable: true },
              { key: 'description', header: 'Description' },
              {
                key: 'content',
                header: 'Content',
                render: (e) => {
                  const episode = e as PodcastEpisode
                  const audio = episode.content?.audio || episode.audioLink
                  const video = episode.content?.video
                  if (video) return <span className="text-muted">Video</span>
                  if (audio) return <span className="text-muted">Audio</span>
                  return <span className="text-muted">-</span>
                },
              },
              { key: 'isActive', header: 'Active', render: (e) => ((e as PodcastEpisode).isActive ? 'Yes' : 'No'), sortable: true },
            ]}
          />
        </CardBody>
      </Card>

      <Modal show={!!preview} onHide={() => setPreview(null)} centered size={preview?.isVideo ? 'lg' : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>{preview?.title || 'Preview'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {preview?.isVideo ? (
            <div className="ratio ratio-16x9">
              <video style={{ width: '100%', height: '100%' }} controls src={preview?.src} />
            </div>
          ) : (
            <audio style={{ width: '100%' }} controls src={preview?.src} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreview(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default page



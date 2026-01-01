import PageTitle from '@/components/PageTitle'
import { useEffect, useState, useMemo } from 'react'
import { podcastService } from '@/services'
import type { PodcastEpisode, PodcastSeries } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button, Modal, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
  const [items, setItems] = useState<PodcastEpisode[]>([])
  const [series, setSeries] = useState<PodcastSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | ''>('')
  const [preview, setPreview] = useState<{ title: string; isVideo: boolean; src: string } | null>(null)
  const navigate = useNavigate()

  const handleDeleteEpisode = async (episodesId: number) => {
    if (!confirm(t('podcasts.episodes.deleteConfirm'))) return
    await podcastService.deleteEpisode(episodesId)
    setItems((prev) => prev.filter((e) => e.episodesId !== episodesId))
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [episodesData, seriesData] = await Promise.all([
          podcastService.getAllEpisodes(),
          podcastService.getAllSeries()
        ])
        setItems(episodesData)
        setSeries(seriesData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter episodes based on selected series and search
  const filteredItems = useMemo(() => {
    let filtered = items

    // Filter by series
    if (selectedSeriesId !== '') {
      filtered = filtered.filter(e => e.seriesId === selectedSeriesId)
    }

    // Filter by search query
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(e => {
        const seriesTitle = e.podcastSeries?.title || e.seriesTitle || ''
        return (
          e.title?.toLowerCase().includes(searchLower) ||
          e.description?.toLowerCase().includes(searchLower) ||
          seriesTitle.toLowerCase().includes(searchLower) ||
          e.episodesId.toString().includes(searchLower) ||
          e.seriesId.toString().includes(searchLower)
        )
      })
    }

    return filtered
  }, [items, selectedSeriesId, search])

  return (
    <>
      <PageTitle subName={t('pages.podcasts')} title={t('podcasts.episodes.title')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">{t('podcasts.episodes.list')}</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <Form.Select
              size="sm"
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ width: '200px' }}
            >
              <option value="">{t('podcasts.episodes.allSeries') || 'Tüm Seriler'}</option>
              {series.map((s) => (
                <option key={s.seriesId} value={s.seriesId}>
                  {s.title}
                </option>
              ))}
            </Form.Select>
            <input
              className="form-control form-control-sm"
              placeholder={t('podcasts.episodes.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/podcasts/episodes/create')}>{t('podcasts.episodes.addNew')}</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={filteredItems}
            rowKey={(r) => (r as PodcastEpisode).episodesId}
            hideSearch
            searchQuery=""
            searchKeys={[]}
            renderRowActions={(row) => {
              const e = row as PodcastEpisode
              const previewSrc = e.content?.video || e.content?.audio || e.audioLink
              return (
                <div className="d-inline-flex gap-2">
                  {previewSrc && (
                    <Button size="sm" variant="outline-primary" onClick={() => setPreview({ title: e.title, isVideo: !!e.isVideo, src: previewSrc })}>{t('podcasts.episodes.preview')}</Button>
                  )}
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/podcasts/episodes/create', { state: { mode: 'edit', item: e } })}>{t('common.edit')}</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDeleteEpisode(e.episodesId)}>{t('common.delete')}</Button>
                </div>
              )
            }}
            actionsHeader={t('common.actions')}
            columns={[
              { key: 'sequenceNumber', header: t('podcasts.episodes.sequence') || 'Sıra', width: '80px', sortable: true },
              {
                key: 'seriesId',
                header: t('podcasts.episodes.seriesName') || 'Seri Adı',
                width: '200px',
                sortable: true,
                render: (e) => {
                  const episode = e as PodcastEpisode
                  return episode.podcastSeries?.title || episode.seriesTitle || `Seri #${episode.seriesId}`
                }
              },
              { key: 'title', header: t('podcasts.episodes.titleLabel'), sortable: true },
              { key: 'description', header: t('podcasts.episodes.descriptionLabel') },
              {
                key: 'content',
                header: t('podcasts.episodes.content'),
                render: (e) => {
                  const episode = e as PodcastEpisode
                  const audio = episode.content?.audio || episode.audioLink
                  const video = episode.content?.video
                  if (video) return <span className="text-muted">{t('podcasts.episodes.video')}</span>
                  if (audio) return <span className="text-muted">{t('podcasts.episodes.audio')}</span>
                  return <span className="text-muted">-</span>
                },
              },
              { key: 'isActive', header: t('podcasts.episodes.active'), render: (e) => ((e as PodcastEpisode).isActive ? t('common.yes') : t('common.no')), sortable: true },
            ]}
          />
        </CardBody>
      </Card>

      <Modal show={!!preview} onHide={() => setPreview(null)} centered size={preview?.isVideo ? 'lg' : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>{preview?.title || t('podcasts.episodes.preview')}</Modal.Title>
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
          <Button variant="secondary" onClick={() => setPreview(null)}>{t('common.close')}</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default page



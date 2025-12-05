import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { podcastService } from '@/services'
import type { PodcastSeries } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
  const [items, setItems] = useState<PodcastSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const handleDeleteSeries = async (seriesId: number) => {
    if (!confirm(t('podcasts.series.deleteConfirm'))) return
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
      <PageTitle subName={t('pages.podcasts')} title={t('podcasts.series.title')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">{t('podcasts.series.list')}</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder={t('podcasts.series.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/podcasts/series/create')}>{t('podcasts.series.addNew')}</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as PodcastSeries).seriesId}
            hideSearch
            searchQuery={search}
            searchKeys={['seriesId', 'title', 'description', 'episodes.title', 'episodes.description']}
            renderRowActions={(row) => {
              const s = row as PodcastSeries
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/podcasts/series/create', { state: { mode: 'edit', item: s } })}>{t('common.edit')}</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDeleteSeries(s.seriesId)}>{t('common.delete')}</Button>
                </div>
              )
            }}
            actionsHeader={t('common.actions')}
            accordion
            renderAccordionContent={(row) => {
              const s = row as PodcastSeries
              return (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: 80 }}>{t('podcasts.series.episodeNumber')}</th>
                        <th>{t('podcasts.episodes.titleLabel')}</th>
                        <th>{t('podcasts.episodes.descriptionLabel')}</th>
                        <th style={{ width: 120 }}>{t('podcasts.series.active')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(s.episodes || []).sort((a, b) => a.sequenceNumber - b.sequenceNumber).map((e) => (
                        <tr key={e.episodesId}>
                          <td>#{e.sequenceNumber}</td>
                          <td>{e.title}</td>
                          <td>{e.description || '-'}</td>
                          <td>{e.isActive ? t('common.yes') : t('common.no')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }}
            columns={[
              { key: 'seriesId', header: t('common.id') || 'ID', width: '80px', sortable: true },
              { key: 'title', header: t('podcasts.series.name'), sortable: true },
              { key: 'description', header: t('podcasts.series.description') },
              { key: 'episodes.length', header: t('podcasts.series.episodes'), render: (s) => (s as PodcastSeries).episodes?.length ?? 0 },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



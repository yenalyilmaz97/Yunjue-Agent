import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Movie } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
  const [items, setItems] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const navigate = useNavigate()
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await contentService.getAllMovies()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <PageTitle subName={t('pages.content')} title={t('weeklyContent.movies.title')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>{t('weeklyContent.movies.list')}</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder={t('weeklyContent.movies.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/content/movies/create')}>{t('weeklyContent.movies.addNew')}</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as Movie).movieId}
            hideSearch
            searchQuery={search}
            onSearchQueryChange={setSearch}
            searchPlaceholder={t('weeklyContent.movies.searchPlaceholder')}
            searchKeys={['movieTitle', 'movieId']}
            actionsHeader={t('common.actions')}
            renderRowActions={(row) => {
              const m = row as Movie
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/movies/create', { state: { mode: 'edit', item: m } })}>{t('common.edit')}</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm(t('weeklyContent.movies.deleteConfirm'))) {
                      await contentService.deleteMovie(m.movieId)
                      const data = await contentService.getAllMovies()
                      setItems(data)
                    }
                  }}>{t('common.delete')}</Button>
                </div>
              )
            }}
            columns={[
              { key: 'movieId', header: t('common.id') || 'ID', width: '80px', sortable: true },
              { key: 'movieTitle', header: t('weeklyContent.movies.titleLabel'), sortable: true },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



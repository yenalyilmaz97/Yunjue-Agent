import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Affirmation } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
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
      <PageTitle subName={t('pages.content')} title={t('weeklyContent.affirmations.title')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>{t('weeklyContent.affirmations.list')}</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder={t('weeklyContent.affirmations.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/content/affirmations/create')}>{t('weeklyContent.affirmations.addNew')}</Button>
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
            searchPlaceholder={t('weeklyContent.affirmations.searchPlaceholder')}
            searchKeys={['affirmationText', 'order']}
            actionsHeader={t('common.actions')}
            renderRowActions={(row) => {
              const a = row as Affirmation
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/affirmations/create', { state: { mode: 'edit', item: a } })}>{t('common.edit')}</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm(t('weeklyContent.affirmations.deleteConfirm'))) {
                      await contentService.deleteAffirmation(a.affirmationId)
                      const data = await contentService.getAllAffirmations()
                      setItems(data)
                    }
                  }}>{t('common.delete')}</Button>
                </div>
              )
            }}
            columns={[
              { key: 'order', header: t('weeklyContent.affirmations.order'), width: '80px', sortable: true },
              { 
                key: 'affirmationText', 
                header: t('weeklyContent.affirmations.titleColumn'), 
                sortable: true,
                render: (row) => (
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {(row as Affirmation).affirmationText?.trimEnd()}
                  </div>
                )
              },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



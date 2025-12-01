import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { weeklyService } from '@/services'
import type { WeeklyContent } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
  const [items, setItems] = useState<WeeklyContent[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await weeklyService.getAllWeeklyContent()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAutoGenerate = async () => {
    if (!confirm(t('weeklyContent.autoGenerateConfirm'))) {
      return
    }
    setGenerating(true)
    try {
      await weeklyService.generateWeeklyContent()
      await loadData()
    } catch (error) {
      console.error('Generate error:', error)
      alert(t('weeklyContent.generateError'))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <PageTitle subName={t('pages.content')} title={t('weeklyContent.title')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>{t('weeklyContent.list')}</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder={t('weeklyContent.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={handleAutoGenerate} disabled={generating}>
              {generating ? t('weeklyContent.generating') : t('weeklyContent.autoGenerate')}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as WeeklyContent).weekId}
            hideSearch
            searchQuery={search}
            onSearchQueryChange={setSearch}
            searchPlaceholder={t('weeklyContent.searchPlaceholder')}
            searchKeys={['weekOrder', 'music.musicTitle', 'movie.movieTitle', 'task.taskDescription', 'weeklyQuestion.weeklyQuestionText']}
            actionsHeader={t('common.actions')}
            renderRowActions={(row) => {
              const wc = row as WeeklyContent
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/weekly-content/create', { state: { mode: 'edit', item: wc } })}>{t('common.edit')}</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm(t('weeklyContent.deleteConfirm'))) {
                      await weeklyService.deleteWeeklyContent(wc.weekId)
                      await loadData()
                    }
                  }}>{t('common.delete')}</Button>
                </div>
              )
            }}
            columns={[
              { key: 'weekId', header: t('common.id') || 'ID', width: '80px', sortable: true },
              { key: 'weekOrder', header: t('weeklyContent.weekNumber'), width: '100px', sortable: true },
              { key: 'music.musicTitle', header: t('weeklyContent.musicTable'), render: (r) => (r as WeeklyContent).music?.musicTitle || '-' },
              { key: 'movie.movieTitle', header: t('weeklyContent.movieTable'), render: (r) => (r as WeeklyContent).movie?.movieTitle || '-' },
              { key: 'task.taskDescription', header: t('weeklyContent.taskTable'), render: (r) => (r as WeeklyContent).task?.taskDescription || '-' },
              { key: 'weeklyQuestion.weeklyQuestionText', header: t('weeklyContent.questionTable'), render: (r) => (r as WeeklyContent).weeklyQuestion?.weeklyQuestionText || '-' },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page


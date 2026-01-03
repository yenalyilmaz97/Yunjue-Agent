import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Task } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
  const [items, setItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await contentService.getAllTasks()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <PageTitle subName={t('pages.content')} title={t('weeklyContent.tasks.title')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>{t('weeklyContent.tasks.list')}</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder={t('weeklyContent.tasks.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/content/tasks/create')}>{t('weeklyContent.tasks.addNew')}</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as Task).taskId}
            hideSearch
            searchQuery={search}
            onSearchQueryChange={setSearch}
            searchPlaceholder={t('weeklyContent.tasks.searchPlaceholder')}
            searchKeys={['taskDescription', 'taskId']}
            actionsHeader={t('common.actions')}
            renderRowActions={(row) => {
              const task = row as Task
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/tasks/create', { state: { mode: 'edit', item: task } })}>{t('common.edit')}</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm(t('weeklyContent.tasks.deleteConfirm'))) {
                      await contentService.deleteTask(task.taskId)
                      const data = await contentService.getAllTasks()
                      setItems(data)
                    }
                  }}>{t('common.delete')}</Button>
                </div>
              )
            }}
            columns={[
              { key: 'taskDescription', header: t('weeklyContent.tasks.description'), sortable: true },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



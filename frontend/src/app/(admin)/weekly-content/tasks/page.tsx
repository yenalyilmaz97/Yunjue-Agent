import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { Task } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'

const page = () => {
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
      <PageTitle subName="Content" title="Tasks" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>Tasks</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/content/tasks/create')}>Add New</Button>
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
            searchPlaceholder="Search task..."
            searchKeys={['taskDescription', 'taskId']}
            actionsHeader="Actions"
            renderRowActions={(row) => {
              const t = row as Task
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/tasks/create', { state: { mode: 'edit', item: t } })}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm('Delete this task?')) {
                      await contentService.deleteTask(t.taskId)
                      const data = await contentService.getAllTasks()
                      setItems(data)
                    }
                  }}>Delete</Button>
                </div>
              )
            }}
            columns={[
              { key: 'taskId', header: 'ID', width: '80px', sortable: true },
              { key: 'taskDescription', header: 'Title', sortable: true },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



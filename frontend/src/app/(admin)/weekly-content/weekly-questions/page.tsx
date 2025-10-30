import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import type { WeeklyQuestion } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'

const page = () => {
  const [items, setItems] = useState<WeeklyQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const navigate = useNavigate()
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await contentService.getAllWeeklyQuestions()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <PageTitle subName="Content" title="Weekly Questions" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>Weekly Questions</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search weekly question..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/content/weekly-questions/create')}>Add New</Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as WeeklyQuestion).weeklyQuestionId}
            hideSearch
            searchQuery={search}
            onSearchQueryChange={setSearch}
            searchPlaceholder="Search weekly question..."
            searchKeys={['weeklyQuestionText', 'weeklyQuestionId']}
            actionsHeader="Actions"
            renderRowActions={(row) => {
              const q = row as WeeklyQuestion
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/weekly-questions/create', { state: { mode: 'edit', item: q } })}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm('Delete this weekly question?')) {
                      await contentService.deleteWeeklyQuestion(q.weeklyQuestionId)
                      const data = await contentService.getAllWeeklyQuestions()
                      setItems(data)
                    }
                  }}>Delete</Button>
                </div>
              )
            }}
            columns={[
              { key: 'weeklyQuestionId', header: 'ID', width: '80px', sortable: true },
              { key: 'weeklyQuestionText', header: 'Title', sortable: true },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



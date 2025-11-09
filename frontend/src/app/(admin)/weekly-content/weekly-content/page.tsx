import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { weeklyService } from '@/services'
import type { WeeklyContent } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'

const page = () => {
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
    if (!confirm('Generate new weekly content automatically? This will create a new week with random selections from available music, movies, tasks, and questions.')) {
      return
    }
    setGenerating(true)
    try {
      await weeklyService.generateWeeklyContent()
      await loadData()
    } catch (error) {
      console.error('Generate error:', error)
      alert('Failed to generate weekly content. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <PageTitle subName="Content" title="Weekly Content" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>Weekly Content List</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search weekly content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={handleAutoGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Auto Generate'}
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
            searchPlaceholder="Search weekly content..."
            searchKeys={['weekOrder', 'music.musicTitle', 'movie.movieTitle', 'task.taskDescription', 'weeklyQuestion.weeklyQuestionText']}
            actionsHeader="Actions"
            renderRowActions={(row) => {
              const wc = row as WeeklyContent
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/weekly-content/create', { state: { mode: 'edit', item: wc } })}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm('Delete this weekly content?')) {
                      await weeklyService.deleteWeeklyContent(wc.weekId)
                      await loadData()
                    }
                  }}>Delete</Button>
                </div>
              )
            }}
            columns={[
              { key: 'weekId', header: 'ID', width: '80px', sortable: true },
              { key: 'weekOrder', header: 'Week #', width: '100px', sortable: true },
              { key: 'music.musicTitle', header: 'Music', render: (r) => (r as WeeklyContent).music?.musicTitle || '-' },
              { key: 'movie.movieTitle', header: 'Movie', render: (r) => (r as WeeklyContent).movie?.movieTitle || '-' },
              { key: 'task.taskDescription', header: 'Task', render: (r) => (r as WeeklyContent).task?.taskDescription || '-' },
              { key: 'weeklyQuestion.weeklyQuestionText', header: 'Question', render: (r) => (r as WeeklyContent).weeklyQuestion?.weeklyQuestionText || '-' },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page


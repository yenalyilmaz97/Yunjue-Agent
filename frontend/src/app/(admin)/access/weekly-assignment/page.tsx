import PageTitle from '@/components/PageTitle'
import { useEffect, useMemo, useState } from 'react'
import { userWeeklyAssignmentService } from '@/services'
import type { UserAssignmentSummary } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'

const page = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<UserAssignmentSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await userWeeklyAssignmentService.getUserAssignmentSummaries()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(
      (s) =>
        s.user.firstName.toLowerCase().includes(q) ||
        s.user.lastName.toLowerCase().includes(q) ||
        s.user.userName.toLowerCase().includes(q) ||
        s.user.email.toLowerCase().includes(q) ||
        (s.currentAssignment && (`week ${s.currentAssignment.assignedWeekNumber}`.toLowerCase().includes(q) || s.currentAssignment.assignedYear.toString().includes(q))),
    )
  }, [items, search])

  return (
    <>
      <PageTitle subName="Access" title="Weekly Assignment" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">User Weekly Assignments</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search user/week..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            {/* <Button size="sm" variant="primary">Assign Week</Button> */}
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={filtered}
            rowKey={(r) => (r as any).user.userId}
            hideSearch
            searchQuery={search}
            searchKeys={['user.firstName', 'user.lastName', 'user.userName', 'user.email']}
            accordion
            renderRowActions={(row) => {
              const s = row as any
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/access/weekly/edit', { state: { user: s.user } })}>Edit</Button>
                </div>
              )
            }}
            actionsHeader="Actions"
            columns={[
              { key: 'user.userName', header: 'User', sortable: true, render: (r) => `${(r as any).user.firstName} ${(r as any).user.lastName} (${(r as any).user.userName})` },
              { key: 'user.email', header: 'Email' },
              { key: 'currentAssignment.assignedWeekNumber', header: 'Week', width: '100px' },
              { key: 'currentAssignment.assignedYear', header: 'Year', width: '100px' },
              { key: 'currentAssignment.isOverride', header: 'Override', width: '120px', render: (r) => ((r as any).currentAssignment?.isOverride ? 'Yes' : 'No') },
            ]}
            renderAccordionContent={(row) => {
              const s = row as any
              return (
                <div className="row g-3">
                  <div className="col-md-4">
                    <strong>User</strong>
                    <div>ID: {s.user.userId}</div>
                    <div>Email: {s.user.email}</div>
                  </div>
                  <div className="col-md-5">
                    <strong>Assignment</strong>
                    {s.currentAssignment ? (
                      <>
                        <div>Week: {s.currentAssignment.assignedWeekNumber}</div>
                        <div>Year: {s.currentAssignment.assignedYear}</div>
                        <div>Override: {s.currentAssignment.isOverride ? 'Yes' : 'No'}</div>
                      </>
                    ) : (
                      <div>Following calendar week</div>
                    )}
                  </div>
                  <div className="col-md-3 d-flex align-items-start gap-2 justify-content-end">
                    <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/access/weekly/edit', { state: { user: s.user } })}>Edit</Button>
                    {/* <Button size="sm" variant="outline-danger">Remove</Button> */}
                  </div>
                </div>
              )
            }}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



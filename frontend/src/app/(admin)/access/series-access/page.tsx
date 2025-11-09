import PageTitle from '@/components/PageTitle'
import { useEffect, useMemo, useState } from 'react'
import { userSeriesAccessService } from '@/services'
import type { UserSeriesAccess } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'

const page = () => {
  const [items, setItems] = useState<UserSeriesAccess[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await userSeriesAccessService.getAllUserSeriesAccess()
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
      (a) =>
        a.user?.firstName?.toLowerCase().includes(q) ||
        a.user?.lastName?.toLowerCase().includes(q) ||
        a.user?.userName?.toLowerCase().includes(q) ||
        a.user?.email?.toLowerCase().includes(q) ||
        a.podcastSeries?.title?.toLowerCase().includes(q) ||
        a.article?.title?.toLowerCase().includes(q),
    )
  }, [items, search])

  const groupedByUser = useMemo(() => {
    const map = new Map<number, { accesses: UserSeriesAccess[]; userName: string; email: string }>()
    for (const a of filtered) {
      if (!a.userId) continue
      const key = a.userId
      const entry = map.get(key)
      if (entry) {
        entry.accesses.push(a)
      } else {
        map.set(key, {
          accesses: [a],
          userName: `${a.user?.firstName ?? ''} ${a.user?.lastName ?? ''} (${a.user?.userName ?? ''})`.trim(),
          email: a.user?.email ?? '',
        })
      }
    }
    return Array.from(map.entries()).map(([userId, val]) => ({ userId, ...val }))
  }, [filtered])

  const revoke = async (userId: number, seriesId?: number | null, articleId?: number | null) => {
    if (!confirm('Bu erişimi kaldırmak istediğinize emin misiniz?')) return
    await userSeriesAccessService.revokeAccess({ userId, seriesId, articleId })
    setItems((prev) => prev.filter((x) => !(x.userId === userId && (x.seriesId === seriesId || x.articleId === articleId))))
  }

  return (
    <>
      <PageTitle subName="Access" title="Series Access" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">User Series Access</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search user/series..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            {/* <Button size="sm" variant="primary" onClick={() => navigate('/admin/access/series/grant')}>Grant Access</Button> */}
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={groupedByUser}
            rowKey={(r) => (r as any).userId}
            hideSearch
            searchQuery={search}
            searchKeys={['userName', 'email']}
            accordion
            // renderRowActions={(row) => (
            //   <div className="d-inline-flex gap-2">
            //     <Button size="sm" variant="outline-primary">Grant</Button>
            //   </div>
            // )}
            actionsHeader="Actions"
            columns={[
              { key: 'userName', header: 'User', sortable: true },
              { key: 'email', header: 'Email' },
              { key: 'accesses.length', header: 'Series Count', width: '140px', sortable: true },
            ]}
            renderAccordionContent={(row) => {
              const g = row as unknown as { accesses: typeof items; userId: number }
              return (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: 100 }}>Type</th>
                        <th style={{ width: 100 }}>ID</th>
                        <th>Title</th>
                        <th style={{ width: 160 }}>Current Seq</th>
                        <th style={{ width: 160 }} className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.accesses.map((a: any) => (
                        <tr key={a.userSeriesAccessId}>
                          <td>{a.seriesId ? 'Series' : a.articleId ? 'Article' : '-'}</td>
                          <td>{a.seriesId || a.articleId || '-'}</td>
                          <td>{a.podcastSeries?.title || a.article?.title || '-'}</td>
                          <td>{a.currentAccessibleSequence}</td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-2">
                              <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/access/series/edit', { state: { item: a } })}>Edit</Button>
                              <Button size="sm" variant="outline-danger" onClick={() => revoke(a.userId, a.seriesId, a.articleId)}>Revoke</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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



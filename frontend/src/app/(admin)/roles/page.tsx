import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { roleService } from '@/services'
import type { Role } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import DataTable from '@/components/table/DataTable'

const page = () => {
  const [items, setItems] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await roleService.getAllRoles()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <PageTitle subName="Users" title="Roles" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">Roles</CardTitle>
          <input
            className="form-control form-control-sm ms-auto"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as Role).roleId}
            hideSearch
            searchQuery={search}
            searchKeys={['roleId', 'roleName']}
            columns={[
              { key: 'roleId', header: 'ID', width: '80px', sortable: true },
              { key: 'roleName', header: 'Role', sortable: true },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



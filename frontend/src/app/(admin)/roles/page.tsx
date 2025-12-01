import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { roleService } from '@/services'
import type { Role } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'
import DataTable from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
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
      <PageTitle subName={t('pages.users')} title={t('roles.title')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">{t('roles.list')}</CardTitle>
          <input
            className="form-control form-control-sm ms-auto"
            placeholder={t('roles.searchPlaceholder')}
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
              { key: 'roleId', header: t('common.id') || 'ID', width: '80px', sortable: true },
              { key: 'roleName', header: t('roles.role'), sortable: true },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page



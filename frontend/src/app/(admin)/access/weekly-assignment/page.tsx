import PageTitle from '@/components/PageTitle'
import { useEffect, useMemo, useState } from 'react'
import { userWeeklyAssignmentService, dailyContentService } from '@/services'
import type { UserAssignmentSummary } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [items, setItems] = useState<UserAssignmentSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [incrementingDaily, setIncrementingDaily] = useState(false)

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

  const handleIncrementDailyContent = async () => {
    if (!confirm(t('access.weeklyAssignment.incrementDailyConfirm') || 'Günlük içerik sayısını güncellemek istediğinizden emin misiniz? Tüm kullanıcılar kontrol edilecek ve progress kayıtlarına göre güncellenecektir.')) return
    
    setIncrementingDaily(true)
    try {
      const result = await dailyContentService.incrementDailyContentForAllUsers()
      alert(result.message || `Başarılı: ${result.updatedCount} kullanıcı güncellendi.`)
      // Reload data
      const data = await userWeeklyAssignmentService.getUserAssignmentSummaries()
      setItems(data)
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Günlük içerik güncellenirken bir hata oluştu.')
    } finally {
      setIncrementingDaily(false)
    }
  }

  return (
    <>
      <PageTitle subName={t('pages.access') || t('sidebar.access')} title={t('access.weeklyAssignment.title')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">{t('access.weeklyAssignment.list')}</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder={t('access.weeklyAssignment.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button 
              size="sm" 
              variant="info" 
              onClick={handleIncrementDailyContent}
              disabled={incrementingDaily}
            >
              {incrementingDaily ? t('common.loading') || 'Yükleniyor...' : t('access.weeklyAssignment.incrementDaily') || 'Günlük İçerik Güncelle'}
            </Button>
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
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/access/weekly/edit', { state: { user: s.user } })}>{t('common.edit')}</Button>
                </div>
              )
            }}
            actionsHeader={t('common.actions')}
            columns={[
              { key: 'user.userName', header: t('access.weeklyAssignment.user'), sortable: true, render: (r) => `${(r as any).user.firstName} ${(r as any).user.lastName} (${(r as any).user.userName})` },
              { key: 'user.email', header: t('users.email') },
              { key: 'currentAssignment.assignedWeekNumber', header: t('access.weeklyAssignment.week'), width: '100px' },
              { key: 'currentAssignment.assignedYear', header: t('access.weeklyAssignment.year'), width: '100px' },
              { key: 'currentAssignment.isOverride', header: t('access.weeklyAssignment.override'), width: '120px', render: (r) => ((r as any).currentAssignment?.isOverride ? t('common.yes') : t('common.no')) },
            ]}
            renderAccordionContent={(row) => {
              const s = row as any
              return (
                <div className="row g-3">
                  <div className="col-md-4">
                    <strong>{t('access.weeklyAssignment.user')}</strong>
                    <div>{t('common.id')}: {s.user.userId}</div>
                    <div>{t('users.email')}: {s.user.email}</div>
                  </div>
                  <div className="col-md-5">
                    <strong>{t('access.weeklyAssignment.assignment')}</strong>
                    {s.currentAssignment ? (
                      <>
                        <div>{t('access.weeklyAssignment.week')}: {s.currentAssignment.assignedWeekNumber}</div>
                        <div>{t('access.weeklyAssignment.year')}: {s.currentAssignment.assignedYear}</div>
                        <div>{t('access.weeklyAssignment.override')}: {s.currentAssignment.isOverride ? t('common.yes') : t('common.no')}</div>
                      </>
                    ) : (
                      <div>{t('access.weeklyAssignment.followingCalendarWeek')}</div>
                    )}
                  </div>
                  <div className="col-md-3 d-flex align-items-start gap-2 justify-content-end">
                    <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/access/weekly/edit', { state: { user: s.user } })}>{t('common.edit')}</Button>
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



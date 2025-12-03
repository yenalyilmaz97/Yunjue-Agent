import PageTitle from '@/components/PageTitle'
import { useEffect, useMemo, useState } from 'react'
import { userSeriesAccessService } from '@/services'
import type { UserSeriesAccess } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
  const [items, setItems] = useState<UserSeriesAccess[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [bulkGranting, setBulkGranting] = useState(false)
  const [incrementing, setIncrementing] = useState(false)
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
    if (!confirm(t('access.seriesAccess.revokeConfirm'))) return
    await userSeriesAccessService.revokeAccess({ userId, seriesId, articleId })
    setItems((prev) => prev.filter((x) => !(x.userId === userId && (x.seriesId === seriesId || x.articleId === articleId))))
  }

  const handleBulkGrant = async () => {
    if (!confirm(t('access.seriesAccess.bulkGrantConfirm') || 'Tüm kullanıcılara tüm serilerin 1. bölümlerine erişim vermek istediğinizden emin misiniz? Mevcut erişimler korunacaktır.')) return
    
    setBulkGranting(true)
    try {
      const result = await userSeriesAccessService.bulkGrantAccess()
      alert(result.message || `Başarılı: ${result.grantedCount} erişim verildi, ${result.skippedCount} atlandı.`)
      // Reload data
      const data = await userSeriesAccessService.getAllUserSeriesAccess()
      setItems(data)
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Toplu erişim verilirken bir hata oluştu.')
    } finally {
      setBulkGranting(false)
    }
  }

  const handleIncrementSequence = async () => {
    if (!confirm(t('access.seriesAccess.incrementSequenceConfirm') || 'Tamamlanmış episode\'lere göre kullanıcıların erişilebilir bölüm numaralarını artırmak istediğinizden emin misiniz?')) return
    
    setIncrementing(true)
    try {
      const result = await userSeriesAccessService.incrementAccessibleSequence()
      alert(result.message || `Başarılı: ${result.grantedCount} kullanıcı-serisi kombinasyonu güncellendi, ${result.skippedCount} atlandı.`)
      // Reload data
      const data = await userSeriesAccessService.getAllUserSeriesAccess()
      setItems(data)
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Erişilebilir bölüm numaraları artırılırken bir hata oluştu.')
    } finally {
      setIncrementing(false)
    }
  }

  return (
    <>
      <PageTitle subName={t('pages.access') || t('sidebar.access')} title={t('access.seriesAccess.title')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">{t('access.seriesAccess.list')}</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder={t('access.seriesAccess.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button 
              size="sm" 
              variant="info" 
              onClick={handleIncrementSequence}
              disabled={incrementing || bulkGranting}
            >
              {incrementing ? t('common.loading') || 'Yükleniyor...' : t('access.seriesAccess.incrementSequence') || 'Kontrol Et'}
            </Button>
            <Button 
              size="sm" 
              variant="success" 
              onClick={handleBulkGrant}
              disabled={bulkGranting || incrementing}
            >
              {bulkGranting ? t('common.loading') || 'Yükleniyor...' : t('access.seriesAccess.bulkGrant') || 'Toplu Erişim Ver'}
            </Button>
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
            actionsHeader={t('common.actions')}
            columns={[
              { key: 'userName', header: t('access.seriesAccess.user'), sortable: true },
              { key: 'email', header: t('users.email') },
              { key: 'accesses.length', header: t('access.seriesAccess.seriesCount'), width: '140px', sortable: true },
            ]}
            renderAccordionContent={(row) => {
              const g = row as unknown as { accesses: typeof items; userId: number }
              return (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: 100 }}>{t('access.seriesAccess.type')}</th>
                        <th style={{ width: 100 }}>{t('access.seriesAccess.id')}</th>
                        <th>{t('access.seriesAccess.title')}</th>
                        <th style={{ width: 160 }}>{t('access.seriesAccess.currentSeq')}</th>
                        <th style={{ width: 160 }} className="text-end">{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.accesses.map((a: any) => (
                        <tr key={a.userSeriesAccessId}>
                          <td>{a.seriesId ? t('podcasts.series.title') : a.articleId ? t('articles.title') : '-'}</td>
                          <td>{a.seriesId || a.articleId || '-'}</td>
                          <td>{a.podcastSeries?.title || a.article?.title || '-'}</td>
                          <td>{a.currentAccessibleSequence}</td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-2">
                              <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/access/series/edit', { state: { item: a } })}>{t('common.edit')}</Button>
                              <Button size="sm" variant="outline-danger" onClick={() => revoke(a.userId, a.seriesId, a.articleId)}>{t('access.seriesAccess.revoke')}</Button>
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



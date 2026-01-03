import PageTitle from '@/components/PageTitle'
import { useEffect, useMemo, useState } from 'react'
import { userService, dailyContentService } from '@/services'
import type { User } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button, Modal, Form } from 'react-bootstrap'
import DataTable from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useForm } from 'react-hook-form'

const DailyContentAccessPage = () => {
    const { t } = useI18n()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [incrementingDaily, setIncrementingDaily] = useState(false)

    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const { register, handleSubmit, reset } = useForm<{ dailyContentDayOrder: number }>()

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await userService.getAllUsers()
            setUsers(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const filtered = useMemo(() => {
        let result = users
        if (search) {
            const q = search.toLowerCase()
            result = users.filter(
                (u) =>
                    u.firstName.toLowerCase().includes(q) ||
                    u.lastName.toLowerCase().includes(q) ||
                    u.userName.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q)
            )
        }
        // Sort by dailyContentDayOrder
        return [...result].sort((a, b) => (a.dailyContentDayOrder || 0) - (b.dailyContentDayOrder || 0))
    }, [users, search])

    const handleIncrementDailyContent = async () => {
        if (!confirm(t('access.weeklyAssignment.incrementDailyConfirm') || 'Günlük içerik sayısını güncellemek istediğinizden emin misiniz? Tüm kullanıcılar kontrol edilecek ve progress kayıtlarına göre güncellenecektir.')) return

        setIncrementingDaily(true)
        try {
            const result = await dailyContentService.incrementDailyContentForAllUsers()
            alert(result.message || `Başarılı: ${result.updatedCount} kullanıcı güncellendi.`)
            loadData()
        } catch (error: any) {
            alert(error?.response?.data?.message || error?.message || 'Günlük içerik güncellenirken bir hata oluştu.')
        } finally {
            setIncrementingDaily(false)
        }
    }

    const handleEditClick = (user: User) => {
        setSelectedUser(user)
        reset({ dailyContentDayOrder: user.dailyContentDayOrder || 0 })
        setShowEditModal(true)
    }

    const onEditSubmit = handleSubmit(async (data) => {
        if (!selectedUser) return

        try {
            await userService.updateUser(selectedUser.userId, {
                userId: selectedUser.userId,
                userName: selectedUser.userName,
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                email: selectedUser.email,
                dateOfBirth: selectedUser.dateOfBirth,
                gender: selectedUser.gender,
                city: selectedUser.city,
                phone: selectedUser.phone,
                description: selectedUser.description,
                subscriptionEnd: selectedUser.subscriptionEnd,
                keciTimeEnd: selectedUser.keciTimeEnd,
                roleId: selectedUser.roleId,
                dailyContentDayOrder: parseInt(data.dailyContentDayOrder.toString()),
            } as any)

            setShowEditModal(false)
            loadData()
            alert("Güncellendi")
        } catch (error: any) {
            alert(error?.message || "Hata oluştu")
        }
    })

    return (
        <>
            <PageTitle subName={t('pages.access') || t('sidebar.access')} title="Günlük İçerik Erişimi" />
            <Card>
                <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                    <CardTitle as={'h5'} className="mb-0">Kullanıcı Listesi</CardTitle>
                    <div className="d-flex align-items-center gap-2 ms-auto">
                        <input
                            className="form-control form-control-sm"
                            placeholder={t('access.weeklyAssignment.searchPlaceholder') || "Ara..."}
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
                            {incrementingDaily ? t('common.loading') || 'Yükleniyor...' : t('access.weeklyAssignment.incrementDaily') || 'Tüm Kullanıcıların Günlük İçeriğini Güncelle'}
                        </Button>
                    </div>
                </CardHeader>
                <CardBody>
                    <DataTable
                        isLoading={loading}
                        data={filtered}
                        rowKey={(r) => r.userId}
                        hideSearch
                        columns={[
                            { key: 'userName', header: t('access.weeklyAssignment.user'), sortable: true, render: (r) => `${(r as User).firstName} ${(r as User).lastName} (${(r as User).userName})` },
                            { key: 'email', header: t('users.email') },
                            { key: 'dailyContentDayOrder', header: 'Günlük İçerik Sırası', width: '150px', render: (r) => (r as User).dailyContentDayOrder || '-' },
                            {
                                key: 'actions',
                                header: t('common.actions'),
                                width: '100px',
                                render: (r) => (
                                    <Button size="sm" variant="outline-primary" onClick={() => handleEditClick(r as User)}>
                                        <IconifyIcon icon="mdi:pencil" />
                                    </Button>
                                )
                            }
                        ]}
                    />
                </CardBody>
            </Card>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Form onSubmit={onEditSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Günlük İçerik Sırası Düzenle</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Günlük İçerik Sırası (Gün)</Form.Label>
                            <Form.Control type="number" {...register('dailyContentDayOrder')} />
                            <Form.Text className="text-muted">
                                Kullanıcının görmesi gereken günlük içerik gün numarasını giriniz (Örn: 1, 2, 5).
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>{t('common.cancel')}</Button>
                        <Button variant="primary" type="submit">{t('common.save')}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    )
}

export default DailyContentAccessPage

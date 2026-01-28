import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { popupService } from '@/services'
import type { Popup } from '@/types/keci/popup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import DataTable from '@/components/table/DataTable'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n/context'

const page = () => {
    const { t } = useI18n()
    const [items, setItems] = useState<Popup[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const navigate = useNavigate()

    const load = async () => {
        setLoading(true)
        try {
            const data = await popupService.getAllPopups()
            setItems(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.deleteConfirm') || 'Are you sure you want to delete this popup?')) return
        try {
            await popupService.deletePopup(id)
            setItems((prev) => prev.filter((u) => u.id !== id))
        } catch (error) {
            console.error(error)
            alert('Error deleting popup')
        }
    }

    const handleActivate = async (id: number) => {
        if (!confirm('Are you sure you want to activate this popup? This will reset the "Seen" status for ALL users.')) return
        try {
            await popupService.activatePopup(id)
            await load() // Reload to see status changes
            alert('Popup activated successfully!')
        } catch (error) {
            console.error(error)
            alert('Error activating popup')
        }
    }

    return (
        <>
            <PageTitle subName="Admin" title={t('common.popups') || 'Popups'} />
            <Card>
                <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                    <CardTitle as={'h5'} className="mb-0">{t('common.list') || 'List'}</CardTitle>
                    <input
                        className="form-control form-control-sm ms-auto"
                        placeholder={t('common.search') || 'Search...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 260 }}
                    />
                    <Button size="sm" variant="primary" onClick={() => navigate('/admin/popups/create')}>
                        <IconifyIcon icon="mdi:plus" className="me-1" /> {t('common.addNew') || 'Add New'}
                    </Button>
                </CardHeader>
                <CardBody>
                    <DataTable<Popup>
                        isLoading={loading}
                        data={items}
                        rowKey={(r) => r.id}
                        hideSearch
                        searchQuery={search}
                        searchKeys={['id', 'title']}
                        columns={[
                            { key: 'id', header: 'ID', width: '80px', sortable: true },
                            {
                                key: 'imageUrl',
                                header: t('common.image') || 'Image',
                                render: (r) => (
                                    <img
                                        src={r.imageUrl}
                                        alt={r.title}
                                        style={{ height: '40px', width: 'auto', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                )
                            },
                            { key: 'title', header: t('common.title') || 'Title', sortable: true },
                            {
                                key: 'isActive',
                                header: t('common.status') || 'Status',
                                sortable: true,
                                render: (r) => (
                                    r.isActive
                                        ? <Badge bg="success">Active</Badge>
                                        : <Badge bg="secondary">Inactive</Badge>
                                )
                            },
                            {
                                key: 'repeatable',
                                header: 'Repeatable',
                                sortable: true,
                                render: (r) => (
                                    r.repeatable
                                        ? <Badge bg="info">Yes</Badge>
                                        : <Badge bg="light" text="dark">No</Badge>
                                )
                            },
                            {
                                key: 'actions',
                                header: t('common.actions'),
                                width: '180px',
                                render: (r) => {
                                    return (
                                        <div className="d-flex gap-2">
                                            {!r.isActive && (
                                                <Button variant="outline-success" size="sm" onClick={() => handleActivate(r.id)} title="Activate">
                                                    <IconifyIcon icon="mdi:play" />
                                                </Button>
                                            )}

                                            <Button variant="outline-primary" size="sm" onClick={() => navigate('/admin/popups/create', { state: { mode: 'edit', item: r } })}>
                                                <IconifyIcon icon="mdi:pencil" />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(r.id)}>
                                                <IconifyIcon icon="mdi:delete" />
                                            </Button>
                                        </div>
                                    )
                                },
                            },
                        ]}
                    />
                </CardBody>
            </Card>
        </>
    )
}

export default page

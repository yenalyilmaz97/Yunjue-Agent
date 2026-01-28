import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentUpdateService } from '@/services'
import type { ContentUpdateBatch } from '@/types/keci/content-update'
import { Button, Card, CardBody, CardHeader, CardTitle, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import DataTable from '@/components/table/DataTable'
import { useI18n } from '@/i18n/context'

const page = () => {
    const { t } = useI18n()
    const [items, setItems] = useState<ContentUpdateBatch[]>([])
    const [loading, setLoading] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const data = await contentUpdateService.getRecentBatches(50)
            setItems(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleDownload = async (batchId: string) => {
        try {
            await contentUpdateService.downloadPdf(batchId)
        } catch (error) {
            console.error("Download failed", error)
            alert("PDF Download failed")
        }
    }

    return (
        <>
            <PageTitle subName="Admin" title={t('common.updateHistory') || 'Update History'} />
            <Card>
                <CardHeader>
                    <CardTitle as={'h5'}>{t('common.updateHistory') || 'Update History'}</CardTitle>
                </CardHeader>
                <CardBody>
                    <DataTable<ContentUpdateBatch>
                        isLoading={loading}
                        data={items}
                        rowKey={(r) => r.batchId}
                        hideSearch
                        columns={[
                            {
                                key: 'createdAt',
                                header: t('common.date') || 'Date',
                                sortable: true,
                                render: (r) => new Date(r.createdAt).toLocaleString()
                            },
                            { key: 'updateType', header: t('common.type') || 'Type', sortable: true },
                            { key: 'description', header: t('common.description') || 'Description' },
                            {
                                key: 'affectedUserCount',
                                header: 'Minions Updated',
                                sortable: true,
                                render: (r) => <Badge bg="info">{r.affectedUserCount}</Badge>
                            },
                            {
                                key: 'actions',
                                header: t('common.actions'),
                                width: '100px',
                                render: (r) => (
                                    <Button variant="outline-secondary" size="sm" onClick={() => handleDownload(r.batchId)} title="Download PDF">
                                        <IconifyIcon icon="mdi:file-pdf-box" />
                                    </Button>
                                )
                            }
                        ]}
                    />
                </CardBody>
            </Card>
        </>
    )
}

export default page

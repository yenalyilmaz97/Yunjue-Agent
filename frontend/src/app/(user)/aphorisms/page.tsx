'use client'

import PageTitle from '@/components/PageTitle'
import DailyContentCard from '@/components/dashboard/DailyContentCard'
import { useEffect, useState } from 'react'
import { dailyContentService } from '@/services'
import type { DailyContentResponseDTO } from '@/services/dailyContent'
import { useAuthContext } from '@/context/useAuthContext'
import { Container, Spinner, Accordion, Form } from 'react-bootstrap'
import { Icon } from '@iconify/react'

const AphorismsPage = () => {
    const { user } = useAuthContext()
    const [history, setHistory] = useState<DailyContentResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeKeys, setActiveKeys] = useState<string[]>([])

    useEffect(() => {
        if (user?.id) {
            const userId = parseInt(user.id)
            dailyContentService
                .getDailyContentHistory(userId)
                .then((data) => {
                    setHistory(data)
                    setLoading(false)
                    // If items exist, open the first one by default
                    if (data.length > 0) {
                        setActiveKeys([data[0].dailyContentId.toString()])
                    }
                })
                .catch((error) => {
                    console.error('Error fetching history:', error)
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [user])

    // Update active keys when search changes or history loads
    useEffect(() => {
        if (history.length === 0) return

        if (searchQuery) {
            // If searching, expand all matching items
            const query = searchQuery.toLowerCase()
            const matchingIds = history.filter(item => {
                const aphorismMatch = item.aphorism?.aphorismText?.toLowerCase().includes(query)
                const affirmationMatch = item.affirmation?.affirmationText?.toLowerCase().includes(query)
                return aphorismMatch || affirmationMatch
            }).map(item => item.dailyContentId.toString())
            setActiveKeys(matchingIds)
        } else if (activeKeys.length === 0 && history.length > 0) {
            // If clearing search/initial load and nothing is selected, select the first one
            // This logic allows user to close everything if they want, unless they search again.
            // But to be consistent with "reverting search" usually implying "reset view":
            if (activeKeys.length === 0) {
                setActiveKeys([history[0].dailyContentId.toString()])
            }
        }
    }, [searchQuery, history])

    const handleSelect = (eventKey: string | string[] | null | undefined) => {
        if (!eventKey) {
            setActiveKeys([])
        } else if (Array.isArray(eventKey)) {
            setActiveKeys(eventKey)
        } else {
            setActiveKeys([eventKey as string])
        }
    }

    if (loading) {
        return (
            <>
                <PageTitle subName="Geçmiş İçerikler" title="Aforizmalar ve Olumlamalar" />
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                    <Spinner animation="border" variant="primary" />
                </div>
            </>
        )
    }

    return (
        <>
            <PageTitle subName="Geçmiş İçerikler" title="Aforizmalar ve Olumlamalar" />

            <Container className="px-0">
                {history.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <p>Henüz açılmış içerik bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="mb-5">

                        {/* Modern Search Bar */}
                        <div className="mb-3 d-flex justify-content-center">
                            <div className="position-relative w-100" style={{ maxWidth: '600px' }}>
                                <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                                    <Icon icon="mingcute:search-line" fontSize={20} style={{ opacity: 0.6 }} />
                                </div>
                                <Form.Control
                                    placeholder="İlham veren kelimeler ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border-0 shadow-sm ps-5 py-2 rounded-4 form-control"
                                />
                            </div>
                        </div>

                        {(() => {
                            const filteredHistory = history.filter(item => {
                                if (!searchQuery) return true
                                const query = searchQuery.toLowerCase()
                                const aphorismMatch = item.aphorism?.aphorismText?.toLowerCase().includes(query)
                                const affirmationMatch = item.affirmation?.affirmationText?.toLowerCase().includes(query)
                                return aphorismMatch || affirmationMatch
                            })

                            if (filteredHistory.length === 0) {
                                return (
                                    <div className="text-center text-muted py-5 opacity-75">
                                        <div className="mb-3">
                                            <Icon icon="mingcute:ghost-line" fontSize={48} />
                                        </div>
                                        <p className="lead fs-6">Aradığınız kriterlere uygun içerik bulunamadı.</p>
                                    </div>
                                )
                            }

                            return (
                                <Accordion
                                    activeKey={activeKeys}
                                    onSelect={handleSelect}
                                    alwaysOpen
                                >
                                    {filteredHistory.map((item) => (
                                        <Accordion.Item eventKey={item.dailyContentId.toString()} key={item.dailyContentId} className="mb-2 border-0 rounded-3 shadow-sm overflow-hidden">
                                            <Accordion.Header className="custom-accordion-header">
                                                <div className="d-flex align-items-center gap-2 py-0">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                                        <Icon icon="mingcute:calendar-line" className="text-primary" />
                                                    </div>
                                                    <span className="fw-medium text-body">Gün {item.dayOrder}</span>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body className="pt-0 pb-3 px-3 border-top-0">
                                                <DailyContentCard dailyContent={item} />
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            )
                        })()}
                    </div>
                )}
            </Container>
        </>
    )
}

export default AphorismsPage

import PageTitle from '@/components/PageTitle'
import { useEffect, useMemo, useState } from 'react'
import { contentService, notesService, userService } from '@/services'
import type { Article, Note, User } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button, Badge, Accordion, Form } from 'react-bootstrap'
import DataTable from '@/components/table/DataTable'
import { Icon } from '@iconify/react'
import { useI18n } from '@/i18n/context'

interface UserWithNoteCount extends User {
    noteCount: number
}

interface NoteGroup {
    seriesTitle: string
    episodeTitle: string
    episodeId: number | null | undefined
    note: Note
}

const AdminNotesPage = () => {
    const { t } = useI18n()
    const [allNotes, setAllNotes] = useState<Note[]>([])
    const [allUsers, setAllUsers] = useState<User[]>([])
    const [allArticles, setAllArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [userNotes, setUserNotes] = useState<Note[]>([])
    const [loadingUserNotes, setLoadingUserNotes] = useState(false)
    const [noteSearch, setNoteSearch] = useState('')
    const [userSearch, setUserSearch] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [notes, users, articles] = await Promise.all([
                notesService.getNotes(),
                userService.getAllUsers(),
                contentService.getAllArticlesAdmin(),
            ])
            setAllNotes(notes)
            setAllUsers(users)
            setAllArticles(articles)
        } finally {
            setLoading(false)
        }
    }

    const loadUserNotes = async (userId: number) => {
        setLoadingUserNotes(true)
        try {
            const notes = await notesService.getNotesByUser(userId)
            setUserNotes(notes)
        } finally {
            setLoadingUserNotes(false)
        }
    }

    // Makale ID -> Başlık haritası oluştur
    const articleMap = useMemo(() => {
        const map = new Map<number, string>()
        allArticles.forEach(a => {
            map.set(a.articleId, a.title)
        })
        return map
    }, [allArticles])

    // Kullanıcıları not sayısı ile birleştir ve filtrele
    const usersWithNoteCount = useMemo(() => {
        const userNoteMap = new Map<number, number>()

        allNotes.forEach((note) => {
            const count = userNoteMap.get(note.userId) || 0
            userNoteMap.set(note.userId, count + 1)
        })

        const users = allUsers
            .map((user) => ({
                ...user,
                noteCount: userNoteMap.get(user.userId) || 0,
            } as UserWithNoteCount))
            .sort((a, b) => b.noteCount - a.noteCount)

        // Arama filtresi uygula
        const searchLower = userSearch.toLowerCase().trim()
        if (!searchLower) return users

        return users.filter((u) =>
            u.userName.toLowerCase().includes(searchLower) ||
            (u.email && u.email.toLowerCase().includes(searchLower))
        )
    }, [allUsers, allNotes, userSearch])

    const selectedUser = useMemo(() => {
        return allUsers.find((u) => u.userId === selectedUserId)
    }, [allUsers, selectedUserId])

    // Notları seri/bölüm bazında grupla ve filtrele
    const groupedNotes = useMemo(() => {
        const groups: NoteGroup[] = userNotes.map((note) => {
            let episodeTitle = note.episodeTitle || 'Bilinmeyen'

            if (note.articleId) {
                // Makale ise başlığı articleMap'ten al
                const articleTitle = articleMap.get(note.articleId)
                if (articleTitle) {
                    episodeTitle = articleTitle
                } else {
                    episodeTitle = 'Makale'
                }
            }

            return {
                seriesTitle: note.seriesTitle || (note.articleId ? 'Makale ' : 'Genel'),
                episodeTitle: episodeTitle,
                episodeId: note.episodeId,
                note,
            }
        })

        // Arama filtresi uygula
        const searchLower = noteSearch.toLowerCase().trim()
        const filteredGroups = searchLower
            ? groups.filter((g) =>
                g.seriesTitle.toLowerCase().includes(searchLower) ||
                g.episodeTitle.toLowerCase().includes(searchLower) ||
                (g.note.title && g.note.title.toLowerCase().includes(searchLower))
            )
            : groups

        // Tarihe göre sırala (En yeni en üstte)
        return filteredGroups.sort((a, b) => {
            return new Date(b.note.createdAt).getTime() - new Date(a.note.createdAt).getTime()
        })
    }, [userNotes, noteSearch, articleMap])

    const handleUserClick = async (userId: number) => {
        setSelectedUserId(userId)
        await loadUserNotes(userId)
    }

    const handleBackToList = () => {
        setSelectedUserId(null)
        setUserNotes([])
        setNoteSearch('')
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <>
            <PageTitle subName={t('pages.notes')} title={t('notes.userNotes')} />
            <Card>
                <CardHeader>
                    <div className="d-flex align-items-center justify-content-between">
                        <CardTitle as={'h5'}>
                            {selectedUser ? (
                                <>
                                    <Button
                                        variant="link"
                                        className="p-0 me-2"
                                        onClick={handleBackToList}
                                    >
                                        <Icon icon="mingcute:arrow-left-line" style={{ fontSize: '1.2rem' }} />
                                    </Button>
                                    {selectedUser.userName} - {t('notes.title')}
                                </>
                            ) : (
                                t('notes.userNotes')
                            )}
                        </CardTitle>
                        {selectedUser && (
                            <Badge bg="info" style={{ fontSize: '0.9rem' }}>
                                {userNotes.length} {t('notes.title')}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardBody>
                    {!selectedUserId ? (
                        <>
                            <div className="position-relative mb-4">
                                <div
                                    className="d-flex align-items-center bg-light rounded-3 border"
                                    style={{
                                        padding: '0.75rem 1rem',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Icon
                                        icon="mingcute:search-line"
                                        className="text-muted me-3"
                                        style={{ fontSize: '1.25rem' }}
                                    />
                                    <Form.Control
                                        type="text"
                                        placeholder={t('common.search') + '...'}
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="border-0 bg-transparent p-0"
                                        style={{
                                            fontSize: '1rem',
                                            boxShadow: 'none'
                                        }}
                                    />
                                    {userSearch && (
                                        <Button
                                            variant="link"
                                            className="p-0 text-muted"
                                            onClick={() => setUserSearch('')}
                                            style={{ fontSize: '1.1rem' }}
                                        >
                                            <Icon icon="mingcute:close-circle-fill" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <DataTable
                                isLoading={loading}
                                data={usersWithNoteCount}
                                rowKey={(r) => (r as UserWithNoteCount).userId}
                                hideSearch
                                columns={[
                                    {
                                        key: 'userName',
                                        header: t('access.seriesAccess.user'),
                                        render: (r) => {
                                            const u = r as UserWithNoteCount
                                            return (
                                                <div className="d-flex align-items-center gap-2">
                                                    <div
                                                        className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                        style={{ width: '36px', height: '36px' }}
                                                    >
                                                        <Icon icon="mingcute:user-line" style={{ fontSize: '1.1rem' }} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{u.userName}</div>
                                                        {u.email && <div className="text-muted small">{u.email}</div>}
                                                    </div>
                                                </div>
                                            )
                                        },
                                    },
                                    {
                                        key: 'noteCount',
                                        header: t('notes.noteCount'),
                                        width: '150px',
                                        sortable: true,
                                        render: (r) => {
                                            const u = r as UserWithNoteCount
                                            return (
                                                <Badge
                                                    bg={u.noteCount > 0 ? 'info' : 'secondary'}
                                                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                                                >
                                                    <Icon icon="mingcute:edit-line" className="me-1" />
                                                    {u.noteCount}
                                                </Badge>
                                            )
                                        },
                                    },
                                    {
                                        key: 'actions',
                                        header: t('common.actions'),
                                        width: '180px',
                                        render: (r) => {
                                            const u = r as UserWithNoteCount
                                            return (
                                                <Button
                                                    variant={u.noteCount > 0 ? 'primary' : 'outline-secondary'}
                                                    size="sm"
                                                    onClick={() => handleUserClick(u.userId)}
                                                    disabled={u.noteCount === 0}
                                                >
                                                    <Icon icon="mingcute:eye-line" className="me-1" />
                                                    {u.noteCount > 0 ? t('notes.viewNotes') : t('notes.noNotes')}
                                                </Button>
                                            )
                                        },
                                    },
                                ]}
                            />
                        </>
                    ) : (
                        <>
                            {loadingUserNotes ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">{t('common.loading')}</span>
                                    </div>
                                </div>
                            ) : userNotes.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <Icon icon="mingcute:file-line" style={{ fontSize: '3rem' }} />
                                    <p className="mt-3">{t('notes.noNotes')}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="position-relative mb-4">
                                        <div
                                            className="d-flex align-items-center bg-light rounded-3 border"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Icon
                                                icon="mingcute:search-line"
                                                className="text-muted me-3"
                                                style={{ fontSize: '1.25rem' }}
                                            />
                                            <Form.Control
                                                type="text"
                                                placeholder={t('common.search') + '...'}
                                                value={noteSearch}
                                                onChange={(e) => setNoteSearch(e.target.value)}
                                                className="border-0 bg-transparent p-0"
                                                style={{
                                                    fontSize: '1rem',
                                                    boxShadow: 'none'
                                                }}
                                            />
                                            {noteSearch && (
                                                <Button
                                                    variant="link"
                                                    className="p-0 text-muted"
                                                    onClick={() => setNoteSearch('')}
                                                    style={{ fontSize: '1.1rem' }}
                                                >
                                                    <Icon icon="mingcute:close-circle-fill" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {groupedNotes.length === 0 && noteSearch ? (
                                        <div className="text-center py-5 text-muted">
                                            <Icon icon="mingcute:search-line" style={{ fontSize: '3rem' }} />
                                            <p className="mt-3">{t('common.noResults')}</p>
                                        </div>
                                    ) : (
                                        <Accordion defaultActiveKey="0">
                                            {groupedNotes.map((group, index) => (
                                                <Accordion.Item eventKey={String(index)} key={group.note.noteId}>
                                                    <Accordion.Header>
                                                        <div className="d-flex align-items-center gap-2 w-100">
                                                            <Icon
                                                                icon={group.note.episodeId ? 'mingcute:headphone-line' : 'mingcute:document-line'}
                                                                style={{ fontSize: '1.2rem' }}
                                                            />
                                                            <div className="flex-grow-1">
                                                                <span className="fw-semibold">{group.seriesTitle}</span>
                                                                <span className="text-muted mx-2">/</span>
                                                                <span>{group.episodeTitle}</span>
                                                            </div>
                                                            {group.note.title && (
                                                                <Badge bg="light" text="dark" className="me-2">
                                                                    {group.note.title}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        <div className="p-2">
                                                            <div
                                                                className="bg-light rounded p-3 mb-3"
                                                                style={{ whiteSpace: 'pre-wrap' }}
                                                            >
                                                                {group.note.noteText}
                                                            </div>
                                                            <div className="d-flex justify-content-between text-muted small">
                                                                <span>
                                                                    <Icon icon="mingcute:time-line" className="me-1" />
                                                                    {t('common.date')}: {formatDate(group.note.createdAt)}
                                                                </span>
                                                                {group.note.updatedAt !== group.note.createdAt && (
                                                                    <span>
                                                                        <Icon icon="mingcute:refresh-line" className="me-1" />
                                                                        {t('users.updatedAt')}: {formatDate(group.note.updatedAt)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>
        </>
    )
}

export default AdminNotesPage

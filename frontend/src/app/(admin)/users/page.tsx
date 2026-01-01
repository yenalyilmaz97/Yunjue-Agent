import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { userService } from '@/services'
import type { User } from '@/types/keci'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Modal, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import DataTable from '@/components/table/DataTable'
import PasswordFormInput from '@/components/from/PasswordFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/i18n/context'

const page = () => {
  const { t } = useI18n()
  const [items, setItems] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [resetUser, setResetUser] = useState<User | null>(null)
  const resetSchema = yup.object({
    newPassword: yup.string().min(6, t('users.passwordMin')).required(t('users.enterNewPasswordRequired')),
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], t('users.passwordMatch'))
      .required(t('users.confirmNewPasswordRequired')),
  })
  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    reset: resetResetForm,
    formState: { isSubmitting: isResetSubmitting },
  } = useForm<{ newPassword: string; confirmNewPassword: string }>({
    resolver: yupResolver(resetSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  })
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await userService.getAllUsers()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDelete = async (userId: number) => {
    if (!confirm(t('users.deleteConfirm'))) return
    await userService.deleteUser(userId)
    setItems((prev) => prev.filter((u) => u.userId !== userId))
  }

  const openResetModal = (user: User) => {
    setResetUser(user)
    resetResetForm({ newPassword: '', confirmNewPassword: '' })
  }
  const closeResetModal = () => setResetUser(null)

  const submitReset = handleResetSubmit(async (data) => {
    if (!resetUser) return
    await userService.changePassword({ userId: resetUser.userId, newPassword: data.newPassword })
    closeResetModal()
  })

  // edit handled by navigating to create page in edit mode

  return (
    <>
      <PageTitle subName={t('pages.users')} title={t('users.allUsers')} />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">{t('users.list')}</CardTitle>
          <input
            className="form-control form-control-sm ms-auto"
            placeholder={t('users.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          <Button size="sm" variant="primary" onClick={() => navigate('/admin/users/create')}>
            <IconifyIcon icon="mdi:plus" className="me-1" /> {t('users.addNew')}
          </Button>
        </CardHeader>
        <CardBody>
          <DataTable<User>
            isLoading={loading}
            data={items}
            rowKey={(r) => r.userId}
            hideSearch
            searchQuery={search}
            searchKeys={['userId', 'userName', 'email', 'firstName', 'lastName', 'city', 'phone', 'roleName']}
            columns={[
              { key: 'userId', header: t('common.id') || 'ID', width: '80px', sortable: true },
              { key: 'userName', header: t('users.userName'), sortable: true },
              { key: 'email', header: t('users.email'), sortable: true },
              {
                key: 'actions',
                header: t('common.actions'),
                width: '120px',
                render: (r) => {
                  const u = r as User
                  return (
                    <Button variant="outline-primary" size="sm" onClick={() => navigate(`/admin/users/${u.userId}`)}>
                      <IconifyIcon icon="mdi:eye" className="me-1" /> {t('users.detail')}
                    </Button>
                  )
                },
              },
            ]}
            accordion
            renderAccordionContent={(u) => (
              <Row className="g-3 align-items-center">
                <Col md={8}>
                  <div className="d-flex flex-wrap gap-3 small">
                    <div><strong>{t('users.firstName')}:</strong> {u.firstName || '-'}</div>
                    <div><strong>{t('users.lastName')}:</strong> {u.lastName || '-'}</div>
                    <div><strong>{t('users.role')}:</strong> {u.roleName || '-'}</div>
                    <div><strong>{t('users.city')}:</strong> {u.city || '-'}</div>
                    <div><strong>{t('users.phone')}:</strong> {u.phone || '-'}</div>
                    <div><strong>{t('users.subscriptionEnd')}:</strong> {new Date(u.subscriptionEnd).toLocaleDateString()}</div>
                    <div><strong>{t('users.dateOfBirth')}:</strong> {new Date(u.dateOfBirth).toLocaleDateString()}</div>
                    <div><strong>{t('users.gender')}:</strong> {u.gender ? t('users.male') : t('users.female')}</div>
                    {u.description && <div><strong>{t('users.description')}:</strong> {u.description}</div>}
                  </div>
                </Col>
                <Col md={4} className="d-flex justify-content-end gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => navigate('/admin/users/create', { state: { mode: 'edit', item: u } })}>
                    <IconifyIcon icon="mdi:pencil" className="me-1" /> {t('common.edit')}
                  </Button>
                  <Button variant="outline-warning" size="sm" onClick={() => openResetModal(u)}>
                    <IconifyIcon icon="mdi:key-reset" className="me-1" /> {t('users.resetPassword')}
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(u.userId)}>
                    <IconifyIcon icon="mdi:delete" className="me-1" /> {t('common.delete')}
                  </Button>
                </Col>
              </Row>
            )}
          />
        </CardBody>
      </Card>

      <Modal show={!!resetUser} onHide={closeResetModal} centered>
        <Form onSubmit={submitReset}>
          <Modal.Header closeButton>
            <Modal.Title>{t('users.resetPasswordTitle')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">{t('users.user')}: <strong>{resetUser?.firstName} {resetUser?.lastName}</strong></p>
            <PasswordFormInput control={resetControl} name="newPassword" label={t('users.newPassword')} placeholder={t('users.newPasswordPlaceholder')} />
            <PasswordFormInput control={resetControl} name="confirmNewPassword" label={t('users.newPasswordRepeat')} placeholder={t('users.newPasswordRepeatPlaceholder')} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={closeResetModal}>{t('users.cancel')}</Button>
            <Button type="submit" variant="primary" disabled={isResetSubmitting}>{isResetSubmitting ? t('users.submitting') : t('users.reset')}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* edit handled via navigation */}
    </>
  )
}

export default page



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

const page = () => {
  const [items, setItems] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [resetUser, setResetUser] = useState<User | null>(null)
  const resetSchema = yup.object({
    newPassword: yup.string().min(6, 'Password should be at least 6 characters').required('Please enter new password'),
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm new password'),
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
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return
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
      <PageTitle subName="Users" title="All Users" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <CardTitle as={'h5'} className="mb-0">Users</CardTitle>
          <input
            className="form-control form-control-sm ms-auto"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          <Button size="sm" variant="primary" onClick={() => navigate('/admin/users/create')}>
            <IconifyIcon icon="mdi:plus" className="me-1" /> Add New
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
              { key: 'userId', header: 'ID', width: '80px', sortable: true },
              { key: 'userName', header: 'Username', sortable: true },
              { key: 'email', header: 'Email', sortable: true },
              { key: 'firstName', header: 'First Name', sortable: true },
              { key: 'lastName', header: 'Last Name', sortable: true },
              { key: 'roleName', header: 'Role', sortable: true },
              { key: 'city', header: 'City' },
              { key: 'phone', header: 'Phone' },
            ]}
            accordion
            renderAccordionContent={(u) => (
              <Row className="g-3 align-items-center">
                <Col md={8}>
                  <div className="d-flex flex-wrap gap-3 small text-muted">
                    <span><IconifyIcon icon="mdi:city" className="me-1" />{u.city || '-'}</span>
                    <span><IconifyIcon icon="mdi:phone" className="me-1" />{u.phone || '-'}</span>
                    <span><IconifyIcon icon="mdi:calendar" className="me-1" />Sub ends: {new Date(u.subscriptionEnd).toLocaleDateString()}</span>
                  </div>
                </Col>
                <Col md={4} className="d-flex justify-content-end gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => navigate('/admin/users/create', { state: { mode: 'edit', item: u } })}>
                    <IconifyIcon icon="mdi:pencil" className="me-1" /> Edit
                  </Button>
                  <Button variant="outline-warning" size="sm" onClick={() => openResetModal(u)}>
                    <IconifyIcon icon="mdi:key-reset" className="me-1" /> Reset Password
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(u.userId)}>
                    <IconifyIcon icon="mdi:delete" className="me-1" /> Delete
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
            <Modal.Title>Şifre Sıfırla</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">Kullanıcı: <strong>{resetUser?.firstName} {resetUser?.lastName}</strong></p>
            <PasswordFormInput control={resetControl} name="newPassword" label="Yeni Şifre" placeholder="Yeni şifre" />
            <PasswordFormInput control={resetControl} name="confirmNewPassword" label="Yeni Şifre (Tekrar)" placeholder="Yeni şifre (tekrar)" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={closeResetModal}>Vazgeç</Button>
            <Button type="submit" variant="primary" disabled={isResetSubmitting}>{isResetSubmitting ? 'Gönderiliyor...' : 'Sıfırla'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* edit handled via navigation */}
    </>
  )
}

export default page



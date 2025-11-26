import PageTitle from '@/components/PageTitle'
import { useEffect, useState, useRef } from 'react'
import { useAuthContext } from '@/context/useAuthContext'
import { userService } from '@/services'
import type { User } from '@/types/keci'
import { Card, CardBody, Row, Col, Spinner, Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { api, API_CONFIG } from '@/lib/axios'

const ProfilePage = () => {
  const { user: authUser } = useAuthContext()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authUser?.id) {
        setLoading(false)
        return
      }

      try {
        const userId = parseInt(authUser.id)
        const userData = await userService.getUserById(userId)
        setUser(userData)
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [authUser])

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const isSubscriptionActive = (subscriptionEnd: string): boolean => {
    return new Date(subscriptionEnd) > new Date()
  }

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF, WEBP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<User>(
        `${API_CONFIG.ENDPOINTS.USERS}/${user.userId}/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      setUser(response)
      alert('Profil resmi başarıyla güncellendi')
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      alert('Profil resmi yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return (
      <>
        <PageTitle subName="KeciApp" title="Profilim" />
        <Card>
          <CardBody>
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="text-primary" />
              <p className="text-muted mt-2 mb-0">Yükleniyor...</p>
            </div>
          </CardBody>
        </Card>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <PageTitle subName="KeciApp" title="Profilim" />
        <Card>
          <CardBody>
            <div className="text-center py-5">
              <Icon icon="mingcute:user-line" style={{ fontSize: '4rem', opacity: 0.3 }} className="text-muted mb-3" />
              <h6 className="text-muted mb-2">Profil bilgisi yüklenemedi</h6>
            </div>
          </CardBody>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageTitle subName="KeciApp" title="Profilim" />

      <Row className="g-3 g-md-4">
        {/* Kişisel Bilgiler */}
        <Col xs={12} lg={6}>
          <Card className="h-100 shadow-sm">
            <CardBody className="p-3 p-md-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="position-relative" style={{ flexShrink: 0 }}>
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="rounded-circle"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <Icon icon="mingcute:user-line" style={{ fontSize: '2.5rem' }} />
                    </div>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    className="position-absolute bottom-0 end-0 rounded-circle p-1"
                    style={{ width: '28px', height: '28px', padding: '0' }}
                    onClick={handleProfilePictureClick}
                    disabled={uploading}
                    title="Profil resmini değiştir"
                  >
                    <Icon icon="mingcute:camera-line" style={{ fontSize: '1rem' }} />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleProfilePictureChange}
                    style={{ display: 'none' }}
                  />
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-1 fw-semibold">
                    {user.firstName} {user.lastName}
                  </h5>
                  <p className="text-muted small mb-0">@{user.userName}</p>
                </div>
              </div>

              <div className="list-group list-group-flush">
                <div className="list-group-item border-0 px-0 py-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Icon icon="mingcute:mail-line" className="text-primary" style={{ fontSize: '1.1rem' }} />
                    <span className="fw-semibold small">E-posta</span>
                  </div>
                  <p className="text-muted small mb-0 ms-4">{user.email}</p>
                </div>

                <div className="list-group-item border-0 px-0 py-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Icon icon="mingcute:phone-line" className="text-primary" style={{ fontSize: '1.1rem' }} />
                    <span className="fw-semibold small">Telefon</span>
                  </div>
                  <p className="text-muted small mb-0 ms-4">{user.phone}</p>
                </div>

                <div className="list-group-item border-0 px-0 py-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Icon icon="mingcute:calendar-line" className="text-primary" style={{ fontSize: '1.1rem' }} />
                    <span className="fw-semibold small">Doğum Tarihi</span>
                  </div>
                  <p className="text-muted small mb-0 ms-4">
                    {formatDate(user.dateOfBirth)} ({calculateAge(user.dateOfBirth)} yaşında)
                  </p>
                </div>

                <div className="list-group-item border-0 px-0 py-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Icon icon="mingcute:user-2-line" className="text-primary" style={{ fontSize: '1.1rem' }} />
                    <span className="fw-semibold small">Cinsiyet</span>
                  </div>
                  <p className="text-muted small mb-0 ms-4">{user.gender ? 'Erkek' : 'Kadın'}</p>
                </div>

                <div className="list-group-item border-0 px-0 py-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Icon icon="mingcute:map-pin-line" className="text-primary" style={{ fontSize: '1.1rem' }} />
                    <span className="fw-semibold small">Şehir</span>
                  </div>
                  <p className="text-muted small mb-0 ms-4">{user.city}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Abonelik ve Diğer Bilgiler */}
        <Col xs={12} lg={6}>
          <Card className="h-100 shadow-sm">
            <CardBody className="p-3 p-md-4">
              <h6 className="mb-3 fw-semibold d-flex align-items-center gap-2">
                <Icon icon="mingcute:vip-line" className="text-warning" style={{ fontSize: '1.25rem' }} />
                Abonelik Bilgileri
              </h6>

              <div className="list-group list-group-flush">
                <div className="list-group-item border-0 px-0 py-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Icon icon="mingcute:time-line" className="text-warning" style={{ fontSize: '1.1rem' }} />
                    <span className="fw-semibold small">Abonelik Bitiş Tarihi</span>
                  </div>
                  <p className="text-muted small mb-0 ms-4">
                    {formatDate(user.subscriptionEnd)}
                    {isSubscriptionActive(user.subscriptionEnd) ? (
                      <span className="badge bg-success ms-2" style={{ fontSize: '0.65rem' }}>
                        Aktif
                      </span>
                    ) : (
                      <span className="badge bg-danger ms-2" style={{ fontSize: '0.65rem' }}>
                        Süresi Dolmuş
                      </span>
                    )}
                  </p>
                </div>

                {(user as any).keciTimeEnd && (
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Icon icon="mingcute:clock-line" className="text-info" style={{ fontSize: '1.1rem' }} />
                      <span className="fw-semibold small">Keci Time Bitiş Tarihi</span>
                    </div>
                    <p className="text-muted small mb-0 ms-4">{formatDate((user as any).keciTimeEnd)}</p>
                  </div>
                )}

                <div className="list-group-item border-0 px-0 py-2">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Icon icon="mingcute:calendar-check-line" className="text-info" style={{ fontSize: '1.1rem' }} />
                    <span className="fw-semibold small">İçerik Tercihi</span>
                  </div>
                  <p className="text-muted small mb-0 ms-4">
                    {(user as any).dailyOrWeekly ? 'Günlük' : 'Haftalık'}
                  </p>
                </div>
              </div>

              <hr className="my-3" />

              <div>
                <h6 className="mb-2 fw-semibold d-flex align-items-center gap-2">
                  <Icon icon="mingcute:information-line" className="text-secondary" style={{ fontSize: '1.25rem' }} />
                  Hesap Bilgileri
                </h6>
                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Icon icon="mingcute:calendar-add-line" className="text-secondary" style={{ fontSize: '1rem' }} />
                      <span className="fw-semibold small">Kayıt Tarihi</span>
                    </div>
                    <p className="text-muted small mb-0 ms-4">
                      {user.createdAt ? formatDateTime(user.createdAt) : '-'}
                    </p>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Icon icon="mingcute:refresh-line" className="text-secondary" style={{ fontSize: '1rem' }} />
                      <span className="fw-semibold small">Son Güncelleme</span>
                    </div>
                    <p className="text-muted small mb-0 ms-4">
                      {user.updatedAt ? formatDateTime(user.updatedAt) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ProfilePage

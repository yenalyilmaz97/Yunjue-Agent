import { Button, Container } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { useAuthContext } from '@/context/useAuthContext'

const InactiveAccount = () => {
    const { removeSession } = useAuthContext()

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <Container className="d-flex flex-column align-items-center text-center p-4">
                <div
                    className="mb-4 d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm"
                    style={{ width: '120px', height: '120px' }}
                >
                    <Icon icon="mingcute:lock-line" className="text-danger" style={{ fontSize: '64px' }} />
                </div>

                <h2 className="fw-bold mb-3 text-dark">Hesabınız Aktif Değil</h2>

                <p className="text-muted mb-4" style={{ maxWidth: '500px' }}>
                    Hesabınız dondurulmuş veya henüz aktif edilmemiş olabilir.
                    Lütfen yönetici ile iletişime geçin veya üyeliğinizin durumunu kontrol edin.
                </p>

                <div className="d-flex gap-3">
                    {/* <Button
                        variant="primary"
                        size="lg"
                        onClick={() => window.location.href = 'mailto:destek@kecisozluk.com'}
                        className="d-flex align-items-center gap-2 px-4"
                    >
                        <Icon icon="mingcute:mail-send-line" />
                        İletişime Geç
                    </Button> */}

                    <Button
                        variant="danger"
                        onClick={removeSession}
                        className="d-flex align-items-center gap-2"
                    >
                        <Icon icon="mingcute:exit-line" />
                        Çıkış Yap
                    </Button>
                </div>
            </Container>
        </div>
    )
}

export default InactiveAccount

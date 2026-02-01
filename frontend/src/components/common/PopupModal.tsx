import { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { popupService } from '@/services'
import type { PopupResponse } from '@/types/keci/popup'
import { useAuthContext } from '@/context/useAuthContext'

const PopupModal = () => {
    const { isAuthenticated } = useAuthContext()
    const [show, setShow] = useState(false)
    const [popup, setPopup] = useState<PopupResponse | null>(null)

    useEffect(() => {
        if (!isAuthenticated) return

        const checkPopup = async () => {
            try {
                const data = await popupService.getActivePopup()
                if (data) {
                    setPopup(data)
                    setShow(true)
                }
            } catch (error) {
                console.error("Failed to fetch popup", error)
            }
        }

        checkPopup()
    }, [isAuthenticated]) // Check when auth status changes/logs in

    const handleClose = async () => {
        setShow(false)
        if (popup && !popup.repeatable) {
            try {
                await popupService.markAsSeen()
            } catch (error) {
                console.error("Failed to mark popup as seen", error)
            }
        }
    }

    if (!popup) return null

    return (
        <Modal show={show} onHide={handleClose} centered size="lg" className="popup-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                {/* Optional: Add Title if needed, or keep it clean just image */}
                <Modal.Title className="w-100 text-center">{popup.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 text-center">
                <div className="p-3">
                    <img
                        src={popup.imageUrl}
                        alt={popup.title}
                        className="img-fluid rounded"
                        style={{ maxHeight: '70vh', width: 'auto', objectFit: 'contain' }}
                    />
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default PopupModal

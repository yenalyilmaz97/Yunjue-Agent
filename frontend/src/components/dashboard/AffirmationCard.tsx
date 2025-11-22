import { Card, CardBody } from 'react-bootstrap'

interface AffirmationCardProps {
  affirmation?: {
    affirmationId: number
    affirmationText: string | null
    order: number
  }
  isInSlider?: boolean
}

const AffirmationCard = ({ affirmation, isInSlider = false }: AffirmationCardProps) => {
  if (!affirmation?.affirmationText) {
    return null
  }

  if (isInSlider) {
    return (
      <div className="d-flex flex-column justify-content-center h-100 text-center text-white">
        <div className="mb-2">
          <i className="bx bxs-heart" style={{ fontSize: '2rem', opacity: 0.7 }}></i>
        </div>
        <h3 className="mb-3 fw-bold" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
          {affirmation.affirmationText}
        </h3>
        <div className="mt-2">
          <i className="bx bxs-heart" style={{ fontSize: '2rem', opacity: 0.7 }}></i>
        </div>
        <p className="mt-3 mb-0 small opacity-75">Günlük Olumlama</p>
      </div>
    )
  }

  return (
    <Card className="mb-3 mb-md-0 h-100">
      <CardBody className="p-3 p-md-4">
        <div className="d-flex align-items-start mb-3">
          <i className="bx bxs-heart text-danger" style={{ fontSize: '1.5rem' }}></i>
        </div>
        <h5 className="mb-3 fw-bold">{affirmation.affirmationText}</h5>
        <div className="d-flex justify-content-end">
          <i className="bx bxs-heart text-danger" style={{ fontSize: '1.5rem' }}></i>
        </div>
        <p className="text-muted small mb-0 mt-3">Günlük Olumlama</p>
      </CardBody>
    </Card>
  )
}

export default AffirmationCard


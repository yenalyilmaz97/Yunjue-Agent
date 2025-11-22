import { Card, CardBody } from 'react-bootstrap'

interface AphorismCardProps {
  aphorism?: {
    aphorismId: number
    aphorismText: string | null
    order: number
  }
  isInSlider?: boolean
}

const AphorismCard = ({ aphorism, isInSlider = false }: AphorismCardProps) => {
  if (!aphorism?.aphorismText) {
    return null
  }

  if (isInSlider) {
    return (
      <div className="d-flex flex-column justify-content-center h-100 text-center text-white">
        <div className="mb-2">
          <i className="bx bx-quote-left" style={{ fontSize: '2rem', opacity: 0.7 }}></i>
        </div>
        <h3 className="mb-3 fw-bold" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
          {aphorism.aphorismText}
        </h3>
        <div className="mt-2">
          <i className="bx bx-quote-right" style={{ fontSize: '2rem', opacity: 0.7 }}></i>
        </div>
        <p className="mt-3 mb-0 small opacity-75">Günlük Aforizma</p>
      </div>
    )
  }

  return (
    <Card className="mb-3 mb-md-0 h-100">
      <CardBody className="p-3 p-md-4">
        <div className="d-flex align-items-start mb-3">
          <i className="bx bx-quote-left text-primary" style={{ fontSize: '1.5rem' }}></i>
        </div>
        <h5 className="mb-3 fw-bold">{aphorism.aphorismText}</h5>
        <div className="d-flex justify-content-end">
          <i className="bx bx-quote-right text-primary" style={{ fontSize: '1.5rem' }}></i>
        </div>
        <p className="text-muted small mb-0 mt-3">Günlük Aforizma</p>
      </CardBody>
    </Card>
  )
}

export default AphorismCard


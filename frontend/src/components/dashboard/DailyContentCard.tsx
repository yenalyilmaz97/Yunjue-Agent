import { Col, Row } from 'react-bootstrap'
import AphorismCard from './AphorismCard'
import AffirmationCard from './AffirmationCard'
import type { DailyContentResponseDTO } from '@/services/dailyContent'

interface DailyContentCardProps {
  dailyContent: DailyContentResponseDTO
}

const DailyContentCard = ({ dailyContent }: DailyContentCardProps) => {
  const hasAphorism = dailyContent.aphorism?.aphorismText
  const hasAffirmation = dailyContent.affirmation?.affirmationText

  if (!hasAphorism && !hasAffirmation) {
    return null
  }

  return (
    <Row className="g-3">
      {hasAphorism && (
        <Col xs={12} lg={hasAffirmation ? 6 : 12}>
          <AphorismCard aphorism={dailyContent.aphorism} />
        </Col>
      )}
      {hasAffirmation && (
        <Col xs={12} lg={hasAphorism ? 6 : 12}>
          <AffirmationCard affirmation={dailyContent.affirmation} />
        </Col>
      )}
    </Row>
  )
}

export default DailyContentCard


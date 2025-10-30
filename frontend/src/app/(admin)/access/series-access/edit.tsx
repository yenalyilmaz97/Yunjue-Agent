import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { userSeriesAccessService } from '@/services'

type FormFields = {
  currentAccessibleSequence: number
  nextUnlockDate: string
  currentPositionInSeconds: number
}

const EditSeriesAccessPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as any) || {}
  const access = state.item as {
    userSeriesAccessId: number
    userId: number
    seriesId: number
    currentAccessibleSequence: number
    nextUnlockDate: string
    currentPositionInSeconds: number
    podcastSeries?: { title?: string }
    user?: { firstName?: string; lastName?: string; userName?: string }
  }

  const schema: yup.ObjectSchema<FormFields> = yup.object({
    currentAccessibleSequence: yup.number().min(1).required('Required'),
    nextUnlockDate: yup.string().required('Required'),
    currentPositionInSeconds: yup.number().min(0).required('Required'),
  })

  const { control, handleSubmit, reset, formState } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      currentAccessibleSequence: 1,
      nextUnlockDate: '',
      currentPositionInSeconds: 0,
    },
  })
  const { isSubmitting } = formState

  useEffect(() => {
    if (access) {
      reset({
        currentAccessibleSequence: access.currentAccessibleSequence ?? 1,
        nextUnlockDate: access.nextUnlockDate ? new Date(access.nextUnlockDate).toISOString().split('T')[0] : '',
        currentPositionInSeconds: access.currentPositionInSeconds ?? 0,
      })
    }
  }, [])

  const onSubmit = handleSubmit(async (data) => {
    await userSeriesAccessService.updateUserSeriesAccess(access.userSeriesAccessId, {
      currentAccessibleSequence: data.currentAccessibleSequence,
      nextUnlockDate: new Date(data.nextUnlockDate).toISOString(),
      currentPositionInSeconds: data.currentPositionInSeconds,
    })
    navigate('/admin/access/series')
  })

  return (
    <>
      <PageTitle subName="Access" title="Edit Series Access" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>Edit Access - {access?.podcastSeries?.title}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={4}>
                <TextFormInput control={control} name="currentAccessibleSequence" type="number" min={1} label="Allowed Episode #" />
              </Col>
              <Col md={4}>
                <TextFormInput control={control} name="nextUnlockDate" type="date" label="Next Unlock Date" />
              </Col>
              <Col md={4}>
                <TextFormInput control={control} name="currentPositionInSeconds" type="number" min={0} label="Position (sec)" />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/access/series')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default EditSeriesAccessPage



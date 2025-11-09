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
}

const EditSeriesAccessPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as any) || {}
  const access = state.item as {
    userSeriesAccessId: number
    userId: number
    seriesId?: number | null
    articleId?: number | null
    currentAccessibleSequence: number
    podcastSeries?: { title?: string }
    article?: { title?: string }
    user?: { firstName?: string; lastName?: string; userName?: string }
  }

  const schema: yup.ObjectSchema<FormFields> = yup.object({
    currentAccessibleSequence: yup.number().min(1).required('Required'),
  })

  const { control, handleSubmit, reset, formState } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      currentAccessibleSequence: 1,
    },
  })
  const { isSubmitting } = formState

  useEffect(() => {
    if (access) {
      reset({
        currentAccessibleSequence: access.currentAccessibleSequence ?? 1,
      })
    }
  }, [access, reset])

  const onSubmit = handleSubmit(async (data) => {
    await userSeriesAccessService.updateUserSeriesAccess(access.userSeriesAccessId, {
      currentAccessibleSequence: data.currentAccessibleSequence,
    })
    navigate('/admin/access/series')
  })

  return (
    <>
      <PageTitle subName="Access" title="Edit Series Access" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>Edit Access - {access?.podcastSeries?.title || access?.article?.title || 'N/A'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput control={control} name="currentAccessibleSequence" type="number" min={1} label="Current Accessible Sequence" />
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



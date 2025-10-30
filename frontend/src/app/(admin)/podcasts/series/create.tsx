import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { podcastService } from '@/services'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

type FormFields = { title: string; description: string; isVideo: boolean }

const SeriesCreateEditPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const schema: yup.ObjectSchema<FormFields> = yup.object({
    title: yup.string().trim().required('Please enter title'),
    description: yup.string().trim().required('Please enter description'),
    isVideo: yup.boolean().required(),
  })

  const { control, handleSubmit, reset, formState } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: '', isVideo: false },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      reset({ title: editItem.title || '', description: editItem.description || '', isVideo: !!editItem.isVideo })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await podcastService.updateSeries(editItem.seriesId, { title: data.title, description: data.description, isVideo: data.isVideo })
    } else {
      await podcastService.createSeries({ title: data.title, description: data.description, isVideo: data.isVideo })
    }
    navigate('/admin/podcasts/series')
  })

  return (
    <>
      <PageTitle subName="Podcasts" title={isEdit ? 'Edit Series' : 'Create Series'} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? 'Edit Series' : 'New Series'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput control={control} name="title" label="Title" placeholder="Title" />
              </Col>
              <Col md={12}>
                <TextAreaFormInput control={control} name="description" rows={4} label="Description" placeholder="Description" />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="isVideo"
                  render={({ field }) => (
                    <Form.Check
                      type="switch"
                      id="isVideo"
                      label="Video Series"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/podcasts/series')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default SeriesCreateEditPage



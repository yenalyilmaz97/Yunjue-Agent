import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { contentService } from '@/services'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

const CreateAphorismPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const schema = yup.object({
    aphorismText: yup.string().trim().required('Please enter aphorism'),
  })

  const { control, handleSubmit, reset, formState } = useForm<{ aphorismText: string}>({
    resolver: yupResolver(schema),
    defaultValues: { aphorismText: '' },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      reset({ aphorismText: editItem.aphorismText || '' })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await contentService.updateAphorism(editItem.aphorismId, { aphorismId: editItem.aphorismId, aphorismText: data.aphorismText })
    } else {
      await contentService.createAphorism({ aphorismText: data.aphorismText })
    }
    navigate('/admin/content/aphorisms')
  })

  return (
    <>
      <PageTitle subName="Content" title="Create Aphorism" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? 'Edit Aphorism' : 'New Aphorism'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={12}>
                <TextAreaFormInput
                  control={control}
                  name="aphorismText"
                  rows={3}
                  label="Text"
                  placeholder="Enter aphorism"
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/aphorisms')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateAphorismPage



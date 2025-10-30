import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { contentService } from '@/services'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

const CreateAffirmationPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const schema = yup.object({
    affirmationText: yup.string().trim().required('Please enter affirmation'),
  })

  const { control, handleSubmit, reset, formState } = useForm<{ affirmationText: string}>({
    resolver: yupResolver(schema),
    defaultValues: { affirmationText: '' },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      reset({ affirmationText: editItem.affirmationText || '' })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await contentService.updateAffirmation(editItem.affirmationId, { affirmationId: editItem.affirmationId, affirmationText: data.affirmationText })
    } else {
      await contentService.createAffirmation({ affirmationText: data.affirmationText })
    }
    navigate('/admin/content/affirmations')
  })

  return (
    <>
      <PageTitle subName="Content" title="Create Affirmation" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? 'Edit Affirmation' : 'New Affirmation'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={12}>
                <TextAreaFormInput
                  control={control}
                  name="affirmationText"
                  rows={3}
                  label="Text"
                  placeholder="Enter affirmation"
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/affirmations')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateAffirmationPage



import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { contentService } from '@/services'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

const CreateWeeklyQuestionPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const schema = yup.object({
    weeklyQuestionText: yup.string().trim().required('Please enter question'),
  })

  const { control, handleSubmit, reset, formState } = useForm<{ weeklyQuestionText: string}>({
    resolver: yupResolver(schema),
    defaultValues: { weeklyQuestionText: '' },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      reset({ weeklyQuestionText: editItem.weeklyQuestionText || '' })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await contentService.updateWeeklyQuestion(editItem.weeklyQuestionId, { weeklyQuestionId: editItem.weeklyQuestionId, weeklyQuestionText: data.weeklyQuestionText })
    } else {
      await contentService.createWeeklyQuestion({ weeklyQuestionText: data.weeklyQuestionText })
    }
    navigate('/admin/content/weekly-questions')
  })

  return (
    <>
      <PageTitle subName="Content" title="Create Weekly Question" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? 'Edit Weekly Question' : 'New Weekly Question'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={12}>
                <TextAreaFormInput
                  control={control}
                  name="weeklyQuestionText"
                  rows={3}
                  label="Question"
                  placeholder="Enter question text"
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/weekly-questions')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateWeeklyQuestionPage



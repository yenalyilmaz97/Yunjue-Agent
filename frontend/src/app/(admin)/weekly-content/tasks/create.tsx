import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { contentService } from '@/services'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useI18n } from '@/i18n/context'

const CreateTaskPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const schema = yup.object({
    taskDescription: yup.string().trim().required(t('weeklyContent.tasks.enterDescriptionRequired')),
  })

  const { control, handleSubmit, reset, formState } = useForm<{ taskDescription: string}>({
    resolver: yupResolver(schema),
    defaultValues: { taskDescription: '' },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      reset({ taskDescription: editItem.taskDescription || '' })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await contentService.updateTask(editItem.taskId, { taskId: editItem.taskId, taskDescription: data.taskDescription })
    } else {
      await contentService.createTask({ taskDescription: data.taskDescription })
    }
    navigate('/admin/content/tasks')
  })

  return (
    <>
      <PageTitle subName={t('pages.content')} title={isEdit ? t('weeklyContent.tasks.edit') : t('weeklyContent.tasks.create')} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? t('weeklyContent.tasks.edit') : t('weeklyContent.tasks.new')}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={12}>
                <TextFormInput
                  control={control}
                  name="taskDescription"
                  label={t('weeklyContent.tasks.description')}
                  placeholder={t('weeklyContent.tasks.enterDescription')}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/tasks')}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : isEdit ? t('common.update') : t('common.create')}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateTaskPage



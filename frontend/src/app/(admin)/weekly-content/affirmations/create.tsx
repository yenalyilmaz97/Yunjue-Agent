import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { contentService } from '@/services'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useI18n } from '@/i18n/context'

const CreateAffirmationPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const schema = yup.object({
    affirmationText: yup.string().trim().required(t('weeklyContent.affirmations.enterTextRequired')),
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
      <PageTitle subName={t('pages.content')} title={isEdit ? t('weeklyContent.affirmations.edit') : t('weeklyContent.affirmations.create')} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? t('weeklyContent.affirmations.edit') : t('weeklyContent.affirmations.new')}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={12}>
                <TextAreaFormInput
                  control={control}
                  name="affirmationText"
                  rows={3}
                  label={t('weeklyContent.affirmations.text')}
                  placeholder={t('weeklyContent.affirmations.enterText')}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/affirmations')}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : isEdit ? t('common.update') : t('common.create')}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateAffirmationPage



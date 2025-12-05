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
import { useI18n } from '@/i18n/context'

type FormFields = { title: string; description: string; isVideo: boolean; isActive?: boolean }

const SeriesCreateEditPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const schema: yup.ObjectSchema<FormFields> = yup.object({
    title: yup.string().trim().required(t('forms.enterTitle')),
    description: yup.string().trim().required(t('forms.enterDescription')),
    isVideo: yup.boolean().required(),
    isActive: yup.boolean().optional(),
  })

  const { control, handleSubmit, reset, formState } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: '', isVideo: false, isActive: true },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      reset({ title: editItem.title || '', description: editItem.description || '', isVideo: !!editItem.isVideo, isActive: !!editItem.isActive })
    }
  }, [isEdit, editItem, reset])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await podcastService.updateSeries(editItem.seriesId, { title: data.title, description: data.description, isVideo: data.isVideo, isActive: data.isActive ?? true })
    } else {
      await podcastService.createSeries({ title: data.title, description: data.description, isVideo: data.isVideo })
    }
    navigate('/admin/podcasts/series')
  })

  return (
    <>
      <PageTitle subName={t('pages.podcasts')} title={isEdit ? t('podcasts.series.edit') : t('podcasts.series.create')} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? t('podcasts.series.edit') : t('podcasts.series.new')}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput control={control} name="title" label={t('podcasts.series.name')} placeholder={t('podcasts.series.name')} />
              </Col>
              <Col md={12}>
                <TextAreaFormInput control={control} name="description" rows={4} label={t('podcasts.series.description')} placeholder={t('podcasts.series.description')} />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="isVideo"
                  render={({ field }) => (
                    <Form.Check
                      type="switch"
                      id="isVideo"
                      label={t('podcasts.series.isVideo')}
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </Col>
              {isEdit && (
                <Col md={6}>
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <Form.Check
                        type="switch"
                        id="isActive"
                        label={t('podcasts.series.isActive')}
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </Col>
              )}
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/podcasts/series')}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : isEdit ? t('common.update') : t('common.create')}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default SeriesCreateEditPage



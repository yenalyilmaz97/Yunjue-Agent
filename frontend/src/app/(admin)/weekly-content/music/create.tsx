import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { contentService } from '@/services'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useI18n } from '@/i18n/context'

const CreateMusicPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const schema = yup.object({
    musicTitle: yup.string().trim().required(t('weeklyContent.music.enterTitleRequired')),
    musicURL: yup.string().trim().url(t('weeklyContent.music.enterUrlInvalid')).required(t('weeklyContent.music.enterUrlRequired')),
    musicDescription: yup.string().trim().optional(),
  })

  const { control, handleSubmit, reset, formState } = useForm<{ musicTitle: string; musicURL: string; musicDescription?: string}>({
    resolver: yupResolver(schema),
    defaultValues: { musicTitle: '', musicURL: '', musicDescription: '' },
  })
  const { isSubmitting } = formState
  const isEdit = history.state && (history.state as any).usr && (history.state as any).usr.mode === 'edit'
  const editItem = (history.state && (history.state as any).usr && (history.state as any).usr.item) || undefined

  useEffect(() => {
    if (isEdit && editItem) {
      reset({ musicTitle: editItem.musicTitle || '', musicURL: editItem.musicURL || '', musicDescription: editItem.musicDescription || '' })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await contentService.updateMusic(editItem.musicId, { musicId: editItem.musicId, musicTitle: data.musicTitle, musicURL: data.musicURL, musicDescription: data.musicDescription || '' })
    } else {
      await contentService.createMusic({ musicTitle: data.musicTitle, musicURL: data.musicURL, musicDescription: data.musicDescription || undefined })
    }
    navigate('/admin/content/music')
  })

  return (
    <>
      <PageTitle subName={t('pages.content')} title={isEdit ? t('weeklyContent.music.edit') : t('weeklyContent.music.create')} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? t('weeklyContent.music.edit') : t('weeklyContent.music.new')}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput control={control} name="musicTitle" label={t('weeklyContent.music.titleLabel')} placeholder={t('weeklyContent.music.enterTitle')} />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="musicURL" type="url" label={t('weeklyContent.music.url')} placeholder={t('weeklyContent.music.enterUrl')} />
              </Col>
              <Col md={12}>
                <TextAreaFormInput control={control} name="musicDescription" rows={3} label={t('weeklyContent.music.description')} placeholder={t('weeklyContent.music.enterDescription')} />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/music')}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : isEdit ? t('common.update') : t('common.create')}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateMusicPage



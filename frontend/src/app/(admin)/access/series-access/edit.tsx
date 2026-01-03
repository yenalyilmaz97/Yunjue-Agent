import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { userSeriesAccessService } from '@/services'
import { useI18n } from '@/i18n/context'

type FormFields = {
  currentAccessibleSequence: number
}

const EditSeriesAccessPage = () => {
  const { t } = useI18n()
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
    articleOrder?: number | null
  }

  const isArticle = !!access.articleId

  const schema: yup.ObjectSchema<FormFields> = yup.object({
    currentAccessibleSequence: yup.number().min(1).required(t('access.seriesAccess.required')),
  })

  // Determine initial value: For articles use articleOrder (or current seq), for series use current seq
  // Actually, for Article Access rows, currentAccessibleSequence IS the article order.
  // But purely for display title, we rely on access.article.title

  const { control, handleSubmit, reset, formState } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      currentAccessibleSequence: isArticle ? (access.currentAccessibleSequence || 1) : (access.currentAccessibleSequence || 1),
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
    // If it is an article access, we must send 'articleOrder' so the backend updates the ArticleId correctly.
    const payload: any = {
      currentAccessibleSequence: data.currentAccessibleSequence,
    }

    if (isArticle) {
      payload.articleOrder = data.currentAccessibleSequence
    }

    await userSeriesAccessService.updateUserSeriesAccess(access.userSeriesAccessId, payload)
    navigate('/admin/access/series')
  })

  return (
    <>
      <PageTitle subName={t('pages.access') || t('sidebar.access')} title={t('access.seriesAccess.edit')} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>
            {t('access.seriesAccess.editAccess')} - {isArticle ? (access?.article?.title || 'Makale') : (access?.podcastSeries?.title || t('access.seriesAccess.nA'))}
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="currentAccessibleSequence"
                  type="number"
                  min={1}
                  label={isArticle ? (t('access.seriesAccess.articleOrder') || 'Makale Sırası') : t('access.seriesAccess.currentAccessibleSequence')}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/access/series')}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : t('common.save')}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default EditSeriesAccessPage



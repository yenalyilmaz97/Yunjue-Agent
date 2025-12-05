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

const CreateMoviePage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const schema = yup.object({
    movieTitle: yup.string().trim().required(t('weeklyContent.movies.enterTitleRequired')),
  })

  const { control, handleSubmit, reset, formState } = useForm<{ movieTitle: string}>({
    resolver: yupResolver(schema),
    defaultValues: { movieTitle: '' },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      reset({ movieTitle: editItem.movieTitle || '' })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await contentService.updateMovie(editItem.movieId, { movieId: editItem.movieId, movieTitle: data.movieTitle })
    } else {
      await contentService.createMovie({ movieTitle: data.movieTitle })
    }
    navigate('/admin/content/movies')
  })

  return (
    <>
      <PageTitle subName={t('pages.content')} title={isEdit ? t('weeklyContent.movies.edit') : t('weeklyContent.movies.create')} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? t('weeklyContent.movies.edit') : t('weeklyContent.movies.new')}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={12}>
                <TextFormInput
                  control={control}
                  name="movieTitle"
                  label={t('weeklyContent.movies.titleLabel')}
                  placeholder={t('weeklyContent.movies.enterTitle')}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/movies')}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : isEdit ? t('common.update') : t('common.create')}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateMoviePage



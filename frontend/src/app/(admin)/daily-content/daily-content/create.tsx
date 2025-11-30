import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { dailyContentService, contentService } from '@/services'
import type { DailyContentResponseDTO, UpdateDailyContentRequest } from '@/services/dailyContent'
import type { Affirmation, Aphorism } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useI18n } from '@/i18n/context'

type FormFields = {
  dayOrder: number
  affirmationId: number
  aporismId: number
}

const CreateDailyContentPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [aphorisms, setAphorisms] = useState<Aphorism[]>([])

  const schema = yup.object({
    dayOrder: yup.number().required(t('dailyContent.enterDayOrder')).min(1, t('dailyContent.dayOrderMin')),
    affirmationId: yup.number().required(t('dailyContent.selectAffirmationRequired')).min(1, t('dailyContent.selectAffirmationRequired')),
    aporismId: yup.number().required(t('dailyContent.selectAphorismRequired')).min(1, t('dailyContent.selectAphorismRequired')),
  })

  const { control, handleSubmit, reset, formState } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: { dayOrder: 1, affirmationId: undefined as any, aporismId: undefined as any },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item as DailyContentResponseDTO | undefined

  useEffect(() => {
    const loadOptions = async () => {
      const [affirmationsData, aphorismsData] = await Promise.all([
        contentService.getAllAffirmations(),
        contentService.getAllAphorisms(),
      ])
      setAffirmations(affirmationsData)
      setAphorisms(aphorismsData)
    }
    loadOptions()
  }, [])

  useEffect(() => {
    if (!isEdit || !editItem) {
      // Only allow edit mode - redirect if not in edit mode
      navigate('/admin/content/daily-content')
      return
    }
    reset({
      dayOrder: editItem.dayOrder,
      affirmationId: editItem.affirmationId,
      aporismId: editItem.aporismId,
    })
  }, [isEdit, editItem, reset, navigate])

  const onSubmit = handleSubmit(async (data) => {
    if (!isEdit || !editItem) {
      return
    }
    try {
      const updateData: UpdateDailyContentRequest = {
        dailyContentId: editItem.dailyContentId,
        dayOrder: data.dayOrder,
        affirmationId: data.affirmationId,
        aporismId: data.aporismId,
      }
      await dailyContentService.updateDailyContent(updateData)
      navigate('/admin/content/daily-content')
    } catch (err) {
      console.error('Submit error:', err)
    }
  })

  return (
    <>
      <PageTitle subName={t('pages.content')} title={t('dailyContent.edit')} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{t('dailyContent.edit')}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <Controller
                  control={control}
                  name="dayOrder"
                  render={({ field, fieldState }) => (
                    <>
                      <label className="form-label">{t('dailyContent.dayOrder')}</label>
                      <input
                        type="number"
                        className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                      {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="affirmationId"
                  render={({ field, fieldState }) => (
                    <>
                      <label className="form-label">{t('dailyContent.affirmation')}</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">{t('dailyContent.selectAffirmation')}</option>
                        {affirmations.map((a) => (
                          <option key={a.affirmationId} value={a.affirmationId}>
                            {a.affirmationText}
                          </option>
                        ))}
                      </select>
                      {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="aporismId"
                  render={({ field, fieldState }) => (
                    <>
                      <label className="form-label">{t('dailyContent.aphorism')}</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">{t('dailyContent.selectAphorism')}</option>
                        {aphorisms.map((a) => (
                          <option key={a.aphorismId} value={a.aphorismId}>
                            {a.aphorismText}
                          </option>
                        ))}
                      </select>
                      {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/daily-content')}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || !isEdit}>
                {isSubmitting ? t('common.saving') : t('common.update')}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateDailyContentPage


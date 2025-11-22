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

type FormFields = {
  dayOrder: number
  affirmationId: number
  aporismId: number
}

const CreateDailyContentPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [aphorisms, setAphorisms] = useState<Aphorism[]>([])

  const schema = yup.object({
    dayOrder: yup.number().required('Please enter day order').min(1, 'Day order must be at least 1'),
    affirmationId: yup.number().required('Please select affirmation').min(1, 'Please select affirmation'),
    aporismId: yup.number().required('Please select aphorism').min(1, 'Please select aphorism'),
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
      <PageTitle subName="Content" title="Edit Daily Content" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>Edit Daily Content</CardTitle>
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
                      <label className="form-label">Day Order</label>
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
                      <label className="form-label">Affirmation</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">Select Affirmation</option>
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
                      <label className="form-label">Aphorism</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">Select Aphorism</option>
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
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/daily-content')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || !isEdit}>
                {isSubmitting ? 'Saving...' : 'Update'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateDailyContentPage


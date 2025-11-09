import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { weeklyService, userService } from '@/services'
import type { WeeklyContent } from '@/types/keci'
import type { User } from '@/types/keci'

type FormFields = {
  weeklyContentId: number
}

const EditWeeklyAssignmentPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [weeklyContents, setWeeklyContents] = useState<WeeklyContent[]>([])
  const [loading, setLoading] = useState(true)
  const state = (location.state as any) || {}
  const user = state.user as User | undefined
  const currentWeeklyContentId = user?.weeklyContentId

  const schema: yup.ObjectSchema<FormFields> = yup.object({
    weeklyContentId: yup.number().min(1).required('Please select weekly content'),
  })

  const { control, handleSubmit, reset, formState } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      weeklyContentId: currentWeeklyContentId || undefined as any,
    },
  })
  const { isSubmitting } = formState

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [contents] = await Promise.all([
          weeklyService.getAllWeeklyContent(),
        ])
        setWeeklyContents(contents)
        if (currentWeeklyContentId) {
          reset({
            weeklyContentId: currentWeeklyContentId,
          })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentWeeklyContentId, reset])

  const onSubmit = handleSubmit(async (data) => {
    if (!user) return
    try {
      await weeklyService.assignWeeklyContent({
        userId: user.userId,
        weeklyContentId: data.weeklyContentId,
      })
      navigate('/admin/access/weekly')
    } catch (err) {
      console.error('Submit error:', err)
      alert('Failed to update weekly assignment. Please try again.')
    }
  })

  if (!user) {
    return (
      <>
        <PageTitle subName="Access" title="Edit Weekly Assignment" />
        <Card>
          <CardBody>
            <p>User not found. Please go back and select a user.</p>
            <Button variant="light" onClick={() => navigate('/admin/access/weekly')}>Go Back</Button>
          </CardBody>
        </Card>
        </>
    )
  }

  return (
    <>
      <PageTitle subName="Access" title="Edit Weekly Assignment" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>Edit Weekly Assignment - {user.firstName} {user.lastName} ({user.userName})</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="d-flex align-items-center gap-2">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Loading...
            </div>
          ) : (
            <Form onSubmit={onSubmit} className="needs-validation" noValidate>
              <Row className="g-3">
                <Col md={12}>
                  <div className="mb-3">
                    <label className="form-label">User</label>
                    <input
                      type="text"
                      className="form-control"
                      value={`${user.firstName} ${user.lastName} (${user.userName}) - ${user.email}`}
                      disabled
                    />
                  </div>
                </Col>
                <Col md={12}>
                  <Controller
                    control={control}
                    name="weeklyContentId"
                    render={({ field, fieldState }) => (
                      <>
                        <label className="form-label">Weekly Content</label>
                        <select
                          className={`form-select ${fieldState.error ? 'is-invalid' : ''}`}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          value={field.value || ''}
                        >
                          <option value="">Select Weekly Content</option>
                          {weeklyContents.map((wc) => (
                            <option key={wc.weekId} value={wc.weekId}>
                              Week {wc.weekOrder} - {wc.music?.musicTitle || 'N/A'} / {wc.movie?.movieTitle || 'N/A'}
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
                <Button type="button" variant="light" onClick={() => navigate('/admin/access/weekly')}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </Form>
          )}
        </CardBody>
      </Card>
    </>
  )
}

export default EditWeeklyAssignmentPage


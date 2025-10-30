import PageTitle from '@/components/PageTitle'
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row, Spinner } from 'react-bootstrap'
import { podcastService, userService, userSeriesAccessService } from '@/services'
import type { PodcastSeries, User } from '@/types/keci'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'
import TextFormInput from '@/components/from/TextFormInput'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

const GrantSeriesAccessPage = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [series, setSeries] = useState<PodcastSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<number>>(new Set())

  const schema: yup.ObjectSchema<{ userId: number; sequences?: Record<string, number> }> = yup.object({
    userId: yup.number().typeError('Please select user').required('Please select user'),
    sequences: yup.mixed<Record<string, number>>().optional().default({}),
  })

  const { control, handleSubmit, setValue, getValues } = useForm<{ userId: number; sequences?: Record<string, number> }>({
    resolver: yupResolver(schema),
    defaultValues: { userId: undefined as unknown as number, sequences: {} },
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [u, s] = await Promise.all([userService.getAllUsers(), podcastService.getAllSeries()])
        setUsers(u)
        setSeries(s)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredSeries = useMemo(() => series, [series])

  const toggleSeries = (id: number) => {
    setSelectedSeriesIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const grant = handleSubmit(async () => {
    const formUserId = getValues('userId') || selectedUserId
    if (!formUserId || selectedSeriesIds.size === 0) return
    setSubmitting(true)
    try {
      for (const id of Array.from(selectedSeriesIds)) {
        const currentAccessibleSequence = Math.max(1, Number(getValues(`sequences.${id}` as any) ?? 1))
        await userSeriesAccessService.createUserSeriesAccess({
          userId: Number(formUserId),
          seriesId: id,
          currentAccessibleSequence,
          nextUnlockDate: new Date().toISOString(),
          currentPositionInSeconds: 0,
        })
      }
      navigate('/admin/access/series')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <>
      <PageTitle subName="Access" title="Grant Series Access" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>Grant Access</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading...</div>
          ) : (
            <Form onSubmit={grant}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>User</Form.Label>
                  <Controller
                    control={control}
                    name="userId"
                    render={({ field }) => (
                      <Form.Select
                        value={field.value ?? selectedUserId}
                        onChange={(e) => {
                          const v = e.target.value ? Number(e.target.value) : ''
                          setSelectedUserId(v as number | '')
                          field.onChange(v || undefined)
                        }}
                        required
                      >
                        <option value="" disabled>Select user...</option>
                        {users.map((u) => (
                          <option key={u.userId} value={u.userId}>
                            {u.firstName} {u.lastName} ({u.userName}) - {u.email}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  />
                </Col>
                <Col md={12}>
                  <DataTable
                    data={filteredSeries}
                    isLoading={false}
                    rowKey={(r) => (r as PodcastSeries).seriesId}
                    searchPlaceholder="Search series..."
                    searchKeys={['title']}
                    columns={[
                      {
                        key: 'seriesId',
                        header: '',
                        width: '60px',
                        render: (row) => {
                          const s = row as PodcastSeries
                          return (
                            <Form.Check
                              type="checkbox"
                              checked={selectedSeriesIds.has(s.seriesId)}
                              onChange={() => {
                                toggleSeries(s.seriesId)
                                if (!(getValues(`sequences.${s.seriesId}`) > 0)) setValue(`sequences.${s.seriesId}`, 1)
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )
                        },
                      },
                      { key: 'title', header: 'Series Title' },
                      {
                        key: 'allowed',
                        header: 'Allowed Episode #',
                        width: '220px',
                        render: (row) => {
                          const s = row as PodcastSeries
                          return (
                            <div style={{ maxWidth: 140 }} onClick={(e) => e.stopPropagation()}>
                              <TextFormInput
                                control={control}
                                name={`sequences.${s.seriesId}` as any}
                                type="number"
                                min={1}
                                placeholder="1"
                                noValidate
                                containerClassName="mb-0"
                              />
                            </div>
                          )
                        },
                      },
                    ]}
                  />
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button type="button" variant="light" onClick={() => navigate('/admin/access/series')}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitting || !selectedUserId || selectedSeriesIds.size === 0}>
                  {submitting ? 'Granting...' : 'Grant Access'}
                </Button>
              </div>
            </Form>
          )}
        </CardBody>
      </Card>
    </>
  )
}

export default GrantSeriesAccessPage



import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { podcastService } from '@/services'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import SeriesSelect from './SeriesSelect'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

type FormFields = {
  seriesId: number
  title: string
  description?: string
  audioLink: string
  isActive: boolean
  isVideo: boolean
}

const EpisodeCreateEditPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const schema: yup.ObjectSchema<FormFields> = yup.object({
    seriesId: yup.number().required('Select series'),
    title: yup.string().trim().required('Please enter title'),
    description: yup.string().trim().optional(),
    audioLink: yup.string().trim().required('Please enter audio link'),
    isActive: yup.boolean().required(),
    isVideo: yup.boolean().required(),
  })

  const { control, handleSubmit, reset, formState, watch } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: { seriesId: undefined as unknown as number, title: '', description: '', audioLink: '', isActive: true, isVideo: false },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item
  const formIsVideo = watch('isVideo')
  const formAudioLink = watch('audioLink')

  useEffect(() => {
    if (isEdit && editItem) {
      reset({
        seriesId: editItem.seriesId,
        title: editItem.title || '',
        description: editItem.description || '',
        audioLink: editItem.audioLink || '',
        isActive: !!editItem.isActive,
        isVideo: !!editItem.isVideo,
      })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await podcastService.updateEpisode(editItem.episodesId, {
        seriesId: data.seriesId,
        title: data.title,
        description: data.description,
        audioLink: data.audioLink,
        sequenceNumber: editItem.sequenceNumber,
        isActive: data.isActive,
        isVideo: data.isVideo,
      })
    } else {
      await podcastService.createEpisode({
        seriesId: data.seriesId,
        title: data.title,
        description: data.description,
        audioLink: data.audioLink,
        isActive: data.isActive,
        isVideo: data.isVideo,
      })
    }
    navigate('/admin/podcasts/episodes')
  })

  return (
    <>
      <PageTitle subName="Podcasts" title={isEdit ? 'Edit Episode' : 'Create Episode'} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? 'Edit Episode' : 'New Episode'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Series</Form.Label>
                  <SeriesSelect
                    control={control}
                    name="seriesId"
                    selectedId={isEdit && editItem ? editItem.seriesId : undefined}
                    onSeriesSelected={(s) => reset((prev) => ({ ...(prev as FormFields), seriesId: s.seriesId, isVideo: !!s.isVideo }))}
                  />
                </Form.Group>
              </Col>
              {/* Sequence is auto-assigned on create; kept editable only on edit via separate page if needed */}
              <Col md={6}>
                <TextFormInput control={control} name="title" label="Title" placeholder="Title" />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <Form.Check type="switch" id="isActive" label="Active" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="isVideo"
                  render={({ field }) => (
                    <Form.Check type="switch" id="isVideo" label="Video" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  )}
                />
              </Col>
              <Col md={12}>
                <TextAreaFormInput control={control} name="description" rows={3} label="Description" placeholder="Description" />
              </Col>
              <Col md={12}>
                <TextFormInput control={control} name="audioLink" label="Audio Link" placeholder="https://..." />
              </Col>
              {formAudioLink && (
                <Col md={12}>
                  {formIsVideo ? (
                    <div className="ratio ratio-16x9 border rounded overflow-hidden">
                      <video style={{ width: '100%', height: '100%' }} controls src={formAudioLink} />
                    </div>
                  ) : (
                    <div className="border rounded p-2">
                      <audio style={{ width: '100%' }} controls src={formAudioLink} />
                    </div>
                  )}
                </Col>
              )}
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/podcasts/episodes')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default EpisodeCreateEditPage



import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { podcastService } from '@/services'
import type { EpisodeContent } from '@/types/keci'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import SeriesSelect from './SeriesSelect'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import ContentUploader from '@/components/ContentUploader'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

type FormFields = {
  seriesId: number
  title: string
  description?: string
  content: EpisodeContent
  isActive: boolean
}

const EpisodeCreateEditPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const schema: yup.ObjectSchema<FormFields> = yup.object({
    seriesId: yup.number().required('Select series'),
    title: yup.string().trim().required('Please enter title'),
    description: yup.string().trim().optional(),
    content: yup.object({
      audio: yup.string().trim().optional(),
      video: yup.string().trim().optional(),
      images: yup.array().of(yup.string().required()).optional(),
    }),
    isActive: yup.boolean().required(),
  })

  const { control, handleSubmit, reset, formState, watch, setValue } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      seriesId: undefined as unknown as number,
      title: '',
      description: '',
      content: { audio: '', video: '', images: [] },
      isActive: true,
    },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item
  const formContent = watch('content')
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const handleUploadComplete = (type: 'audio' | 'video' | 'image', url: string) => {
    if (type === 'audio') {
      setValue('content.audio', url, { shouldDirty: true })
      // Clear video if audio is uploaded
      setValue('content.video', '', { shouldDirty: true })
    } else if (type === 'video') {
      setValue('content.video', url, { shouldDirty: true })
      // Clear audio if video is uploaded
      setValue('content.audio', '', { shouldDirty: true })
    } else if (type === 'image') {
      setImageUrls((prev) => [...prev, url])
    }
  }

  useEffect(() => {
    if (isEdit && editItem) {
      const content = editItem.content || { audio: editItem.audioLink || '', video: '', images: [] }
      reset({
        seriesId: editItem.seriesId,
        title: editItem.title || '',
        description: editItem.description || '',
        content: {
          audio: content.audio || '',
          video: content.video || '',
          images: [],
        },
        isActive: !!editItem.isActive,
      })
      setImageUrls(content.images || [])
    }
  }, [isEdit, editItem, reset])

  const onSubmit = handleSubmit(async (data) => {
    const filteredImages = imageUrls.filter(url => url && url.trim())
    const contentWithImages: EpisodeContent = {
      ...data.content,
      images: filteredImages.length > 0 ? filteredImages : undefined,
    }
    
    // Validation: At least one content type must be provided
    if (!contentWithImages.audio && !contentWithImages.video && (!contentWithImages.images || contentWithImages.images.length === 0)) {
      alert('Please upload at least one content (audio, video, or image)')
      return
    }
    
    // Determine isVideo based on content - if video exists, it's a video episode
    const isVideo = !!contentWithImages.video
    
    if (isEdit && editItem) {
      await podcastService.updateEpisode(editItem.episodesId, {
        seriesId: data.seriesId,
        title: data.title,
        description: data.description,
        content: contentWithImages,
        sequenceNumber: editItem.sequenceNumber,
        isActive: data.isActive,
        isVideo: isVideo,
      })
    } else {
      await podcastService.createEpisode({
        seriesId: data.seriesId,
        title: data.title,
        description: data.description,
        content: contentWithImages,
        isActive: data.isActive,
        isVideo: isVideo,
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
                    onSeriesSelected={(s) => reset((prev) => ({ ...(prev as FormFields), seriesId: s.seriesId }))}
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
              <Col md={12}>
                <TextAreaFormInput control={control} name="description" rows={3} label="Description" placeholder="Description" />
              </Col>
              <Col md={12}>
                <hr />
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0">Content</h6>
                  <ContentUploader onUploadComplete={handleUploadComplete} disabled={isSubmitting} />
                </div>
                <p className="text-muted small mb-0">Upload audio, video, or image files. The system will automatically detect the file type.</p>
              </Col>
              {/* Preview Section */}
              {(formContent?.audio || formContent?.video || imageUrls.filter(img => img && img.trim()).length > 0) && (
                <Col md={12}>
                  <hr />
                  <h6 className="mb-3">Preview</h6>
                  {formContent?.video ? (
                    <div className="ratio ratio-16x9 border rounded overflow-hidden mb-3">
                      <video style={{ width: '100%', height: '100%' }} controls src={formContent.video} />
                    </div>
                  ) : formContent?.audio ? (
                    <div className="border rounded p-2 mb-3">
                      <audio style={{ width: '100%' }} controls src={formContent.audio} />
                    </div>
                  ) : null}
                  {imageUrls.filter(img => img && img.trim()).length > 0 && (
                    <div className="row g-2">
                      {imageUrls.filter(img => img && img.trim()).map((img, idx) => (
                        <div key={idx} className="col-md-4 col-sm-6">
                          <div className="border rounded p-2 position-relative">
                            <img
                              src={img}
                              alt={`Image ${idx + 1}`}
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px', objectFit: 'contain', width: '100%' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `<div class="text-muted text-center p-3">Invalid image URL</div>`
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              className="position-absolute top-0 end-0 m-2"
                              onClick={() => {
                                const newUrls = imageUrls.filter((_, i) => i !== idx)
                                setImageUrls(newUrls)
                              }}
                              style={{ zIndex: 10 }}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
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



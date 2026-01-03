import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { podcastService } from '@/services'
import type { EpisodeContent } from '@/types/keci'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import SeriesSelect from './SeriesSelect'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import DropzoneFormInput from '@/components/from/DropzoneFormInput'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import type { UploadFileType } from '@/types/component-props'
import { useI18n } from '@/i18n/context'
import UploadProgressModal from '@/components/UploadProgressModal'

type FormFields = {
  seriesId: number
  title: string
  description?: string
  content: EpisodeContent
  isActive: boolean
}

const EpisodeCreateEditPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const schema: yup.ObjectSchema<FormFields> = yup.object({
    seriesId: yup.number().required(t('podcasts.episodes.selectSeries')),
    title: yup.string().trim().required(t('forms.enterTitle')),
    description: yup.string().trim().optional(),
    content: yup.object({
      audio: yup.string().trim().optional(),
      video: yup.string().trim().optional(),
      images: yup.array().of(yup.string().required()).optional(),
    }),
    isActive: yup.boolean().required(),
  })

  const { control, handleSubmit, reset, formState, setValue } = useForm<FormFields>({
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
  const [uploadedFiles, setUploadedFiles] = useState<{
    audio: File | null
    video: File | null
    images: File[]
  }>({
    audio: null,
    video: null,
    images: [],
  })
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const getFileType = (fileName: string): 'audio' | 'video' | 'image' | null => {
    const ext = fileName.toLowerCase().split('.').pop()
    if (!ext) return null

    const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma']
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv']
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']

    if (audioExts.includes(ext)) return 'audio'
    if (videoExts.includes(ext)) return 'video'
    if (imageExts.includes(ext)) return 'image'
    return null
  }

  const handleFileUpload = (files: UploadFileType[]) => {
    if (files && files.length > 0) {
      files.forEach((file) => {
        const fileObj = file as File
        const fileType = getFileType(fileObj.name)

        if (!fileType) {
          alert(t('podcasts.episodes.unsupportedFileType', { fileName: fileObj.name }))
          return
        }

        if (fileType === 'audio') {
          // Only one audio file allowed, clear video if audio is set
          setUploadedFiles((prev) => ({
            ...prev,
            audio: fileObj,
            video: null,
          }))
          setValue('content.audio', '', { shouldDirty: true })
          setValue('content.video', '', { shouldDirty: true })
        } else if (fileType === 'video') {
          // Only one video file allowed, clear audio if video is set
          setUploadedFiles((prev) => ({
            ...prev,
            video: fileObj,
            audio: null,
          }))
          setValue('content.video', '', { shouldDirty: true })
          setValue('content.audio', '', { shouldDirty: true })
        } else if (fileType === 'image') {
          // Multiple images allowed - check if file already exists
          setUploadedFiles((prev) => {
            const exists = prev.images.some(img => img.name === fileObj.name && img.size === fileObj.size)
            if (exists) {
              return prev
            }
            return {
              ...prev,
              images: [...prev.images, fileObj],
            }
          })
        }
      })
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
          images: content.images || [],
        },
        isActive: !!editItem.isActive,
      })
    }
  }, [isEdit, editItem, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && editItem) {
        // For edit mode: get existing content
        const existingContent = editItem.content || { audio: editItem.audioLink || '', video: '', images: [] }
        
        // Check if new files are uploaded
        const hasNewFiles = !!(uploadedFiles.audio || uploadedFiles.video || uploadedFiles.images.length > 0)
        
        // Validation: At least one content type must exist (either existing or new)
        const hasExistingContent = !!(existingContent.audio || existingContent.video || (existingContent.images && existingContent.images.length > 0))
        
        if (!hasExistingContent && !hasNewFiles) {
          alert(t('podcasts.episodes.uploadAtLeastOneOrExisting'))
          return
        }
        
        // Determine isVideo: prioritize new video, then existing video
        const isVideo = !!(uploadedFiles.video || existingContent.video)
        
        // If new files are uploaded, use FormData approach with file upload endpoint
        if (hasNewFiles) {
          const formData = new FormData()
          formData.append('episodeId', editItem.episodesId.toString())
          formData.append('seriesId', data.seriesId.toString())
          formData.append('title', data.title)
          if (data.description) {
            formData.append('description', data.description)
          }
          formData.append('sequenceNumber', editItem.sequenceNumber.toString())
          formData.append('isActive', data.isActive.toString())
          formData.append('isVideo', isVideo.toString())
          
          // Add files if uploaded
          if (uploadedFiles.audio) {
            formData.append('audioFile', uploadedFiles.audio)
            console.log('Adding audio file:', uploadedFiles.audio.name, 'Size:', uploadedFiles.audio.size)
          }
          
          if (uploadedFiles.video) {
            formData.append('videoFile', uploadedFiles.video)
            console.log('Adding video file:', uploadedFiles.video.name, 'Size:', uploadedFiles.video.size)
          }
          
          if (uploadedFiles.images.length > 0) {
            uploadedFiles.images.forEach((file, index) => {
              formData.append('imageFiles', file)
              console.log(`Adding image file ${index + 1}:`, file.name, 'Size:', file.size)
            })
          }
          
          // If existing images should be preserved, add them as JSON
          if (uploadedFiles.images.length === 0 && existingContent.images && existingContent.images.length > 0) {
            formData.append('imageUrlsJson', JSON.stringify(existingContent.images))
          }
          
          console.log('Updating episode with files...')
          setIsUploading(true)
          setUploadProgress(0)
          await podcastService.updateEpisodeWithFiles(formData, (progress) => {
            setUploadProgress(progress)
          })
          console.log('Episode updated successfully with files')
          setIsUploading(false)
          setUploadProgress(0)
        } else {
          // No new files, use existing content with regular update endpoint
          const content: EpisodeContent = {
            audio: existingContent.audio || '',
            video: existingContent.video || '',
            images: existingContent.images || [],
          }
          
          await podcastService.updateEpisode(editItem.episodesId, {
            seriesId: data.seriesId,
            title: data.title,
            description: data.description,
            content: content,
            sequenceNumber: editItem.sequenceNumber,
            isActive: data.isActive,
            isVideo: isVideo,
          })
        }
      } else {
        // Validation: At least one content type must be provided for create
        if (!uploadedFiles.audio && !uploadedFiles.video && uploadedFiles.images.length === 0) {
          alert(t('podcasts.episodes.uploadAtLeastOne'))
          return
        }
        
        // Determine isVideo based on content - if video exists, it's a video episode
        const isVideo = !!uploadedFiles.video
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('seriesId', data.seriesId.toString())
        formData.append('title', data.title)
        if (data.description) {
          formData.append('description', data.description)
        }
        formData.append('isActive', data.isActive.toString())
        formData.append('isVideo', isVideo.toString())

        // Add files
        if (uploadedFiles.audio) {
          formData.append('audioFile', uploadedFiles.audio)
          console.log('Adding audio file:', uploadedFiles.audio.name, 'Size:', uploadedFiles.audio.size)
        }

        if (uploadedFiles.video) {
          formData.append('videoFile', uploadedFiles.video)
          console.log('Adding video file:', uploadedFiles.video.name, 'Size:', uploadedFiles.video.size)
        }

        if (uploadedFiles.images.length > 0) {
          uploadedFiles.images.forEach((file, index) => {
            formData.append('imageFiles', file)
            console.log(`Adding image file ${index + 1}:`, file.name, 'Size:', file.size)
          })
        }

        console.log('Submitting episode with files...')
        setIsUploading(true)
        setUploadProgress(0)
        const result = await podcastService.createEpisodeWithFiles(formData, (progress) => {
          setUploadProgress(progress)
        })
        console.log('Episode created successfully:', result)
        setIsUploading(false)
        setUploadProgress(0)
      }
      navigate('/admin/podcasts/episodes')
    } catch (error: any) {
      console.error('Error creating/updating episode:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('errors.generic')
      alert(`${t('errors.generic')}: ${errorMessage}`)
    }
  })

  return (
    <>
      <PageTitle subName={t('pages.podcasts')} title={isEdit ? t('podcasts.episodes.edit') : t('podcasts.episodes.create')} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? t('podcasts.episodes.edit') : t('podcasts.episodes.new')}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('podcasts.episodes.series')}</Form.Label>
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
                <TextFormInput control={control} name="title" label={t('podcasts.episodes.titleLabel')} placeholder={t('podcasts.episodes.titleLabel')} />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <Form.Check type="switch" id="isActive" label={t('podcasts.episodes.isActive')} checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  )}
                />
              </Col>
              <Col md={12}>
                <TextAreaFormInput control={control} name="description" rows={3} label={t('podcasts.episodes.descriptionLabel')} placeholder={t('podcasts.episodes.descriptionLabel')} />
              </Col>
              <Col md={12}>
                <hr />
                <h6 className="mb-3">{t('podcasts.episodes.content')}</h6>
                <p className="text-muted small mb-3">
                  {isEdit 
                    ? t('podcasts.episodes.contentHelpEdit')
                    : t('podcasts.episodes.contentHelpCreate')}
                </p>

                <DropzoneFormInput
                  label={t('podcasts.episodes.contentFiles')}
                  text={t('podcasts.episodes.dropFiles')}
                  helpText={t('podcasts.episodes.supportedFormats')}
                  iconProps={{ icon: 'bx:cloud-upload', height: 36, width: 36 }}
                  showPreview={true}
                  onFileUpload={handleFileUpload}
                  onFileRemove={(file) => {
                    const fileObj = file as File
                    const fileType = getFileType(fileObj.name)
                    
                    if (fileType === 'audio') {
                      setUploadedFiles((prev) => ({ ...prev, audio: null }))
                    } else if (fileType === 'video') {
                      setUploadedFiles((prev) => ({ ...prev, video: null }))
                    } else if (fileType === 'image') {
                      setUploadedFiles((prev) => ({
                        ...prev,
                        images: prev.images.filter((img) => !(img.name === fileObj.name && img.size === fileObj.size && img.lastModified === fileObj.lastModified))
                      }))
                    }
                  }}
                  accept={{ 
                    'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'],
                    'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv'],
                    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
                  }}
                  maxFiles={10}
                  className="mb-3"
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/podcasts/episodes')} disabled={isUploading}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || isUploading}>
                {isSubmitting ? t('common.saving') : isEdit ? t('common.update') : t('common.create')}
              </Button>
            </div>
            <UploadProgressModal show={isUploading} progress={uploadProgress} />
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default EpisodeCreateEditPage



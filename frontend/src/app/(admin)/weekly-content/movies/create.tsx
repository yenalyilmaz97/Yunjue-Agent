import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { contentService } from '@/services'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import DropzoneFormInput from '@/components/from/DropzoneFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import type { UploadFileType } from '@/types/component-props'
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (isEdit && editItem) {
      reset({ movieTitle: editItem.movieTitle || '' })
    }
  }, [isEdit, editItem, reset])

  const handleFileUpload = (files: UploadFileType[]) => {
    if (files && files.length > 0) {
      const file = files[0] as File
      // Validate image file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF, WEBP)')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan küçük olmalıdır')
        return
      }
      setImageFile(file)
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && editItem) {
        // For edit, update movie first, then upload image separately if provided
        await contentService.updateMovie(editItem.movieId, { movieId: editItem.movieId, movieTitle: data.movieTitle })
        
        // Upload image if provided
        if (imageFile) {
          setUploadingImage(true)
          try {
            await contentService.uploadMovieImage(editItem.movieId, imageFile)
          } catch (error) {
            console.error('Error uploading movie image:', error)
            alert('Film güncellendi ancak görsel yüklenirken bir hata oluştu')
          } finally {
            setUploadingImage(false)
          }
        }
      } else {
        // For create, send both movie data and image in one request
        setUploadingImage(true)
        try {
          await contentService.createMovie({ 
            movieTitle: data.movieTitle,
            imageFile: imageFile || undefined
          })
        } finally {
          setUploadingImage(false)
        }
      }

      navigate('/admin/content/movies')
    } catch (error) {
      console.error('Error creating/updating movie:', error)
      alert('İşlem sırasında bir hata oluştu')
    }
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
              <Col md={12}>
                <DropzoneFormInput
                  label={t('weeklyContent.movies.imageLabel')}
                  text={t('weeklyContent.movies.uploadImage')}
                  helpText={t('weeklyContent.movies.uploadImageHelp')}
                  iconProps={{ icon: 'mingcute:image-line', height: 36, width: 36 }}
                  showPreview={true}
                  onFileUpload={handleFileUpload}
                  className="mb-3"
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] }}
                  maxFiles={1}
                />
                {imageFile && (
                  <div className="alert alert-info">
                    <strong>{t('weeklyContent.movies.selectedFile')}:</strong> {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="ms-2"
                      onClick={() => setImageFile(null)}
                    >
                      {t('weeklyContent.movies.remove')}
                    </Button>
                  </div>
                )}
                {isEdit && editItem?.imageUrl && !imageFile && (
                  <div className="alert alert-info">
                    <div className="d-flex align-items-start gap-3">
                      <div>
                        <strong>{t('weeklyContent.movies.currentImage')}:</strong>
                        <img 
                          src={editItem.imageUrl} 
                          alt={editItem.movieTitle}
                          style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px', display: 'block' }}
                        />
                      </div>
                      <div className="ms-auto">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={async () => {
                            if (confirm(t('weeklyContent.movies.deleteImageConfirm') || 'Afişi silmek istediğinize emin misiniz?')) {
                              try {
                                await contentService.deleteMovieImage(editItem.movieId)
                                alert(t('weeklyContent.movies.imageDeleted') || 'Afiş başarıyla silindi')
                                window.location.reload()
                              } catch (error) {
                                console.error('Error deleting movie image:', error)
                                alert(t('weeklyContent.movies.deleteImageError') || 'Afiş silinirken bir hata oluştu')
                              }
                            }
                          }}
                        >
                          {t('weeklyContent.movies.deleteImage') || 'Afişi Sil'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/movies')} disabled={uploadingImage}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || uploadingImage}>
                {isSubmitting || uploadingImage ? t('common.saving') : isEdit ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateMoviePage



import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { contentService } from '@/services'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

const CreateMusicPage = () => {
  const navigate = useNavigate()
  const schema = yup.object({
    musicTitle: yup.string().trim().required('Please enter music title'),
    musicURL: yup.string().trim().url('Please enter a valid URL').required('Please enter URL'),
    musicDescription: yup.string().trim().optional(),
  })

  const { control, handleSubmit, reset, formState } = useForm<{ musicTitle: string; musicURL: string; musicDescription?: string}>({
    resolver: yupResolver(schema),
    defaultValues: { musicTitle: '', musicURL: '', musicDescription: '' },
  })
  const { isSubmitting } = formState
  const isEdit = history.state && (history.state as any).usr && (history.state as any).usr.mode === 'edit'
  const editItem = (history.state && (history.state as any).usr && (history.state as any).usr.item) || undefined

  useEffect(() => {
    if (isEdit && editItem) {
      reset({ musicTitle: editItem.musicTitle || '', musicURL: editItem.musicURL || '', musicDescription: editItem.musicDescription || '' })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await contentService.updateMusic(editItem.musicId, { musicId: editItem.musicId, musicTitle: data.musicTitle, musicURL: data.musicURL, musicDescription: data.musicDescription || '' })
    } else {
      await contentService.createMusic({ musicTitle: data.musicTitle, musicURL: data.musicURL, musicDescription: data.musicDescription || undefined })
    }
    navigate('/admin/content/music')
  })

  return (
    <>
      <PageTitle subName="Content" title="Create Music" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? 'Edit Music' : 'New Music'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput control={control} name="musicTitle" label="Title" placeholder="Enter music title" />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="musicURL" type="url" label="URL" placeholder="https://..." />
              </Col>
              <Col md={12}>
                <TextAreaFormInput control={control} name="musicDescription" rows={3} label="Description" placeholder="Optional description" />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/music')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateMusicPage



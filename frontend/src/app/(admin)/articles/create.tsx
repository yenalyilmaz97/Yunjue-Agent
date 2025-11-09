import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { contentService } from '@/services'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

type FormValues = { title: string; pdfLink: string; isActive: boolean }

const CreateArticlePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const schema = yup.object({
    title: yup.string().trim().required('Please enter title'),
    pdfLink: yup.string().trim().url('Please enter a valid URL').required('Please enter PDF link'),
    isActive: yup.boolean().default(true),
  })

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', pdfLink: '', isActive: true },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      reset({
        title: editItem.title || '',
        pdfLink: editItem.pdfLink || '',
        isActive: !!editItem.isActive,
      })
    }
  }, [isEdit, editItem, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && editItem) {
        await contentService.updateArticle({ articleId: editItem.articleId, ...data })
      } else {
        await contentService.createArticle(data)
      }
      navigate('/admin/articles')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ArticleForm] submit error', err)
    }
  })

  return (
    <>
      <PageTitle subName="Content" title={isEdit ? 'Edit Article' : 'Create Article'} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? 'Edit Article' : 'New Article'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={12}>
                <TextFormInput control={control} name="title" label="Title" placeholder="Enter article title" />
              </Col>
              <Col md={12}>
                <TextFormInput control={control} name="pdfLink" type="url" label="PDF Link" placeholder="https://..." />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/articles')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateArticlePage



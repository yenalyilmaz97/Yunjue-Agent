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

type FormValues = { title: string; isActive: boolean }

const CreateArticlePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const schema = yup.object({
    title: yup.string().trim().required('Please enter title'),
    isActive: yup.boolean().default(true),
  })

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', isActive: true },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  useEffect(() => {
    if (isEdit && editItem) {
      reset({
        title: editItem.title || '',
        isActive: !!editItem.isActive,
      })
    }
  }, [isEdit, editItem, reset])

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Validate that pdfFile is provided
      if (!pdfFile) {
        alert('Please upload a PDF file')
        return
      }

      if (isEdit && editItem) {
        await contentService.updateArticle({ articleId: editItem.articleId, title: data.title, pdfLink: editItem.pdfLink, isActive: data.isActive })
      } else {
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('title', data.title)
        formData.append('isActive', data.isActive.toString())
        formData.append('pdfFile', pdfFile)

        await contentService.createArticleWithFile(formData)
      }
      navigate('/admin/articles')
    } catch (err) {
      console.error('[ArticleForm] submit error', err)
    }
  })

  const handleFileUpload = (files: UploadFileType[]) => {
    if (files && files.length > 0) {
      const file = files[0] as File
      // Validate PDF file
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please upload a PDF file')
        return
      }
      setPdfFile(file)
    }
  }

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
                <DropzoneFormInput
                  label="PDF File"
                  text="Drop PDF file here or click to upload"
                  helpText="Upload a PDF file"
                  iconProps={{ icon: 'bx:file-blank', height: 36, width: 36 }}
                  showPreview={true}
                  onFileUpload={handleFileUpload}
                  className="mb-3"
                  accept={{ 'application/pdf': ['.pdf'] }}
                  maxFiles={1}
                />
                {pdfFile && (
                  <div className="alert alert-info">
                    <strong>Selected file:</strong> {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="ms-2"
                      onClick={() => setPdfFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
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



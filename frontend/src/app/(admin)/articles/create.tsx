import PageTitle from '@/components/PageTitle'
import { useEffect, useMemo, useRef } from 'react'
import { contentService } from '@/services'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import DOMPurify from 'dompurify'
// Replaced Dropzone with manual uploader to avoid form event interference

type FormValues = { title: string; excerpt?: string; coverImageUrl?: string; contentHtml: string; isPublished: boolean }

const CreateArticlePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const quillRef = useRef<ReactQuill | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const schema: yup.ObjectSchema<FormValues> = yup
    .object({
      title: yup.string().trim().required('Please enter title'),
      excerpt: yup.string().trim().optional(),
      coverImageUrl: yup
        .string()
        .trim()
        .transform((v) => (v === '' ? undefined : v))
        .optional(),
      contentHtml: yup.string().trim().required('Content required'),
      isPublished: yup.boolean().default(true),
    })
    .required()

  const { control, handleSubmit, reset, setValue, watch, formState } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', excerpt: '', coverImageUrl: '', contentHtml: '', isPublished: true },
  })
  const { isSubmitting } = formState
  const coverUrl = watch('coverImageUrl')
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      // Debug: log edit item when form initializes
      // eslint-disable-next-line no-console
      console.log('[ArticleForm] init edit item', editItem)
      reset({
        title: editItem.title || '',
        excerpt: editItem.excerpt || '',
        coverImageUrl: editItem.coverImageUrl || '',
        contentHtml: editItem.contentHtml || '',
        isPublished: !!editItem.isPublished,
      })
    }
  }, [isEdit])

  const modules = useMemo(() => {
    const imageHandler = () => {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')
      input.onchange = async () => {
        const file = input.files && input.files[0]
        if (!file) return
        try {
          // eslint-disable-next-line no-console
          console.log('[ArticleForm] inline image upload start', { name: file.name, size: file.size, type: file.type })
          // For inline assets, upload anonymously and insert URL
          const { url } = await contentService.postArticleAsset(file)
          // eslint-disable-next-line no-console
          console.log('[ArticleForm] inline image upload success', url)
          const editor = quillRef.current?.getEditor()
          if (!editor) return
          const range = editor.getSelection(true)
          const index = range ? range.index : editor.getLength()
          editor.insertEmbed(index, 'image', url, 'user')
          editor.setSelection(index + 1, 0)
        } catch (err) {
          // noop; optionally toast error
          // eslint-disable-next-line no-console
          console.error('[ArticleForm] inline image upload error', err)
        }
      }
      input.click()
    }
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'blockquote', 'code-block'],
          ['clean'],
        ],
        handlers: { image: imageHandler },
      },
    }
  }, [])

  const onSubmitForm = handleSubmit(async (data) => {
    debugger;
    const payload = { ...data, contentHtml: DOMPurify.sanitize(data.contentHtml) }
    // eslint-disable-next-line no-console
    console.log('[ArticleForm] submit', { isEdit, payload })
    try {
      if (isEdit && editItem) {
        await contentService.updateArticle({ articleId: editItem.articleId, ...payload })
      } else {
        await contentService.createArticle(payload)
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
          <Form onSubmit={onSubmitForm} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={12}>
                <TextFormInput control={control} name="title" label="Title" placeholder="Enter title" />
              </Col>
              <Col md={12}>
                <TextFormInput control={control} name="excerpt" label="Excerpt" placeholder="Short summary" />
              </Col>
              <Col md={12}>
                <label className="form-label">Cover Image</label>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    Upload Cover
                  </Button>
                  {coverUrl && (
                    <span className="text-muted small">Selected</span>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="d-none"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    // eslint-disable-next-line no-console
                    console.log('[ArticleForm] cover upload start', { name: file.name, size: file.size, type: file.type })
                    try {
                      if (isEdit && editItem) {
                        const updated = await contentService.uploadArticleCoverFor(editItem.articleId, file)
                        // eslint-disable-next-line no-console
                        console.log('[ArticleForm] cover upload success (edit)', updated.coverImageUrl)
                        setValue('coverImageUrl', updated.coverImageUrl || '', { shouldDirty: true })
                      } else {
                        const { url } = await contentService.postArticleAsset(file)
                        // eslint-disable-next-line no-console
                        console.log('[ArticleForm] cover upload success (create)', url)
                        setValue('coverImageUrl', url, { shouldDirty: true })
                      }
                    } catch (err) {
                      // eslint-disable-next-line no-console
                      console.error('[ArticleForm] cover upload error', err)
                    } finally {
                      if (coverInputRef.current) coverInputRef.current.value = ''
                    }
                  }}
                />
                {coverUrl && (
                  <div className="mt-2">
                    <img src={coverUrl} alt="Cover" className="img-fluid rounded border" style={{ maxHeight: 180, objectFit: 'cover' }} />
                  </div>
                )}
              </Col>
              <Col md={12}>
                <label className="form-label">Content</label>
                <ReactQuill ref={quillRef} theme="snow" modules={modules as any} value={watch('contentHtml')} onChange={(v) => setValue('contentHtml', v, { shouldDirty: true })} />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/articles')}>Cancel</Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                onClick={() => {
                  // eslint-disable-next-line no-console
                  console.log('[ArticleForm] submit button clicked')
                }}
              >
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



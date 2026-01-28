import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row, Image } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { popupService } from '@/services'
import { useI18n } from '@/i18n/context'
import type { Popup } from '@/types/keci/popup'
import { useFilePreview } from '@/hooks/useFilePreview'

const schema = yup.object({
    title: yup.string().required('Title is required'),
    repeatable: yup.boolean().required(),
    // Image is required for create, optional for edit (if not changing)
    // We'll handle this validation manually or with a more complex schema if needed
})

const Create = () => {
    const { t } = useI18n()
    const navigate = useNavigate()
    const location = useLocation()
    const mode = location.state?.mode || 'create'
    const item = location.state?.item as Popup | undefined

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const filePreview = useFilePreview(selectedFile)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            repeatable: false,
        },
    })

    useEffect(() => {
        if (mode === 'edit' && item) {
            reset({
                title: item.title,
                repeatable: item.repeatable,
            })
        }
    }, [mode, item, reset])

    const onSubmit = async (data: any) => {
        try {
            if (mode === 'create') {
                if (!selectedFile) {
                    alert('Please select an image')
                    return
                }
                await popupService.createPopup({
                    title: data.title,
                    repeatable: data.repeatable,
                    image: selectedFile,
                })
            } else if (mode === 'edit' && item) {
                await popupService.updatePopup(item.id, {
                    title: data.title,
                    repeatable: data.repeatable,
                    image: selectedFile || undefined // Only send if new file selected
                })
            }
            navigate('/admin/popups')
        } catch (error) {
            console.error(error)
            alert('Error saving popup')
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0])
        }
    }

    return (
        <>
            <PageTitle subName="Popups" title={mode === 'edit' ? 'Edit Popup' : 'Create Popup'} />
            <Row>
                <Col xl={12}>
                    <Card>
                        <CardHeader>
                            <CardTitle as="h5">{mode === 'edit' ? 'Edit Popup' : 'New Popup'}</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter popup title"
                                                {...register('title')}
                                                isInvalid={!!errors.title}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Repeatable</Form.Label>
                                            <Form.Check
                                                type="switch"
                                                id="custom-switch"
                                                label="Show this popup every time?"
                                                {...register('repeatable')}
                                            />
                                            <Form.Text className="text-muted">
                                                If checked, the popup will be shown every session even if closed before.
                                                If unchecked, it will only be shown once per user until a new popup is activated.
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Popup Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            {mode === 'create' && !selectedFile && <div className="text-danger small mt-1">Image is required</div>}
                                        </Form.Group>

                                        {/* Preview */}
                                        <div className="mt-3">
                                            {filePreview ? (
                                                <Image src={filePreview} thumbnail style={{ maxHeight: '300px' }} />
                                            ) : (
                                                mode === 'edit' && item?.imageUrl && (
                                                    <Image src={item.imageUrl} thumbnail style={{ maxHeight: '300px' }} />
                                                )
                                            )}
                                        </div>
                                    </Col>
                                </Row>

                                <div className="mt-3">
                                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button variant="light" className="ms-2" onClick={() => navigate('/admin/popups')}>
                                        Cancel
                                    </Button>
                                </div>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default Create

import PageTitle from '@/components/PageTitle'
import { useEffect } from 'react'
import { userService } from '@/services'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

type FormFields = {
  userName: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: boolean
  city: string
  phone: string
  description?: string
  password?: string
  subscriptionEnd: string
  roleId?: number
}

const UserCreateEditPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const schema: yup.ObjectSchema<FormFields> = yup.object({
    userName: yup.string().trim().required('Please enter username'),
    email: yup.string().email('Please enter a valid email').required('Please enter email'),
    firstName: yup.string().trim().required('Please enter first name'),
    lastName: yup.string().trim().required('Please enter last name'),
    dateOfBirth: yup.string().required('Please select date of birth'),
    gender: yup.boolean().required(),
    city: yup.string().trim().required('Please enter city'),
    phone: yup.string().trim().required('Please enter phone'),
    description: yup.string().trim().optional(),
    password: yup.string().min(6, 'At least 6 characters').optional(),
    subscriptionEnd: yup.string().required('Please select subscription end date'),
    roleId: yup.number().optional(),
  })

  const { control, handleSubmit, reset, formState } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      userName: '',
      email: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: true,
      city: '',
      phone: '',
      description: '',
      password: '',
      subscriptionEnd: '',
      roleId: undefined,
    },
  })
  const { isSubmitting } = formState

  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      reset({
        userName: editItem.userName || '',
        email: editItem.email || '',
        firstName: editItem.firstName || '',
        lastName: editItem.lastName || '',
        dateOfBirth: editItem.dateOfBirth ? new Date(editItem.dateOfBirth).toISOString().split('T')[0] : '',
        gender: Boolean(editItem.gender),
        city: editItem.city || '',
        phone: editItem.phone || '',
        description: editItem.description || '',
        password: '',
        subscriptionEnd: editItem.subscriptionEnd ? new Date(editItem.subscriptionEnd).toISOString().split('T')[0] : '',
        roleId: editItem.roleId || undefined,
      })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && editItem) {
      await userService.updateUser(editItem.userId, {
        userId: editItem.userId,
        userName: data.userName,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        email: data.email,
        gender: data.gender,
        city: data.city,
        phone: data.phone,
        description: data.description,
        subscriptionEnd: data.subscriptionEnd,
        roleId: data.roleId ?? editItem.roleId,
      } as any)
    } else {
      await userService.createUser({
        userName: data.userName,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        email: data.email,
        gender: data.gender,
        city: data.city,
        phone: data.phone,
        description: data.description,
        password: data.password || '',
        subscriptionEnd: data.subscriptionEnd,
        roleId: data.roleId ?? 2,
      } as any)
    }
    navigate('/admin/users')
  })

  return (
    <>
      <PageTitle subName="Users" title={isEdit ? 'Edit User' : 'Create User'} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? 'Edit User' : 'New User'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput control={control} name="userName" label="Username" placeholder="Username" />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="email" type="email" label="Email" placeholder="Email" />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="firstName" label="First Name" placeholder="First name" />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="lastName" label="Last Name" placeholder="Last name" />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="dateOfBirth" type="date" label="Date of Birth" />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="subscriptionEnd" type="date" label="Subscription End" />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="city" label="City" placeholder="City" />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="phone" label="Phone" placeholder="Phone" />
              </Col>
              {!isEdit && (
                <Col md={6}>
                  <TextFormInput control={control} name="password" type="password" label="Password" placeholder="Password" />
                </Col>
              )}
              <Col md={12}>
                <TextAreaFormInput control={control} name="description" rows={3} label="Description" placeholder="Description" />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/users')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default UserCreateEditPage



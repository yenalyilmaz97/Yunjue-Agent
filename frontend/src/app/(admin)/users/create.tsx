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
import { useI18n } from '@/i18n/context'

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
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  const schema: yup.ObjectSchema<FormFields> = yup.object({
    userName: yup.string().trim().required(t('users.enterUserNameRequired')),
    email: yup.string().email(t('users.enterEmailInvalid')).required(t('users.enterEmailRequired')),
    firstName: yup.string().trim().required(t('users.enterFirstNameRequired')),
    lastName: yup.string().trim().required(t('users.enterLastNameRequired')),
    dateOfBirth: yup.string().required(t('users.selectDateOfBirthRequired')),
    gender: yup.boolean().required(),
    city: yup.string().trim().required(t('users.enterCityRequired')),
    phone: yup.string().trim().required(t('users.enterPhoneRequired')),
    description: yup.string().trim().optional(),
    password: yup.string().min(6, t('users.passwordMin')).optional(),
    subscriptionEnd: yup.string().required(t('users.selectSubscriptionEndRequired')),
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
      <PageTitle subName={t('pages.users')} title={isEdit ? t('users.edit') : t('users.create')} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{isEdit ? t('users.edit') : t('users.new')}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput control={control} name="userName" label={t('users.userName')} placeholder={t('users.enterUserName')} />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="email" type="email" label={t('users.email')} placeholder={t('users.enterEmail')} />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="firstName" label={t('users.firstName')} placeholder={t('users.enterFirstName')} />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="lastName" label={t('users.lastName')} placeholder={t('users.enterLastName')} />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="dateOfBirth" type="date" label={t('users.dateOfBirth')} />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="subscriptionEnd" type="date" label={t('users.subscriptionEnd')} />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="city" label={t('users.city')} placeholder={t('users.enterCity')} />
              </Col>
              <Col md={6}>
                <TextFormInput control={control} name="phone" label={t('users.phone')} placeholder={t('users.enterPhone')} />
              </Col>
              {!isEdit && (
                <Col md={6}>
                  <TextFormInput control={control} name="password" type="password" label={t('users.password')} placeholder={t('users.enterPassword')} />
                </Col>
              )}
              <Col md={12}>
                <TextAreaFormInput control={control} name="description" rows={3} label={t('users.description')} placeholder={t('users.description')} />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/users')}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : isEdit ? t('common.update') : t('common.create')}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default UserCreateEditPage



import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { userService } from '@/services'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row, Modal, FormCheck } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import { useForm, useWatch } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useI18n } from '@/i18n/context'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import PasswordFormInput from '@/components/from/PasswordFormInput'

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
  keciTimeEnd?: string
  isKeci: boolean
  roleId?: number
}

const UserCreateEditPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  const [showAddTimeModal, setShowAddTimeModal] = useState(false)
  const [targetTimeField, setTargetTimeField] = useState<'subscriptionEnd' | 'keciTimeEnd' | null>(null)

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
    isKeci: yup.boolean().required(),
    keciTimeEnd: yup.string().when('isKeci', {
      is: true,
      then: (schema) => schema.required(t('users.selectKeciTimeEndRequired') || 'Keçi süresi seçiniz'),
      otherwise: (schema) => schema.optional()
    }),
    roleId: yup.number().optional(),
  })

  const { control, handleSubmit, reset, formState, setValue, getValues } = useForm<FormFields>({
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
      keciTimeEnd: '',
      isKeci: false,
      roleId: undefined,
    },
  })
  const { isSubmitting } = formState

  const isKeci = useWatch({ control, name: 'isKeci' })

  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item

  useEffect(() => {
    if (isEdit && editItem) {
      const hasKeciTime = !!editItem.keciTimeEnd;
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
        keciTimeEnd: editItem.keciTimeEnd ? new Date(editItem.keciTimeEnd).toISOString().split('T')[0] : '',
        isKeci: hasKeciTime,
        roleId: editItem.roleId || undefined,
      })
    }
  }, [isEdit])

  const onSubmit = handleSubmit(async (data) => {
    const commonData = {
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
      keciTimeEnd: data.isKeci ? data.keciTimeEnd : null,
    };

    if (isEdit && editItem) {
      await userService.updateUser(editItem.userId, {
        userId: editItem.userId,
        ...commonData,
        roleId: data.roleId ?? editItem.roleId,
      } as any)
    } else {
      await userService.createUser({
        ...commonData,
        password: data.password || '',
        roleId: data.roleId ?? 2,
      } as any)
    }
    navigate('/admin/users')
  })

  const openAddTimeModal = (field: 'subscriptionEnd' | 'keciTimeEnd') => {
    setTargetTimeField(field)
    setShowAddTimeModal(true)
  }

  const handleAddTime = (months: number) => {
    if (!targetTimeField) return

    // Get current value or default to today
    const currentValue = getValues(targetTimeField)
    let date = currentValue ? new Date(currentValue) : new Date()

    // Check if date is valid
    if (isNaN(date.getTime())) {
      date = new Date()
    }

    // Add months
    date.setMonth(date.getMonth() + months)

    // Format to YYYY-MM-DD
    const newDateStr = date.toISOString().split('T')[0]

    setValue(targetTimeField, newDateStr, { shouldValidate: true, shouldDirty: true })
    setShowAddTimeModal(false)
  }

  const toggleKeci = (checked: boolean) => {
    setValue('isKeci', checked);
    if (checked && !getValues('keciTimeEnd')) {
      // Set default date if enabling (e.g., today or sync with subscription)
      const today = new Date().toISOString().split('T')[0];
      setValue('keciTimeEnd', today);
    }
  }

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
                <TextFormInput control={control} name="city" label={t('users.city')} placeholder={t('users.enterCity')} />
              </Col>

              <Col md={6}>
                <div className="d-flex gap-2 align-items-end">
                  <div className="flex-grow-1">
                    <TextFormInput control={control} name="subscriptionEnd" type="date" label={t('users.subscriptionEnd')} />
                  </div>
                  <Button
                    type="button"
                    variant="outline-primary"
                    onClick={() => openAddTimeModal('subscriptionEnd')}
                    title={t('common.addTime') || "Süre Ekle"}
                  >
                    <IconifyIcon icon="mdi:clock-plus-outline" />
                  </Button>
                </div>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="d-block">&nbsp;</Form.Label>
                  <FormCheck
                    type="switch"
                    id="isKeci-switch"
                    label={t('users.isKeci') || "Keçi Üyesi mi?"}
                    checked={isKeci}
                    onChange={(e) => toggleKeci(e.target.checked)}
                  />
                </Form.Group>
              </Col>

              {isKeci && (
                <Col md={6}>
                  <div className="d-flex gap-2 align-items-end">
                    <div className="flex-grow-1">
                      <TextFormInput control={control} name="keciTimeEnd" type="date" label={t('users.keciTimeEnd') || "Keçi Süresi Bitiş"} />
                    </div>
                    <Button
                      type="button"
                      variant="outline-primary"
                      onClick={() => openAddTimeModal('keciTimeEnd')}
                      title={t('common.addTime') || "Süre Ekle"}
                    >
                      <IconifyIcon icon="mdi:clock-plus-outline" />
                    </Button>
                  </div>
                </Col>
              )}

              <Col md={6}>
                <TextFormInput control={control} name="phone" label={t('users.phone')} placeholder={t('users.enterPhone')} />
              </Col>
              {!isEdit && (
                <Col md={6}>
                  <PasswordFormInput control={control} name="password" label={t('users.password')} placeholder={t('users.enterPassword')} />
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

      <Modal show={showAddTimeModal} onHide={() => setShowAddTimeModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>{t('common.addTime') || "Süre Ekle"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2">
            <Button variant="outline-primary" onClick={() => handleAddTime(1)}>
              +1 {t('common.month') || "Ay"}
            </Button>
            <Button variant="outline-primary" onClick={() => handleAddTime(3)}>
              +3 {t('common.month') || "Ay"}
            </Button>
            <Button variant="outline-primary" onClick={() => handleAddTime(6)}>
              +6 {t('common.month') || "Ay"}
            </Button>
            <Button variant="outline-primary" onClick={() => handleAddTime(12)}>
              +1 {t('common.year') || "Yıl"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default UserCreateEditPage



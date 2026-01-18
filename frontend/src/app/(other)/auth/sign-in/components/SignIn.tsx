import DarkLogo from '@/assets/images/logo-dark.png'
import LightLogo from '@/assets/images/logo-light.png'
import TextFormInput from '@/components/from/TextFormInput'
import PasswordFormInput from '@/components/from/PasswordFormInput'
import { useEffect } from 'react'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import useSignIn from '../useSignIn'
import { useI18n } from '@/i18n/context'
import { useAuthContext } from '@/context/useAuthContext'

const SignIn = () => {
  const { t } = useI18n()

  useEffect(() => {
    document.body.classList.add('authentication-bg')
    return () => {
      document.body.classList.remove('authentication-bg')
    }
  }, [])

  const { isAuthenticated, user } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Admin') {
        navigate('/dashboards')
      } else {
        navigate('/user/dashboard')
      }
    }
  }, [isAuthenticated, user, navigate])

  const { loading, login, control } = useSignIn()

  return (
    <div className="">
      <div className="account-pages py-5">
        <div className="container">
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="border-0 shadow-lg">
                <CardBody className="p-5">
                  <div className="text-center">
                    <div className="mx-auto mb-2 text-center auth-logo">
                      <Link to="/dashboards" className="logo-dark">
                        <img src={DarkLogo} height={32} alt="logo dark" />
                      </Link>
                      <Link to="/dashboards" className="logo-light">
                        <img src={LightLogo} height={130} alt="logo light" />
                      </Link>
                    </div>
                    <h4 className="fw-bold text-dark mb-2">{t('auth.welcomeBack')}</h4>
                    <p className="text-muted">{t('auth.signInToContinue')}</p>
                  </div>
                  <form onSubmit={login} className="mt-4">
                    <div className="mb-3">
                      <TextFormInput control={control} name="email" placeholder={t('auth.enterEmail')} className="form-control" label={t('auth.emailAddress')} />
                    </div>
                    <div className="mb-3">
                      {/* <Link to="/auth/reset-password" className="float-end text-muted  ms-1">
                        {t('auth.forgotPassword')}
                      </Link> */}
                      <PasswordFormInput control={control} name="password" placeholder={t('auth.enterPassword')} className="form-control" label={t('auth.password')} />
                    </div>

                    <div className="form-check mb-3">
                      <Controller
                        name="rememberMe"
                        control={control}
                        render={({ field: { onChange, value, ref } }) => (
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="remember-me"
                            onChange={onChange}
                            checked={value}
                            ref={ref}
                          />
                        )}
                      />
                      <label className="form-check-label" htmlFor="remember-me">
                        {t('auth.rememberMe')}
                      </label>
                    </div>
                    <div className="d-grid">
                      <button disabled={loading} className="btn btn-dark btn-lg fw-medium" type="submit">
                        {loading ? t('auth.signingIn') : t('auth.signIn')}
                      </button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

export default SignIn

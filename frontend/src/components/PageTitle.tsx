import { Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import IconifyIcon from './wrapper/IconifyIcon'
import { DEFAULT_PAGE_TITLE } from '@/context/constants'
import { Helmet } from 'react-helmet-async'
import { useI18n } from '@/i18n/context'

const PageTitle = ({ title, subName }: { title: string; subName: string }) => {
  const defaultTitle = DEFAULT_PAGE_TITLE
  const { t } = useI18n()

  // Map common page titles to i18n keys
  const getTranslatedTitle = (titleText: string): string => {
    const titleMap: Record<string, string> = {
      'User Dashboard': 'pages.dashboard',
      'Podcasts': 'pages.podcasts',
      'Articles': 'pages.articles',
      'Notlarım': 'pages.notes',
      'Sorularım': 'pages.questions',
      'Profilim': 'pages.profile',
      'Favorilerim': 'pages.favorites',
      'Makale': 'pages.articles',
      'Yükleniyor...': 'common.loading',
      'Makale Bulunamadı': 'articles.noContent',
    }
    
    const translationKey = titleMap[titleText]
    if (translationKey) {
      const translated = t(translationKey as any)
      return translated !== translationKey ? translated : titleText
    }
    // If already in Turkish or not in map, return as is
    return titleText
  }

  const getTranslatedSubName = (subNameText: string): string => {
    const subNameMap: Record<string, string> = {
      'KeciApp': 'Keçiyi Besle',
      'Keçıyı Besle': 'Keçiyi Besle',
      'Articles': 'Keçiyi Besle', // subName should be the app name, not the page name
      'Makale': 'pages.articles',
    }
    
    // If it's already "Keçiyi Besle", return as is
    if (subNameText === 'Keçiyi Besle') {
      return subNameText
    }
    
    const translationKey = subNameMap[subNameText]
    if (translationKey) {
      // If it's a direct string replacement (not an i18n key)
      if (translationKey === 'Keçiyi Besle') {
        return translationKey
      }
      const translated = t(translationKey as any)
      return translated !== translationKey ? translated : subNameText
    }
    return subNameText
  }

  const translatedTitle = getTranslatedTitle(title)
  const translatedSubName = getTranslatedSubName(subName)

  return (
    <>
      <Helmet>
        <title>{translatedTitle ? `${translatedTitle} | ${defaultTitle}` : defaultTitle}</title>
      </Helmet>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="mb-0 ">{translatedTitle}</h4>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="">{translatedSubName}</Link>
              </li>{' '}
              &nbsp;
              <div className="mx-1">
                <IconifyIcon icon="bx:chevron-right" />
              </div>
              &nbsp;
              <li className="breadcrumb-item active">{translatedTitle}</li>
            </ol>
          </div>
        </Col>
      </Row>
    </>
  )
}

export default PageTitle

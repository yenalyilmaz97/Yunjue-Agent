import { lazy } from 'react'
import { Navigate, type RouteProps } from 'react-router-dom'
import { useAuthContext } from '@/context/useAuthContext'

const Dashboards = lazy(() => import('@/app/(admin)/dashboards/page'))
const UserDashboard = lazy(() => import('@/app/(user)/dashboard/page'))
const UserPodcasts = lazy(() => import('@/app/(user)/podcasts/page'))
const UserFavorites = lazy(() => import('@/app/(user)/favorites/page'))
const UserNotes = lazy(() => import('@/app/(user)/notes/page'))
const UserQuestions = lazy(() => import('@/app/(user)/questions/page'))
const UserAphorisms = lazy(() => import('@/app/(user)/aphorisms/page'))
const UserProfile = lazy(() => import('@/app/(user)/profile/page'))

// Base UI Routes
const Accordions = lazy(() => import('@/app/(admin)/base-ui/accordion/page'))
const Alerts = lazy(() => import('@/app/(admin)/base-ui/alerts/page'))
const Avatars = lazy(() => import('@/app/(admin)/base-ui/avatar/page'))
const Badges = lazy(() => import('@/app/(admin)/base-ui/badge/page'))
const Breadcrumb = lazy(() => import('@/app/(admin)/base-ui/breadcrumb/page'))
const Buttons = lazy(() => import('@/app/(admin)/base-ui/buttons/page'))
const Cards = lazy(() => import('@/app/(admin)/base-ui/cards/page'))
const Carousel = lazy(() => import('@/app/(admin)/base-ui/carousel/page'))
const Collapse = lazy(() => import('@/app/(admin)/base-ui/collapse/page'))
const Dropdowns = lazy(() => import('@/app/(admin)/base-ui/dropdown/page'))
const ListGroup = lazy(() => import('@/app/(admin)/base-ui/list-group/page'))
const Modals = lazy(() => import('@/app/(admin)/base-ui/modals/page'))
const Tabs = lazy(() => import('@/app/(admin)/base-ui/tabs/page'))
const Offcanvas = lazy(() => import('@/app/(admin)/base-ui/offcanvas/page'))
const Pagination = lazy(() => import('@/app/(admin)/base-ui/pagination/page'))
const Placeholders = lazy(() => import('@/app/(admin)/base-ui/placeholders/page'))
const Popovers = lazy(() => import('@/app/(admin)/base-ui/popovers/page'))
const Progress = lazy(() => import('@/app/(admin)/base-ui/progress/page'))
const Spinners = lazy(() => import('@/app/(admin)/base-ui/spinners/page'))
const Toasts = lazy(() => import('@/app/(admin)/base-ui/toasts/page'))
const Tooltips = lazy(() => import('@/app/(admin)/base-ui/tooltips/page'))

// Charts and Maps Routes

const Apex = lazy(() => import('@/app/(admin)/apex-chart/page'))
const GoogleMaps = lazy(() => import('@/app/(admin)/maps/google/page'))
const VectorMaps = lazy(() => import('@/app/(admin)/maps/vector/page'))

// Forms Routes
const Basic = lazy(() => import('@/app/(admin)/forms/basic/page'))
const FlatPicker = lazy(() => import('@/app/(admin)/forms/flat-picker/page'))
const Validation = lazy(() => import('@/app/(admin)/forms/validation/page'))
const FileUploads = lazy(() => import('@/app/(admin)/forms/file-uploads/page'))
const Editors = lazy(() => import('@/app/(admin)/forms/editors/page'))

// Form Routes
const BasicTable = lazy(() => import('@/app/(admin)/tables/basic/page'))
const GridjsTable = lazy(() => import('@/app/(admin)/tables/gridjs/page'))

// Icon Routes
const BoxIcons = lazy(() => import('@/app/(admin)/icons/boxicons/page'))
const SolarIcons = lazy(() => import('@/app/(admin)/icons/solaricons/page'))

// Auth Routes
const AuthSignIn = lazy(() => import('@/app/(other)/auth/sign-in/page'))
const AuthSignUp = lazy(() => import('@/app/(other)/auth/sign-up/page'))
const ResetPassword = lazy(() => import('@/app/(other)/auth/reset-password/page'))
const LockScreen = lazy(() => import('@/app/(other)/auth/lock-screen/page'))
const Error404 = lazy(() => import('@/app/(other)/error-pages/pages-404/page'))
const ErrorAlt = lazy(() => import('@/app/(admin)/pages-404-alt/page'))

//layoutsRoutes

const DarkSideNav = lazy(() => import('@/app/(admin)/(layouts)/dark-sidenav/page'))
const DarkTopNav = lazy(() => import('@/app/(admin)/(layouts)/dark-topnav/page'))
const SmallSideNav = lazy(() => import('@/app/(admin)/(layouts)/small-sidenav/page'))
const HiddenSideNav = lazy(() => import('@/app/(admin)/(layouts)/hidden-sidenav/page'))
const DarkMode = lazy(() => import('@/app/(admin)/(layouts)/dark-mode/page'))

// Admin Content Management Pages
const AdminMusicPage = lazy(() => import('@/app/(admin)/weekly-content/music/page'))
const AdminMoviesPage = lazy(() => import('@/app/(admin)/weekly-content/movies/page'))
const AdminTasksPage = lazy(() => import('@/app/(admin)/weekly-content/tasks/page'))
const AdminWeeklyQuestionsPage = lazy(() => import('@/app/(admin)/weekly-content/weekly-questions/page'))
const AdminWeeklyContentPage = lazy(() => import('@/app/(admin)/weekly-content/weekly-content/page'))
const AdminAphorismsPage = lazy(() => import('@/app/(admin)/weekly-content/aphorisms/page'))
const AdminAffirmationsPage = lazy(() => import('@/app/(admin)/weekly-content/affirmations/page'))
const AdminDailyContentPage = lazy(() => import('@/app/(admin)/daily-content/daily-content/page'))
// Admin Content Create Pages
const AdminMusicCreatePage = lazy(() => import('@/app/(admin)/weekly-content/music/create'))
const AdminMoviesCreatePage = lazy(() => import('@/app/(admin)/weekly-content/movies/create'))
const AdminTasksCreatePage = lazy(() => import('@/app/(admin)/weekly-content/tasks/create'))
const AdminWeeklyQuestionsCreatePage = lazy(() => import('@/app/(admin)/weekly-content/weekly-questions/create'))
const AdminWeeklyContentCreatePage = lazy(() => import('@/app/(admin)/weekly-content/weekly-content/create'))
const AdminAphorismsCreatePage = lazy(() => import('@/app/(admin)/weekly-content/aphorisms/create'))
const AdminAffirmationsCreatePage = lazy(() => import('@/app/(admin)/weekly-content/affirmations/create'))
const AdminDailyContentCreatePage = lazy(() => import('@/app/(admin)/daily-content/daily-content/create'))
// Admin Articles Pages
const AdminArticlesPage = lazy(() => import('@/app/(admin)/articles/page'))
const AdminArticlesCreatePage = lazy(() => import('@/app/(admin)/articles/create'))
// Admin Podcasts Pages
const AdminPodcastSeriesPage = lazy(() => import('@/app/(admin)/podcasts/series/page'))
const AdminPodcastEpisodesPage = lazy(() => import('@/app/(admin)/podcasts/episodes/page'))
const AdminPodcastSeriesCreatePage = lazy(() => import('@/app/(admin)/podcasts/series/create'))
const AdminPodcastEpisodesCreatePage = lazy(() => import('@/app/(admin)/podcasts/episodes/create'))
// Admin User Management Pages
const AdminUsersPage = lazy(() => import('@/app/(admin)/users/page'))
const AdminUsersCreatePage = lazy(() => import('@/app/(admin)/users/create'))
const AdminUserDetailPage = lazy(() => import('@/app/(admin)/users/[userId]/page'))
const AdminRolesPage = lazy(() => import('@/app/(admin)/roles/page'))
// Admin Access Pages
const AdminSeriesAccessPage = lazy(() => import('@/app/(admin)/access/series-access/page'))
const AdminSeriesAccessGrantPage = lazy(() => import('@/app/(admin)/access/series-access/grant'))
const AdminSeriesAccessEditPage = lazy(() => import('@/app/(admin)/access/series-access/edit'))
const AdminWeeklyAssignmentPage = lazy(() => import('@/app/(admin)/access/weekly-assignment/page'))
const AdminWeeklyAssignmentEditPage = lazy(() => import('@/app/(admin)/access/weekly-assignment/edit'))
const AdminDailyContentAccessPage = lazy(() => import('@/app/(admin)/access/daily-content/page'))
const AdminQuestionsPage = lazy(() => import('@/app/(admin)/questions/page'))
// User Articles Pages
const UserArticlesPage = lazy(() => import('@/app/(user)/articles/page'))
const UserArticleDetailPage = lazy(() => import('@/app/(user)/articles/[slug]/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
}

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthContext()

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" />
  }

  if (user?.role === 'Admin') {
    return <Navigate to="/dashboards" />
  }

  return <Navigate to="/user/dashboard" />
}

const initialRoutes: RoutesProps[] = [
  {
    path: '/',
    name: 'root',
    element: <RootRedirect />,
  },
]

const generalRoutes: RoutesProps[] = [
  {
    path: '/dashboards',
    name: 'Dashboards',
    element: <Dashboards />,
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboardAlias',
    element: <Dashboards />,
  },
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    element: <UserDashboard />,
  },
]

export const authRoutes: RoutesProps[] = [
  {
    name: 'Sign In',
    path: '/auth/sign-in',
    element: <AuthSignIn />,
  },
  {
    name: 'Sign Up',
    path: '/auth/sign-up',
    element: <AuthSignUp />,
  },

  {
    name: 'Reset Password',
    path: '/auth/reset-password',
    element: <ResetPassword />,
  },
  {
    name: 'Lock Screen',
    path: '/auth/lock-screen',
    element: <LockScreen />,
  },
  {
    name: '404 Error',
    path: '/error-pages/pages-404',
    element: <Error404 />,
  },
]

const baseUIRoutes: RoutesProps[] = [
  {
    name: 'Accordions',
    path: '/base-ui/accordion',
    element: <Accordions />,
  },
  {
    name: 'Alerts',
    path: '/base-ui/alerts',
    element: <Alerts />,
  },
  {
    name: 'Avatars',
    path: '/base-ui/avatar',
    element: <Avatars />,
  },
  {
    name: 'Badges',
    path: '/base-ui/badge',
    element: <Badges />,
  },
  {
    name: 'Breadcrumb',
    path: '/base-ui/breadcrumb',
    element: <Breadcrumb />,
  },
  {
    name: 'Buttons',
    path: '/base-ui/buttons',
    element: <Buttons />,
  },
  {
    name: 'Cards',
    path: '/base-ui/cards',
    element: <Cards />,
  },
  {
    name: 'Carousel',
    path: '/base-ui/carousel',
    element: <Carousel />,
  },
  {
    name: 'Collapse',
    path: '/base-ui/collapse',
    element: <Collapse />,
  },
  {
    name: 'Dropdowns',
    path: '/base-ui/dropdown',
    element: <Dropdowns />,
  },
  {
    name: 'List Group',
    path: '/base-ui/list-group',
    element: <ListGroup />,
  },
  {
    name: 'Modals',
    path: '/base-ui/modals',
    element: <Modals />,
  },
  {
    name: 'Tabs',
    path: '/base-ui/tabs',
    element: <Tabs />,
  },
  {
    name: 'Offcanvas',
    path: '/base-ui/offcanvas',
    element: <Offcanvas />,
  },
  {
    name: 'Pagination',
    path: '/base-ui/pagination',
    element: <Pagination />,
  },
  {
    name: 'Placeholders',
    path: '/base-ui/placeholders',
    element: <Placeholders />,
  },
  {
    name: 'Popovers',
    path: '/base-ui/popovers',
    element: <Popovers />,
  },
  {
    name: 'Progress',
    path: '/base-ui/progress',
    element: <Progress />,
  },
  {
    name: 'Spinners',
    path: '/base-ui/spinners',
    element: <Spinners />,
  },
  {
    name: 'Toasts',
    path: '/base-ui/toasts',
    element: <Toasts />,
  },
  {
    name: 'Tooltips',
    path: '/base-ui/tooltips',
    element: <Tooltips />,
  },
]
const chartsMapsRoutes: RoutesProps[] = [
  {
    path: '/apex-chart',
    name: 'Apex charts',
    element: <Apex />,
  },
  {
    name: 'google',
    path: '/maps/google',
    element: <GoogleMaps />,
  },
  {
    name: 'vectore',
    path: '/maps/vector',
    element: <VectorMaps />,
  },
  {
    name: '404 Error',
    path: '/pages-404-alt',
    element: <ErrorAlt />,
  },
]

const formsRoutes: RoutesProps[] = [
  {
    name: 'Basic Elements',
    path: '/forms/basic',
    element: <Basic />,
  },
  {
    name: 'Flat Picker',
    path: '/forms/flat-picker',
    element: <FlatPicker />,
  },
  {
    name: 'Validation',
    path: '/forms/validation',
    element: <Validation />,
  },

  {
    name: 'File Uploads',
    path: '/forms/file-uploads',
    element: <FileUploads />,
  },
  {
    name: 'Editors',
    path: '/forms/editors',
    element: <Editors />,
  },
]

const tableRoutes: RoutesProps[] = [
  {
    name: 'Basic Tables',
    path: '/tables/basic',
    element: <BasicTable />,
  },
  {
    name: 'Grid JS',
    path: '/tables/gridjs',
    element: <GridjsTable />,
  },
]

const iconRoutes: RoutesProps[] = [
  {
    name: 'Boxicons',
    path: '/icons/boxicons',
    element: <BoxIcons />,
  },
  {
    name: 'SolarIcon',
    path: '/icons/solaricons',
    element: <SolarIcons />,
  },
]

const layoutsRoutes: RoutesProps[] = [
  {
    name: 'dark sidenav',
    path: '/dark-sidenav',
    element: <DarkSideNav />,
  },
  {
    name: 'dark topnav',
    path: '/dark-topnav',
    element: <DarkTopNav />,
  },
  {
    name: 'small sidenav',
    path: '/small-sidenav',
    element: <SmallSideNav />,
  },
  {
    name: 'hidden sidenav',
    path: '/hidden-sidenav',
    element: <HiddenSideNav />,
  },
  {
    name: 'dark mode',
    path: '/dark-mode',
    element: <DarkMode />,
  },
]

export const appRoutes = [
  ...initialRoutes,
  // ...authRoutes,
  ...baseUIRoutes,
  ...formsRoutes,
  ...generalRoutes,
  ...chartsMapsRoutes,
  ...layoutsRoutes,
  ...tableRoutes,
  ...iconRoutes,
  // admin content routes
  { name: 'AdminArticles', path: '/admin/articles', element: <AdminArticlesPage /> },
  { name: 'AdminArticlesCreate', path: '/admin/articles/create', element: <AdminArticlesCreatePage /> },
  { name: 'AdminContentMusic', path: '/admin/content/music', element: <AdminMusicPage /> },
  { name: 'AdminContentMovies', path: '/admin/content/movies', element: <AdminMoviesPage /> },
  { name: 'AdminContentTasks', path: '/admin/content/tasks', element: <AdminTasksPage /> },
  { name: 'AdminContentWeeklyQuestions', path: '/admin/content/weekly-questions', element: <AdminWeeklyQuestionsPage /> },
  { name: 'AdminContentWeeklyContent', path: '/admin/content/weekly-content', element: <AdminWeeklyContentPage /> },
  { name: 'AdminContentAphorisms', path: '/admin/content/aphorisms', element: <AdminAphorismsPage /> },
  { name: 'AdminContentAffirmations', path: '/admin/content/affirmations', element: <AdminAffirmationsPage /> },
  { name: 'AdminContentDailyContent', path: '/admin/content/daily-content', element: <AdminDailyContentPage /> },
  // admin content create routes
  { name: 'AdminContentMusicCreate', path: '/admin/content/music/create', element: <AdminMusicCreatePage /> },
  { name: 'AdminContentMoviesCreate', path: '/admin/content/movies/create', element: <AdminMoviesCreatePage /> },
  { name: 'AdminContentTasksCreate', path: '/admin/content/tasks/create', element: <AdminTasksCreatePage /> },
  { name: 'AdminContentWeeklyQuestionsCreate', path: '/admin/content/weekly-questions/create', element: <AdminWeeklyQuestionsCreatePage /> },
  { name: 'AdminContentWeeklyContentCreate', path: '/admin/content/weekly-content/create', element: <AdminWeeklyContentCreatePage /> },
  { name: 'AdminContentAphorismsCreate', path: '/admin/content/aphorisms/create', element: <AdminAphorismsCreatePage /> },
  { name: 'AdminContentAffirmationsCreate', path: '/admin/content/affirmations/create', element: <AdminAffirmationsCreatePage /> },
  { name: 'AdminContentDailyContentCreate', path: '/admin/content/daily-content/create', element: <AdminDailyContentCreatePage /> },
  // admin podcasts routes
  { name: 'AdminPodcastSeries', path: '/admin/podcasts/series', element: <AdminPodcastSeriesPage /> },
  { name: 'AdminPodcastEpisodes', path: '/admin/podcasts/episodes', element: <AdminPodcastEpisodesPage /> },
  { name: 'AdminPodcastSeriesCreate', path: '/admin/podcasts/series/create', element: <AdminPodcastSeriesCreatePage /> },
  { name: 'AdminPodcastEpisodesCreate', path: '/admin/podcasts/episodes/create', element: <AdminPodcastEpisodesCreatePage /> },
  // admin users routes
  { name: 'AdminUsers', path: '/admin/users', element: <AdminUsersPage /> },
  { name: 'AdminUsersCreate', path: '/admin/users/create', element: <AdminUsersCreatePage /> },
  { name: 'AdminUserDetail', path: '/admin/users/:userId', element: <AdminUserDetailPage /> },
  { name: 'AdminRoles', path: '/admin/roles', element: <AdminRolesPage /> },
  // admin access routes
  { name: 'AdminSeriesAccess', path: '/admin/access/series', element: <AdminSeriesAccessPage /> },
  { name: 'AdminSeriesAccessGrant', path: '/admin/access/series/grant', element: <AdminSeriesAccessGrantPage /> },
  { name: 'AdminSeriesAccessEdit', path: '/admin/access/series/edit', element: <AdminSeriesAccessEditPage /> },
  { name: 'AdminWeeklyAssignment', path: '/admin/access/weekly', element: <AdminWeeklyAssignmentPage /> },
  { name: 'AdminWeeklyAssignmentEdit', path: '/admin/access/weekly/edit', element: <AdminWeeklyAssignmentEditPage /> },
  { name: 'AdminDailyContentAccess', path: '/admin/access/daily-content', element: <AdminDailyContentAccessPage /> },
  { name: 'AdminQuestions', path: '/admin/questions', element: <AdminQuestionsPage /> },
  // user routes
  { name: 'UserArticles', path: '/articles', element: <UserArticlesPage /> },
  { name: 'UserArticleDetail', path: '/articles/*', element: <UserArticleDetailPage /> },
  {
    name: 'User Podcasts',
    path: '/podcasts',
    element: <UserPodcasts />,
  },
  {
    name: 'User Favorites',
    path: '/favorites',
    element: <UserFavorites />,
  },
  {
    name: 'User Notes',
    path: '/notes',
    element: <UserNotes />,
  },
  {
    name: 'User Questions',
    path: '/questions',
    element: <UserQuestions />,
  },
  {
    name: 'User Aphorisms',
    path: '/aphorisms',
    element: <UserAphorisms />,
  },
  {
    name: 'User Profile',
    path: '/profile',
    element: <UserProfile />,
  },
]

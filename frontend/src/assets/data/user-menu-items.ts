import { MenuItemType } from '@/types/menu'

export const USER_MENU_ITEMS: MenuItemType[] = [
  {
    key: 'menu',
    label: 'MENU...',
    isTitle: true,
  },
  {
    key: 'user-dashboard',
    label: 'dashboard',
    icon: 'mingcute:home-3-line',
    url: '/user/dashboard',
  },
  {
    key: 'content',
    label: 'CONTENT',
    isTitle: true,
  },
  {
    key: 'articles',
    label: 'Articles',
    icon: 'mingcute:book-3-line',
    url: '/articles',
  },
  {
    key: 'podcasts',
    label: 'Podcasts',
    icon: 'mingcute:headphone-line',
    url: '/podcasts',
  },
  {
    key: 'favorites',
    label: 'Favorites',
    icon: 'mingcute:heart-line',
    url: '/favorites',
  },
  {
    key: 'notes',
    label: 'Notes',
    icon: 'mingcute:notebook-line',
    url: '/notes',
  },
  {
    key: 'questions',
    label: 'Questions',
    icon: 'mingcute:question-line',
    url: '/questions',
  },
  {
    key: 'profile-section',
    label: 'PROFILE',
    isTitle: true,
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: 'mingcute:user-3-line',
    url: '/profile',
  },
]



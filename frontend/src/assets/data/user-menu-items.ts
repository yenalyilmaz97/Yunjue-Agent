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
    label: 'İçerikler',
    icon: 'mingcute:grid-2-line',
    children: [
      {
        key: 'articles',
        label: 'Makaleler',
        url: '/articles',
        parentKey: 'content',
      },
      {
        key: 'podcasts',
        label: 'Podcastler',
        url: '/podcasts',
        parentKey: 'content',
      },
      {
        key: 'aphorisms',
        label: 'Aforizmalar & Olumlamalar',
        url: '/aphorisms',
        parentKey: 'content',
      },
    ],
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



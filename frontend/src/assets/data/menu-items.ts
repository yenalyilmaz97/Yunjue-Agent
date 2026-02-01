import { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'menu',
    label: 'MENÜ',
    isTitle: true,
  },
  {
    key: 'dashboards',
    label: 'Gösterge Paneli',
    icon: 'mingcute:home-3-line',
    url: '/dashboards',
  },

  // ====================User Management===================
  {
    key: 'user-management-title',
    label: 'Kullanıcı Yönetimi',
    isTitle: true,
  },
  {
    key: 'users',
    label: 'Kullanıcılar',
    icon: 'bx:group',
    url: '/admin/users'
  },
  {
    key: 'access-section',
    label: 'Erişim Kontrolü',
    icon: 'bx:key',
    children: [
      { key: 'daily-content-access', label: 'Günlük İçerik Erişimi', url: '/admin/access/daily-content', parentKey: 'access-section' },
      { key: 'weekly-assignment', label: 'Haftalık Atamalar', url: '/admin/access/weekly', parentKey: 'access-section' },
      { key: 'series-access', label: 'Seri Erişimi', url: '/admin/access/series', parentKey: 'access-section' },
    ],
  },
  {
    key: 'user-feedback-section',
    label: 'Geri Bildirimler',
    icon: 'mingcute:chat-2-line',
    children: [
      { key: 'questions', label: 'Sorular', url: '/admin/questions', parentKey: 'user-feedback-section' },
      { key: 'notes', label: 'Notlar', url: '/admin/notes', parentKey: 'user-feedback-section' },
    ],
  },

  // ====================Content Management===================
  {
    key: 'content-management-title',
    label: 'İçerik Yönetimi',
    isTitle: true,
  },
  {
    key: 'daily-management',
    label: 'Günlük İçerikler',
    icon: 'mingcute:sun-line',
    children: [
      { key: 'content-daily-content', label: 'Günlük İçerik', url: '/admin/content/daily-content', parentKey: 'daily-management' },
      { key: 'content-aphorisms', label: 'Aforizmalar', url: '/admin/content/aphorisms', parentKey: 'daily-management' },
      { key: 'content-affirmations', label: 'Olumlamalar', url: '/admin/content/affirmations', parentKey: 'daily-management' },
    ]
  },
  {
    key: 'weekly-content',
    label: 'Haftalık İçerikler',
    icon: 'mingcute:calendar-week-line',
    children: [
      { key: 'content-weekly-content', label: 'Haftalık İçerik', url: '/admin/content/weekly-content', parentKey: 'weekly-content' },
      { key: 'content-music', label: 'Müzik', url: '/admin/content/music', parentKey: 'weekly-content' },
      { key: 'content-movies', label: 'Filmler', url: '/admin/content/movies', parentKey: 'weekly-content' },
      { key: 'content-tasks', label: 'Görevler', url: '/admin/content/tasks', parentKey: 'weekly-content' },
      { key: 'content-weekly-questions', label: 'Haftalık Sorular', url: '/admin/content/weekly-questions', parentKey: 'weekly-content' },
    ],
  },
  {
    key: 'library-content',
    label: 'Kütüphane',
    icon: 'mingcute:book-2-line',
    children: [
      { key: 'content-articles', label: 'Makaleler', url: '/admin/articles', parentKey: 'library-content' },
      { key: 'podcast-series', label: 'Podcast Serileri', url: '/admin/podcasts/series', parentKey: 'library-content' },
      { key: 'podcast-episodes', label: 'Podcast Bölümleri', url: '/admin/podcasts/episodes', parentKey: 'library-content' },
    ],
  },

  // ====================Site Management===================
  {
    key: 'site-management-title',
    label: 'Ayarlar',
    isTitle: true,
  },
  {
    key: 'site-content',
    label: 'Ayarlar',
    icon: 'mingcute:settings-2-line',
    children: [
      { key: 'content-popups', label: 'Popup Yönetimi', url: '/admin/popups', parentKey: 'site-content' },
      { key: 'update-history', label: 'Güncelleme Geçmişi', url: '/admin/content-updates', parentKey: 'site-content' },
      { key: 'roles', label: 'Rol Yönetimi', url: '/admin/roles', parentKey: 'site-content' },
    ]
  },
]

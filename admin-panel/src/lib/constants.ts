export const API_BASE = '/api/v2/admin'

export const ENTITY_LABELS: Record<string, string> = {
  blog_post: 'Блог',
  vacancy: 'Вакансия',
  project: 'Проект',
  contact: 'Заявка',
  user: 'Пользователь',
  role: 'Роль',
  settings: 'Настройки',
  service: 'Услуга',
  document: 'Документ',
  testimonial: 'Отзыв',
  equipment: 'Техника',
  project_image: 'Фото проекта',
}

export const ACTION_LABELS: Record<string, string> = {
  create: 'Создание',
  update: 'Обновление',
  delete: 'Удаление',
  login: 'Вход',
  logout: 'Выход',
}

export const EMPLOYMENT_TYPES = [
  'Полная занятость',
  'Частичная занятость',
  'Вахта',
  'Стажировка',
] as const

export const ACTION_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  create: 'default',
  update: 'secondary',
  delete: 'destructive',
  login: 'outline',
  logout: 'outline',
}

export const NOTIFICATION_TYPE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  info: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'destructive',
}

export const NAV_ITEMS = [
  { label: 'Дашборд', path: '/panel', icon: 'LayoutDashboard' },
  { label: 'Блог', path: '/panel/blog', icon: 'FileText' },
  { label: 'Вакансии', path: '/panel/vacancies', icon: 'Briefcase' },
  { label: 'Проекты', path: '/panel/projects', icon: 'Building2' },
  { label: 'Услуги', path: '/panel/services', icon: 'Wrench' },
  { label: 'Документы', path: '/panel/documents', icon: 'FileCheck' },
  { label: 'Отзывы', path: '/panel/testimonials', icon: 'Star' },
  { label: 'Техника', path: '/panel/equipment', icon: 'Truck' },
  { label: 'Медиа', path: '/panel/media', icon: 'Image' },
  { label: 'Заявки', path: '/panel/contacts', icon: 'MessageSquare' },
  { label: 'Пользователи', path: '/panel/users', icon: 'Users' },
  { label: 'Роли', path: '/panel/roles', icon: 'Shield' },
  { label: 'Настройки', path: '/panel/settings', icon: 'Settings' },
  { label: 'Аудит', path: '/panel/audit', icon: 'ScrollText' },
  { label: 'Уведомления', path: '/panel/notifications', icon: 'Bell' },
] as const

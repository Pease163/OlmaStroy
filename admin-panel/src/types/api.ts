export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface SingleResponse<T> {
  data: T
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export interface ListParams {
  page?: number
  per_page?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  [key: string]: unknown
}

export interface DashboardStats {
  blog_posts: number
  blog_posts_published: number
  vacancies: number
  vacancies_active: number
  projects: number
  projects_visible: number
  contacts: number
  contacts_unread: number
  users: number
}

export interface ApiError {
  response?: { data?: { error?: { code?: string; message?: string } } }
  message?: string
}

export interface ChartData {
  posts_by_month: { month: string; label: string; count: number }[]
  contacts_by_week: { week: string; label: string; count: number }[]
  vacancies_by_type: { type: string; count: number }[]
  projects_by_category: { category: string; count: number }[]
}

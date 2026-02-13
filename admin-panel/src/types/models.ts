export interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
  role_id: number | null
  role?: { id: number; name: string }
  is_2fa_enabled: boolean
  avatar_url: string | null
  last_login: string | null
  is_active: boolean
  created_at: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  image_url: string | null
  is_published: boolean
  publish_at: string | null
  meta_title: string | null
  meta_description: string | null
  tags: { id: number; name: string; slug: string }[]
  created_at: string
  updated_at: string
}

export interface Vacancy {
  id: number
  title: string
  location: string
  description: string
  salary: string | null
  requirements: string | null
  employment_type: string
  is_active: boolean
  created_at: string
}

export interface Project {
  id: number
  title: string
  slug: string
  location: string | null
  description: string | null
  content: string | null
  image_url: string | null
  category: string | null
  year: number | null
  order: number
  is_visible: boolean
  meta_title: string | null
  meta_description: string | null
}

export interface ProjectImage {
  id: number
  project_id: number
  image_url: string
  caption: string | null
  order: number
}

export interface ContactSubmission {
  id: number
  name: string
  phone: string | null
  email: string | null
  message: string | null
  subject: string | null
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: number
  user_id: number | null
  user: string | null
  action: string
  entity_type: string | null
  entity_id: number | null
  entity_title: string | null
  changes: Record<string, { old: string | null; new: string | null }> | null
  ip_address: string | null
  created_at: string
}

export interface Role {
  id: number
  name: string
  description: string | null
  is_system: boolean
  permissions: string[]
  created_at: string
}

export interface Permission {
  id: number
  codename: string
  name: string
  group: string | null
}

export interface SiteSetting {
  id: number
  key: string
  value: unknown
  value_type: string
  group: string
  label: string
  description: string | null
  order: number
}

export interface Notification {
  id: number
  user_id: number
  title: string
  message: string | null
  type: 'info' | 'success' | 'warning' | 'error'
  link: string | null
  is_read: boolean
  created_at: string
}

export interface UserSession {
  id: number
  user_id: number
  ip_address: string | null
  user_agent: string | null
  device_info: string | null
  created_at: string
  last_active: string | null
  is_active: boolean
}

export interface Draft {
  id: number
  user_id: number
  entity_type: string
  entity_id: number | null
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SearchResult {
  type: string
  id: number
  title: string
  subtitle: string | null
  url: string
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { AppLayout } from '@/components/layout/app-layout'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/loading-skeleton'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/login'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const BlogListPage = lazy(() => import('@/pages/blog/blog-list'))
const BlogFormPage = lazy(() => import('@/pages/blog/blog-form'))
const VacancyListPage = lazy(() => import('@/pages/vacancies/vacancy-list'))
const VacancyFormPage = lazy(() => import('@/pages/vacancies/vacancy-form'))
const ProjectListPage = lazy(() => import('@/pages/projects/project-list'))
const ProjectFormPage = lazy(() => import('@/pages/projects/project-form'))
const ContactListPage = lazy(() => import('@/pages/contacts/contact-list'))
const ContactDetailPage = lazy(() => import('@/pages/contacts/contact-detail'))
const UserListPage = lazy(() => import('@/pages/users/user-list'))
const UserFormPage = lazy(() => import('@/pages/users/user-form'))
const RoleListPage = lazy(() => import('@/pages/roles/role-list'))
const RoleFormPage = lazy(() => import('@/pages/roles/role-form'))
const ServiceListPage = lazy(() => import('@/pages/services/service-list'))
const ServiceFormPage = lazy(() => import('@/pages/services/service-form'))
const SettingsPage = lazy(() => import('@/pages/settings/settings-page'))
const AuditLogPage = lazy(() => import('@/pages/audit/audit-log'))
const NotificationsPage = lazy(() => import('@/pages/notifications/notifications-page'))
const ProfilePage = lazy(() => import('@/pages/profile/profile-page'))
const DocumentListPage = lazy(() => import('@/pages/documents/document-list'))
const DocumentFormPage = lazy(() => import('@/pages/documents/document-form'))
const TestimonialListPage = lazy(() => import('@/pages/testimonials/testimonial-list'))
const TestimonialFormPage = lazy(() => import('@/pages/testimonials/testimonial-form'))
const EquipmentListPage = lazy(() => import('@/pages/equipment/equipment-list'))
const EquipmentFormPage = lazy(() => import('@/pages/equipment/equipment-form'))
const MediaPage = lazy(() => import('@/pages/media/media-page'))

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/panel/login" element={<LoginPage />} />
                <Route path="/panel" element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="blog" element={<BlogListPage />} />
                  <Route path="blog/new" element={<BlogFormPage />} />
                  <Route path="blog/:id" element={<BlogFormPage />} />
                  <Route path="vacancies" element={<VacancyListPage />} />
                  <Route path="vacancies/new" element={<VacancyFormPage />} />
                  <Route path="vacancies/:id" element={<VacancyFormPage />} />
                  <Route path="projects" element={<ProjectListPage />} />
                  <Route path="projects/new" element={<ProjectFormPage />} />
                  <Route path="projects/:id" element={<ProjectFormPage />} />
                  <Route path="services" element={<ServiceListPage />} />
                  <Route path="services/new" element={<ServiceFormPage />} />
                  <Route path="services/:id" element={<ServiceFormPage />} />
                  <Route path="contacts" element={<ContactListPage />} />
                  <Route path="contacts/:id" element={<ContactDetailPage />} />
                  <Route path="users" element={<UserListPage />} />
                  <Route path="users/new" element={<UserFormPage />} />
                  <Route path="users/:id" element={<UserFormPage />} />
                  <Route path="roles" element={<RoleListPage />} />
                  <Route path="roles/new" element={<RoleFormPage />} />
                  <Route path="roles/:id" element={<RoleFormPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="audit" element={<AuditLogPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="documents" element={<DocumentListPage />} />
                  <Route path="documents/new" element={<DocumentFormPage />} />
                  <Route path="documents/:id" element={<DocumentFormPage />} />
                  <Route path="testimonials" element={<TestimonialListPage />} />
                  <Route path="testimonials/new" element={<TestimonialFormPage />} />
                  <Route path="testimonials/:id" element={<TestimonialFormPage />} />
                  <Route path="equipment" element={<EquipmentListPage />} />
                  <Route path="equipment/new" element={<EquipmentFormPage />} />
                  <Route path="equipment/:id" element={<EquipmentFormPage />} />
                  <Route path="media" element={<MediaPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<Navigate to="/panel" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

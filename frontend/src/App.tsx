import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import EventsPage from './pages/EventsPage'
import PageEditorPage from './pages/PageEditorPage'
import UserEditorPage from './pages/UserEditorPage'
import RolesPage from './pages/RolesPage'
import CustomersPage from './pages/CustomersPage'
import GroupsPage from './pages/GroupsPage'
import OrgChartPage from './pages/OrgChartPage'
import ClientPage from './pages/ClientPage'
import ProjectsPage from './pages/ProjectsPage'
import CalendarPage from './pages/CalendarPage'
import SurveyPage from './pages/SurveyPage'
import AccountSettingsPage from './pages/AccountSettingsPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import GeneralSettingsPage from './pages/GeneralSettingsPage'
import RequiredSettingsPage from './pages/RequiredSettingsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import PagesListPage from './pages/PagesListPage'
import PageCreatePage from './pages/PageCreatePage'
import PageDetailPage from './pages/PageDetailPage'
import BulkUsersPage from './pages/BulkUsersPage'
import CreateUserPage from './pages/CreateUserPage'
import SearchUserPage from './pages/SearchUserPage'
import UpdatePagePage from './pages/UpdatePagePage'
import SyncPagePage from './pages/SyncPagePage'
import ConnectPagePage from './pages/ConnectPagePage'
import DisconnectPagePage from './pages/DisconnectPagePage'

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/events" />} />
          
          {/* Communication Section */}
          <Route path="/communication/pages" element={<PagesListPage />} />
          <Route path="/communication/pages/new" element={<PageCreatePage />} />
          <Route path="/communication/pages/update" element={<UpdatePagePage />} />
          <Route path="/communication/pages/sync" element={<SyncPagePage />} />
          <Route path="/communication/pages/connect" element={<ConnectPagePage />} />
          <Route path="/communication/pages/disconnect" element={<DisconnectPagePage />} />
          <Route path="/communication/bulk-users" element={<BulkUsersPage />} />

          {/* Events Section */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/page-editor" element={<PageEditorPage />} />
          
          {/* People Section */}
          <Route path="/people/create-user" element={<CreateUserPage />} />
          <Route path="/people/search-user" element={<SearchUserPage />} />
          <Route path="/people/user-editor" element={<UserEditorPage />} />
          <Route path="/people/roles" element={<RolesPage />} />
          <Route path="/people/customers" element={<CustomersPage />} />
          <Route path="/people/groups" element={<GroupsPage />} />
          <Route path="/people/org-chart" element={<OrgChartPage />} />
          <Route path="/people/client" element={<ClientPage />} />

          {/* Projects Section */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/calendar" element={<CalendarPage />} />
          <Route path="/projects/survey" element={<SurveyPage />} />

          {/* Settings Section */}
          <Route path="/settings/account" element={<AccountSettingsPage />} />
          <Route path="/settings/profile" element={<ProfileSettingsPage />} />
          <Route path="/settings/general" element={<GeneralSettingsPage />} />
          <Route path="/settings/required" element={<RequiredSettingsPage />} />

          {/* Analytics */}
          <Route path="/analytics" element={<AnalyticsPage />} />

          <Route path="*" element={<Navigate to="/events" />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  )
}
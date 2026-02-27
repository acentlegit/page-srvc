import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layout/AdminLayout'
import EventsPage from './pages/EventsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
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
import InvitationAcceptPage from './pages/InvitationAcceptPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CustomerDashboardPage from './pages/CustomerDashboardPage'
import CustomerAddPage from './pages/CustomerAddPage'
import StaffDashboardPage from './pages/StaffDashboardPage'
import C2MFormsPage from './pages/C2MFormsPage'
import TasksManagementPage from './pages/TasksManagementPage'
import LeadsManagementPage from './pages/LeadsManagementPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import AccountsPage from './pages/AccountsPage'
import CRMAnalyticsPage from './pages/CRMAnalyticsPage'
import ActivityFeedPage from './pages/ActivityFeedPage'
import CRMIntakeFormPage from './pages/CRMIntakeFormPage'
import FileUploadPage from './pages/FileUploadPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import CitizenServicesDashboard from './pages/customApplications/CitizenServicesDashboard'
import IntakeFormBuilderPage from './pages/customApplications/IntakeFormBuilderPage'
import IntakeFormsListPage from './pages/customApplications/IntakeFormsListPage'
import IntakeFormPage from './pages/customApplications/IntakeFormPage'
import AnalyticsDashboardPage from './pages/customApplications/AnalyticsDashboardPage'
import SubmissionsPage from './pages/customApplications/SubmissionsPage'
import CitizenServicesProjectsPage from './pages/customApplications/ProjectsPage'
import CitizenServicesEmployeesPage from './pages/customApplications/EmployeesPage'
import StaticPagesPage from './pages/customApplications/StaticPagesPage'
// Case Management
import CreateCasePage from './pages/customApplications/caseManagement/CreateCasePage'
import ActiveCasesPage from './pages/customApplications/caseManagement/ActiveCasesPage'
import ClosedCasesPage from './pages/customApplications/caseManagement/ClosedCasesPage'
import AssignCaseWorkerPage from './pages/customApplications/caseManagement/AssignCaseWorkerPage'
import CaseReportsPage from './pages/customApplications/caseManagement/CaseReportsPage'
// Housing Assistance
import HousingApplicationsPage from './pages/customApplications/housing/ApplicationsPage'
import EligibilityReviewPage from './pages/customApplications/housing/EligibilityReviewPage'
import HousingApprovalsPage from './pages/customApplications/housing/ApprovalsPage'
import WaitlistPage from './pages/customApplications/housing/WaitlistPage'
import HousingInventoryPage from './pages/customApplications/housing/HousingInventoryPage'
// Workforce Development
import JobApplicationsPage from './pages/customApplications/workforce/JobApplicationsPage'
import TrainingProgramsPage from './pages/customApplications/workforce/TrainingProgramsPage'
import EmployersPage from './pages/customApplications/workforce/EmployersPage'
import PlacementTrackingPage from './pages/customApplications/workforce/PlacementTrackingPage'
// Fleet Management
import FleetManagementDashboard from './pages/customApplications/fleetManagement/FleetManagementDashboard'
// Fleet Operations
import VehiclesPage from './pages/customApplications/fleetManagement/operations/VehiclesPage'
import DriversPage from './pages/customApplications/fleetManagement/operations/DriversPage'
import TripManagementPage from './pages/customApplications/fleetManagement/operations/TripManagementPage'
import RoutePlanningPage from './pages/customApplications/fleetManagement/operations/RoutePlanningPage'
import DispatchPage from './pages/customApplications/fleetManagement/operations/DispatchPage'
// Fleet Maintenance
import ServiceSchedulePage from './pages/customApplications/fleetManagement/maintenance/ServiceSchedulePage'
import WorkOrdersPage from './pages/customApplications/fleetManagement/maintenance/WorkOrdersPage'
import RepairsHistoryPage from './pages/customApplications/fleetManagement/maintenance/RepairsHistoryPage'
import PartsInventoryPage from './pages/customApplications/fleetManagement/maintenance/PartsInventoryPage'
// Fleet Compliance
import InspectionsPage from './pages/customApplications/fleetManagement/compliance/InspectionsPage'
import InsurancePage from './pages/customApplications/fleetManagement/compliance/InsurancePage'
import RegistrationsPage from './pages/customApplications/fleetManagement/compliance/RegistrationsPage'
import IncidentReportsPage from './pages/customApplications/fleetManagement/compliance/IncidentReportsPage'
// Fleet Monitoring
import GPSTrackingPage from './pages/customApplications/fleetManagement/monitoring/GPSTrackingPage'
import FuelLogsPage from './pages/customApplications/fleetManagement/monitoring/FuelLogsPage'
import MileageLogsPage from './pages/customApplications/fleetManagement/monitoring/MileageLogsPage'
// Fleet Administration
import FleetReportsPage from './pages/customApplications/fleetManagement/administration/ReportsPage'
import FleetAnalyticsPage from './pages/customApplications/fleetManagement/administration/AnalyticsPage'
import FleetStaffPage from './pages/customApplications/fleetManagement/administration/StaffPage'
import FleetSettingsPage from './pages/customApplications/fleetManagement/administration/SettingsPage'
// Church Services
import ChurchServicesDashboard from './pages/customApplications/churchServices/ChurchServicesDashboard'
// Church Ministry Management
import ChurchMembersPage from './pages/customApplications/churchServices/ministryManagement/MembersPage'
import VisitorsPage from './pages/customApplications/churchServices/ministryManagement/VisitorsPage'
import ChurchVolunteersPage from './pages/customApplications/churchServices/ministryManagement/VolunteersPage'
import ChurchGroupsPage from './pages/customApplications/churchServices/ministryManagement/GroupsPage'
// Church Services & Events
import ChurchServiceSchedulePage from './pages/customApplications/churchServices/servicesEvents/ServiceSchedulePage'
import ChurchEventsPage from './pages/customApplications/churchServices/servicesEvents/EventsPage'
import SermonsPage from './pages/customApplications/churchServices/servicesEvents/SermonsPage'
import AnnouncementsPage from './pages/customApplications/churchServices/servicesEvents/AnnouncementsPage'
// Church Contributions
import DonationsPage from './pages/customApplications/churchServices/contributions/DonationsPage'
import TithesPage from './pages/customApplications/churchServices/contributions/TithesPage'
import PledgesPage from './pages/customApplications/churchServices/contributions/PledgesPage'
import GivingReportsPage from './pages/customApplications/churchServices/contributions/GivingReportsPage'
// Church Sacraments
import BaptismsPage from './pages/customApplications/churchServices/sacraments/BaptismsPage'
import WeddingsPage from './pages/customApplications/churchServices/sacraments/WeddingsPage'
import FuneralsPage from './pages/customApplications/churchServices/sacraments/FuneralsPage'
import DedicationsPage from './pages/customApplications/churchServices/sacraments/DedicationsPage'
// Church Communication
import EmailCampaignsPage from './pages/customApplications/churchServices/communication/EmailCampaignsPage'
import SMSNotificationsPage from './pages/customApplications/churchServices/communication/SMSNotificationsPage'
import ChurchPagesPage from './pages/customApplications/churchServices/communication/PagesPage'
// Church Administration
import ChurchStaffPage from './pages/customApplications/churchServices/administration/StaffPage'
import ChurchReportsPage from './pages/customApplications/churchServices/administration/ReportsPage'
import ChurchAnalyticsPage from './pages/customApplications/churchServices/administration/AnalyticsPage'
import ChurchSettingsPage from './pages/customApplications/churchServices/administration/SettingsPage'
import ApplicationCustomizationDashboard from './pages/applicationCustomization/ApplicationCustomizationDashboard'
import WebsiteCustomizationProjectsPage from './pages/applicationCustomization/ProjectsPage'
import CustomApplicationsPage from './pages/applicationCustomization/CustomApplicationsPage'
import ApplicationCustomizationIntakeFormsPage from './pages/applicationCustomization/IntakeFormsPage'
import CustomApplicationDetailPage from './pages/applicationCustomization/CustomApplicationDetailPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRole="customer">
                <AdminLayout>
                  <CustomerDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/chat"
            element={
              <ProtectedRoute requiredRole="customer">
                <AdminLayout>
                  <PageDetailPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/forms"
            element={
              <ProtectedRoute requiredRole="customer">
                <AdminLayout>
                  <C2MFormsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/upload"
            element={
              <ProtectedRoute requiredRole="customer">
                <AdminLayout>
                  <FileUploadPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/pages"
            element={
              <ProtectedRoute requiredRole="customer">
                <AdminLayout>
                  <PagesListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/add-page"
            element={
              <ProtectedRoute requiredRole="customer">
                <AdminLayout>
                  <CustomerAddPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/pages/:pageId"
            element={
              <ProtectedRoute requiredRole="customer">
                <AdminLayout>
                  <PageDetailPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute requiredRole="staff">
                <AdminLayout>
                  <StaffDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/chat"
            element={
              <ProtectedRoute requiredRole="staff">
                <AdminLayout>
                  <PageDetailPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/tasks"
            element={
              <ProtectedRoute requiredRole="staff">
                <AdminLayout>
                  <TasksManagementPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/customers"
            element={
              <ProtectedRoute requiredRole="staff">
                <AdminLayout>
                  <CustomersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/pages"
            element={
              <ProtectedRoute requiredRole="staff">
                <AdminLayout>
                  <PagesListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/pages/:pageId"
            element={
              <ProtectedRoute requiredRole="staff">
                <AdminLayout>
                  <PageDetailPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <TasksManagementPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/crm/leads"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <LeadsManagementPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/crm/opportunities"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <OpportunitiesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/crm/accounts"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AccountsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/crm/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <CRMAnalyticsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/crm/activity"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <ActivityFeedPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm/intake"
            element={
              <AdminLayout>
                <CRMIntakeFormPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/crm"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Navigate to="/admin/crm/leads" />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Custom Applications - Citizen Services Routes */}
          <Route
            path="/custom-applications/citizen-services-1"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <CitizenServicesDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/intake-form-builder"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <IntakeFormBuilderPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/intake-forms"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <SubmissionsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/intake-forms/new"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <IntakeFormPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/intake-forms/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <IntakeFormPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/intake-forms/:id/submit"
            element={
              <AdminLayout>
                <IntakeFormPage />
              </AdminLayout>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AnalyticsDashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* Case Management Routes */}
          <Route
            path="/custom-applications/citizen-services-1/case-management/create"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <CreateCasePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/case-management/active"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <ActiveCasesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/case-management/closed"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <ClosedCasesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/case-management/assign"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AssignCaseWorkerPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/case-management/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <CaseReportsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* Housing Assistance Routes */}
          <Route
            path="/custom-applications/citizen-services-1/housing/applications"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <HousingApplicationsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/housing/eligibility"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <EligibilityReviewPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/housing/approvals"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <HousingApprovalsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/housing/waitlist"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <WaitlistPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/housing/inventory"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <HousingInventoryPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* Workforce Development Routes */}
          <Route
            path="/custom-applications/citizen-services-1/workforce/job-applications"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <JobApplicationsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/workforce/training"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <TrainingProgramsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/workforce/employers"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <EmployersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-applications/citizen-services-1/workforce/placement"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <PlacementTrackingPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
            <Route
              path="/custom-applications/citizen-services-1/pages"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <StaticPagesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/citizen-services-1/projects"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <CitizenServicesProjectsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/citizen-services-1/employees"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <CitizenServicesEmployeesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Custom Applications - Fleet Management Routes */}
            <Route
              path="/custom-applications/fleet-management-1"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <FleetManagementDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Fleet Operations Routes */}
            <Route
              path="/custom-applications/fleet-management-1/operations/vehicles"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <VehiclesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/operations/drivers"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <DriversPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/operations/trip-management"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <TripManagementPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/operations/route-planning"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <RoutePlanningPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/operations/dispatch"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <DispatchPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Fleet Maintenance Routes */}
            <Route
              path="/custom-applications/fleet-management-1/maintenance/service-schedule"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ServiceSchedulePage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/maintenance/work-orders"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <WorkOrdersPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/maintenance/repairs-history"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <RepairsHistoryPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/maintenance/parts-inventory"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <PartsInventoryPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Fleet Compliance Routes */}
            <Route
              path="/custom-applications/fleet-management-1/compliance/inspections"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <InspectionsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/compliance/insurance"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <InsurancePage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/compliance/registrations"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <RegistrationsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/compliance/incident-reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <IncidentReportsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Fleet Monitoring Routes */}
            <Route
              path="/custom-applications/fleet-management-1/monitoring/gps-tracking"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <GPSTrackingPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/monitoring/fuel-logs"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <FuelLogsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/monitoring/mileage-logs"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <MileageLogsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Fleet Administration Routes */}
            <Route
              path="/custom-applications/fleet-management-1/administration/reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <FleetReportsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/administration/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <FleetAnalyticsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/administration/staff"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <FleetStaffPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/fleet-management-1/administration/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <FleetSettingsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Custom Applications - Church Services Routes */}
            <Route
              path="/custom-applications/church-services-1"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchServicesDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Church Ministry Management Routes */}
            <Route
              path="/custom-applications/church-services-1/ministry-management/members"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchMembersPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/ministry-management/visitors"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <VisitorsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/ministry-management/volunteers"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchVolunteersPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/ministry-management/groups"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchGroupsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Church Services & Events Routes */}
            <Route
              path="/custom-applications/church-services-1/services-events/service-schedule"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchServiceSchedulePage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/services-events/events"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchEventsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/services-events/sermons"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <SermonsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/services-events/announcements"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AnnouncementsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Church Contributions Routes */}
            <Route
              path="/custom-applications/church-services-1/contributions/donations"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <DonationsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/contributions/tithes"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <TithesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/contributions/pledges"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <PledgesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/contributions/giving-reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <GivingReportsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Church Sacraments Routes */}
            <Route
              path="/custom-applications/church-services-1/sacraments/baptisms"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <BaptismsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/sacraments/weddings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <WeddingsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/sacraments/funerals"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <FuneralsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/sacraments/dedications"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <DedicationsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Church Communication Routes */}
            <Route
              path="/custom-applications/church-services-1/communication/email-campaigns"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <EmailCampaignsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/communication/sms-notifications"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <SMSNotificationsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/communication/pages"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchPagesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* Church Administration Routes */}
            <Route
              path="/custom-applications/church-services-1/administration/staff"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchStaffPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/administration/reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchReportsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/administration/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchAnalyticsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-applications/church-services-1/administration/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ChurchSettingsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

          {/* Website Customization Routes */}
          <Route
            path="/website-customization"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <ApplicationCustomizationDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/website-customization/applications"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <CustomApplicationsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/website-customization/applications/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <CustomApplicationDetailPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/website-customization/projects"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <WebsiteCustomizationProjectsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/website-customization/intake-forms"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <ApplicationCustomizationIntakeFormsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Existing Admin Routes (Protected) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Navigate to="/events" />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/communication/pages"
            element={
              <ProtectedRoute requiredRole={['admin', 'staff']}>
                <AdminLayout>
                  <PagesListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication/pages/demo"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PageDetailPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication/pages/new"
            element={
              <ProtectedRoute requiredRole={['admin', 'staff']}>
                <AdminLayout>
                  <PageCreatePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication/pages/update"
            element={
              <ProtectedRoute requiredRole={['admin', 'staff']}>
                <AdminLayout>
                  <UpdatePagePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication/pages/sync"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <SyncPagePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication/pages/connect"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ConnectPagePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication/pages/disconnect"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DisconnectPagePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication/bulk-users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <BulkUsersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invite/accept"
            element={<InvitationAcceptPage />}
          />

          {/* Events Section */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <EventsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/page-editor"
            element={
              <ProtectedRoute requiredRole={['admin', 'staff']}>
                <AdminLayout>
                  <PageEditorPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* People Section */}
          <Route
            path="/people/create-user"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <CreateUserPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people/search-user"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <SearchUserPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people/user-editor"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <UserEditorPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people/roles"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <RolesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people/customers"
            element={
              <ProtectedRoute requiredRole={['admin', 'staff']}>
                <AdminLayout>
                  <CustomersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people/groups"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <GroupsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people/org-chart"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <OrgChartPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people/client"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ClientPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Projects Section */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ProjectsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/calendar"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <CalendarPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/survey"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <SurveyPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Settings Section */}
          <Route
            path="/settings/account"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AccountSettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ProfileSettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/general"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <GeneralSettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/required"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <RequiredSettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AnalyticsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
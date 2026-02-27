export type NavItem = {
  label: string
  path?: string
  icon?: string
  children?: NavItem[]
}

// Customer sidebar menu
export const getCustomerSidebarData = (): NavItem[] => [
  { label: 'Dashboard', path: '/customer/dashboard' },
  {
    label: 'Customer',
    children: [
      { label: 'My Pages', path: '/customer/pages' },
      { label: 'Add Page', path: '/customer/add-page' },
      { label: 'Start Chat', path: '/customer/chat' },
      { label: 'Submit Form', path: '/customer/forms' },
      { label: 'Upload Files', path: '/customer/upload' },
    ],
  },
  {
    label: 'Settings',
    children: [
      { label: 'Account', path: '/settings/account' },
      { label: 'Profile', path: '/settings/profile' },
    ],
  },
]

// Staff sidebar menu
export const getStaffSidebarData = (): NavItem[] => [
  { label: 'Dashboard', path: '/staff/dashboard' },
  {
    label: 'Staff',
    children: [
      { label: 'My Pages', path: '/staff/pages' },
      { label: 'Customer Chats', path: '/staff/chat' },
      { label: 'My Tasks', path: '/staff/tasks' },
      { label: 'Assigned Customers', path: '/staff/customers' },
    ],
  },
  {
    label: 'Settings',
    children: [
      { label: 'Account', path: '/settings/account' },
      { label: 'Profile', path: '/settings/profile' },
    ],
  },
]

// Admin sidebar menu (default)
export const sidebarData: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  {
    label: 'Communication',
    children: [
      { label: 'Pages', path: '/communication/pages' },
      { label: 'Create Page', path: '/communication/pages/new' },
      { label: 'Update Page', path: '/communication/pages/update' },
      { label: 'Sync Page', path: '/communication/pages/sync' },
      { label: 'Connect Page', path: '/communication/pages/connect' },
      { label: 'Disconnect Page', path: '/communication/pages/disconnect' },
      { label: 'Bulk Users', path: '/communication/bulk-users' },
    ],
  },

  {
    label: 'Events',
    children: [
      { label: 'Events', path: '/events' },
      { label: 'Page Editor', path: '/events/page-editor' },
    ],
  },

  {
    label: 'People',
    children: [
      { label: 'Create User', path: '/people/create-user' },
      { label: 'Search User', path: '/people/search-user' },
      { label: 'User Editor', path: '/people/user-editor' },
      { label: 'Roles', path: '/people/roles' },
      { label: 'Customer', path: '/people/customers' },
      { label: 'Groups', path: '/people/groups' },
      { label: 'Org Chart', path: '/people/org-chart' },
      { label: 'Client', path: '/people/client' },
    ],
  },

  {
    label: 'Management',
    children: [
      { label: 'Tasks', path: '/admin/tasks' },
      { label: 'Intake Form', path: '/crm/intake' },
      { label: 'Leads', path: '/admin/crm/leads' },
      { label: 'Opportunities', path: '/admin/crm/opportunities' },
      { label: 'Accounts', path: '/admin/crm/accounts' },
      { label: 'Analytics', path: '/admin/crm/analytics' },
      { label: 'Activity Feed', path: '/admin/crm/activity' },
    ],
  },

  {
    label: 'Custom Applications',
    children: [
        {
          label: 'Citizen Services',
        children: [
          { label: 'Dashboard', path: '/custom-applications/citizen-services-1' },
          {
            label: 'Case Management',
            children: [
              { label: 'Create Case', path: '/custom-applications/citizen-services-1/case-management/create' },
              { label: 'Active Cases', path: '/custom-applications/citizen-services-1/case-management/active' },
              { label: 'Closed Cases', path: '/custom-applications/citizen-services-1/case-management/closed' },
              { label: 'Assign Case Worker', path: '/custom-applications/citizen-services-1/case-management/assign' },
              { label: 'Case Reports', path: '/custom-applications/citizen-services-1/case-management/reports' },
            ],
          },
          {
            label: 'Housing Assistance',
            children: [
              { label: 'Applications', path: '/custom-applications/citizen-services-1/housing-assistance/applications' },
              { label: 'Eligibility Review', path: '/custom-applications/citizen-services-1/housing-assistance/eligibility-review' },
              { label: 'Approvals', path: '/custom-applications/citizen-services-1/housing-assistance/approvals' },
              { label: 'Waitlist', path: '/custom-applications/citizen-services-1/housing-assistance/waitlist' },
              { label: 'Housing Inventory', path: '/custom-applications/citizen-services-1/housing-assistance/inventory' },
            ],
          },
          {
            label: 'Workforce Development',
            children: [
              { label: 'Job Applications', path: '/custom-applications/citizen-services-1/workforce-development/job-applications' },
              { label: 'Training Programs', path: '/custom-applications/citizen-services-1/workforce-development/training-programs' },
              { label: 'Employers', path: '/custom-applications/citizen-services-1/workforce-development/employers' },
              { label: 'Placement Tracking', path: '/custom-applications/citizen-services-1/workforce-development/placement-tracking' },
            ],
          },
          { label: 'Intake Forms', path: '/custom-applications/citizen-services-1/intake-forms/new' },
          { label: 'View Submissions', path: '/custom-applications/citizen-services-1/intake-forms' },
          { label: 'Pages', path: '/custom-applications/citizen-services-1/pages' },
          { label: 'Projects', path: '/custom-applications/citizen-services-1/projects' },
          { label: 'Employees', path: '/custom-applications/citizen-services-1/employees' },
          { label: 'Analytics', path: '/custom-applications/citizen-services-1/analytics' },
        ],
      },
      {
        label: 'Fleet Management',
        children: [
          { label: 'Dashboard', path: '/custom-applications/fleet-management-1' },
          {
            label: 'Operations',
            children: [
              { label: 'Vehicles', path: '/custom-applications/fleet-management-1/operations/vehicles' },
              { label: 'Drivers', path: '/custom-applications/fleet-management-1/operations/drivers' },
              { label: 'Trip Management', path: '/custom-applications/fleet-management-1/operations/trip-management' },
              { label: 'Route Planning', path: '/custom-applications/fleet-management-1/operations/route-planning' },
              { label: 'Dispatch', path: '/custom-applications/fleet-management-1/operations/dispatch' },
            ],
          },
          {
            label: 'Maintenance',
            children: [
              { label: 'Service Schedule', path: '/custom-applications/fleet-management-1/maintenance/service-schedule' },
              { label: 'Work Orders', path: '/custom-applications/fleet-management-1/maintenance/work-orders' },
              { label: 'Repairs History', path: '/custom-applications/fleet-management-1/maintenance/repairs-history' },
              { label: 'Parts Inventory', path: '/custom-applications/fleet-management-1/maintenance/parts-inventory' },
            ],
          },
          {
            label: 'Compliance',
            children: [
              { label: 'Inspections', path: '/custom-applications/fleet-management-1/compliance/inspections' },
              { label: 'Insurance', path: '/custom-applications/fleet-management-1/compliance/insurance' },
              { label: 'Registrations', path: '/custom-applications/fleet-management-1/compliance/registrations' },
              { label: 'Incident Reports', path: '/custom-applications/fleet-management-1/compliance/incident-reports' },
            ],
          },
          {
            label: 'Monitoring',
            children: [
              { label: 'GPS Tracking', path: '/custom-applications/fleet-management-1/monitoring/gps-tracking' },
              { label: 'Fuel Logs', path: '/custom-applications/fleet-management-1/monitoring/fuel-logs' },
              { label: 'Mileage Logs', path: '/custom-applications/fleet-management-1/monitoring/mileage-logs' },
            ],
          },
          {
            label: 'Administration',
            children: [
              { label: 'Reports', path: '/custom-applications/fleet-management-1/administration/reports' },
              { label: 'Analytics', path: '/custom-applications/fleet-management-1/administration/analytics' },
              { label: 'Staff', path: '/custom-applications/fleet-management-1/administration/staff' },
              { label: 'Settings', path: '/custom-applications/fleet-management-1/administration/settings' },
            ],
          },
        ],
      },
      {
        label: 'Church Services',
        children: [
          { label: 'Dashboard', path: '/custom-applications/church-services-1' },
          {
            label: 'Ministry Management',
            children: [
              { label: 'Members', path: '/custom-applications/church-services-1/ministry-management/members' },
              { label: 'Visitors', path: '/custom-applications/church-services-1/ministry-management/visitors' },
              { label: 'Volunteers', path: '/custom-applications/church-services-1/ministry-management/volunteers' },
              { label: 'Groups / Ministries', path: '/custom-applications/church-services-1/ministry-management/groups' },
            ],
          },
          {
            label: 'Services & Events',
            children: [
              { label: 'Service Schedule', path: '/custom-applications/church-services-1/services-events/service-schedule' },
              { label: 'Events', path: '/custom-applications/church-services-1/services-events/events' },
              { label: 'Sermons', path: '/custom-applications/church-services-1/services-events/sermons' },
              { label: 'Announcements', path: '/custom-applications/church-services-1/services-events/announcements' },
            ],
          },
          {
            label: 'Contributions',
            children: [
              { label: 'Donations', path: '/custom-applications/church-services-1/contributions/donations' },
              { label: 'Tithes', path: '/custom-applications/church-services-1/contributions/tithes' },
              { label: 'Pledges', path: '/custom-applications/church-services-1/contributions/pledges' },
              { label: 'Giving Reports', path: '/custom-applications/church-services-1/contributions/giving-reports' },
            ],
          },
          {
            label: 'Sacraments',
            children: [
              { label: 'Baptisms', path: '/custom-applications/church-services-1/sacraments/baptisms' },
              { label: 'Weddings', path: '/custom-applications/church-services-1/sacraments/weddings' },
              { label: 'Funerals', path: '/custom-applications/church-services-1/sacraments/funerals' },
              { label: 'Dedications', path: '/custom-applications/church-services-1/sacraments/dedications' },
            ],
          },
          {
            label: 'Communication',
            children: [
              { label: 'Email Campaigns', path: '/custom-applications/church-services-1/communication/email-campaigns' },
              { label: 'SMS Notifications', path: '/custom-applications/church-services-1/communication/sms-notifications' },
              { label: 'Pages', path: '/custom-applications/church-services-1/communication/pages' },
            ],
          },
          {
            label: 'Administration',
            children: [
              { label: 'Staff', path: '/custom-applications/church-services-1/administration/staff' },
              { label: 'Reports', path: '/custom-applications/church-services-1/administration/reports' },
              { label: 'Analytics', path: '/custom-applications/church-services-1/administration/analytics' },
              { label: 'Settings', path: '/custom-applications/church-services-1/administration/settings' },
            ],
          },
        ],
      },
      { label: 'Manage Applications', path: '/website-customization/applications' },
    ],
  },

  {
    label: 'Settings',
    children: [
      { label: 'Account', path: '/settings/account' },
      { label: 'Profile', path: '/settings/profile' },
      { label: 'General Settings', path: '/settings/general' },
      { label: 'Required Settings', path: '/settings/required' },
    ],
  },

  { label: 'Analytics', path: '/analytics' },

]
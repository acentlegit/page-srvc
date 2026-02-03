export type NavItem = {
  label: string
  path?: string
  icon?: string
  children?: NavItem[]
}

export const sidebarData: NavItem[] = [
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
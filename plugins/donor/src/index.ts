import type { HlbPlugin } from '@hlb/sdk'

export const DonorPlugin: HlbPlugin = {
  id: 'donor',
  label: 'Donor Management',
  description: 'Manage blood donors, pledges, and verifications',
  icon: 'Users',
  group: 'donor',
  navItems: [
    {
      label: 'Donors List',
      href: '/donors',
      icon: 'Users',
      children: [
        { label: 'Active Donors',  href: '/donors',         icon: 'Users' },
        { label: 'Blocked Donors', href: '/donors/blocked', icon: 'Ban'   },
      ],
    },
    {
      label: 'Unverified Donors',
      href: '/donors/unverified',
      icon: 'PlusCircle',
    },
  ],
}

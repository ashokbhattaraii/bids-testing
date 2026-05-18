import type { HlbPlugin } from '@hlb/sdk'

export const BidsPlugin: HlbPlugin = {
  id: 'bids',
  label: 'BIDS Management',
  description: 'Hospitals, blood requests, reports, and patient feedback',
  icon: 'Building2',
  group: 'bids',
  navItems: [
    { label: 'Request',               href: '/requests',  icon: 'FileText'                },
    { label: 'Hospitals',             href: '/hospitals', icon: 'Building2'               },
    { label: 'Reports',               href: '/reports',   icon: 'BarChart3'               },
    { label: 'Patient Feedback List', href: '/feedback',  icon: 'MessageSquare'           },
  ],
}

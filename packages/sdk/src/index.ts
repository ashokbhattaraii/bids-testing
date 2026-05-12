export interface NavItem {
  label: string
  href: string
  icon?: string
  badge?: number
  children?: {
    label: string
    href: string
    icon?: string
  }[]
}

export interface HlbPlugin {
  id: string
  label: string
  description?: string
  icon?: string
  group: string
  navItems: NavItem[]
}

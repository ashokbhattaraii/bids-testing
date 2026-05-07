'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Building2,
  Settings,
  BarChart3,
  Menu,
  Droplet,
  Bell,
  Search,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Heart,
  PlusCircle,
  Ban,
  Globe,
  Briefcase,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  adminOnly?: boolean;
  children?: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Request', href: '/requests', icon: FileText, badge: 5 },
  { 
    name: 'Donors List', 
    icon: Users,
    children: [
      { name: 'Active Donors', href: '/donors', icon: Users },
      { name: 'Blocked Donors', href: '/donors/blocked', icon: Ban },
    ]
  },
  { 
    name: 'Unverified Donors', 
    icon: PlusCircle,
    children: [
      { name: 'Unverified Donors List', href: '/donors/unverified', icon: Users },
      { name: 'Pledges From Hotline', href: '/donors/pledges', icon: Globe },
    ]
  },
  { name: 'Patient Feedback List', href: '/feedback', icon: MessageSquare },
  { 
    name: 'Administration', 
    icon: Briefcase,
    adminOnly: true,
    children: [
      { name: 'Users', href: '/admin', icon: User },
      { name: 'Roles', href: '/admin/roles', icon: UserCog },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]
  },
  { name: 'Hospitals', href: '/hospitals', icon: Building2 },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const notifications = [
  {
    id: '1',
    title: 'Critical Request: O- Blood',
    description: 'Bir Hospital needs 2 units urgently',
    time: '2 mins ago',
    type: 'critical',
  },
  {
    id: '2',
    title: 'New Donor Registered',
    description: 'Prakash Sharma - O+ Blood Type',
    time: '15 mins ago',
    type: 'info',
  },
  {
    id: '3',
    title: 'Request Fulfilled',
    description: 'REQ-004 completed successfully',
    time: '1 hour ago',
    type: 'success',
  },
];

const getRoleBadgeStyle = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'volunteer':
      return 'bg-accent text-accent-foreground border-accent';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return Shield;
    case 'volunteer':
      return Heart;
    default:
      return User;
  }
};

function NavItemComponent({ 
  item, 
  pathname, 
  onItemClick,
  expandedItems,
  toggleExpanded 
}: { 
  item: NavItem; 
  pathname: string;
  onItemClick?: () => void;
  expandedItems: string[];
  toggleExpanded: (name: string) => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.includes(item.name);
  const isActive = item.href ? pathname === item.href : item.children?.some(child => pathname === child.href);

  if (hasChildren) {
    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.name)}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'text-sidebar-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              {item.name}
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 mt-1 space-y-1">
          {item.children?.map((child) => {
            const isChildActive = pathname === child.href;
            return (
              <Link
                key={child.name}
                href={child.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  isChildActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                onClick={onItemClick}
              >
                <child.icon className="h-4 w-4" />
                {child.name}
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const isLinkActive = pathname === item.href;
  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isLinkActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/30'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
      onClick={onItemClick}
    >
      <item.icon className="h-5 w-5" />
      {item.name}
      {item.badge && (
        <Badge 
          variant="secondary" 
          className={cn(
            "ml-auto text-xs",
            isLinkActive 
              ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground" 
              : "bg-sidebar-primary text-sidebar-primary-foreground"
          )}
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Donors List', 'Unverified Donors', 'Administration']);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  const RoleIcon = user ? getRoleIcon(user.role) : User;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-primary shadow-lg">
                <Droplet className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sidebar-foreground/70 text-sm">Hamro</span>
                <span className="font-bold text-sidebar-primary text-lg">Lifebank</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
              {filteredNavigation.map((item) => (
                <NavItemComponent
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  onItemClick={() => setSidebarOpen(false)}
                  expandedItems={expandedItems}
                  toggleExpanded={toggleExpanded}
                />
              ))}
            </nav>

            {/* User section */}
            <div className="border-t border-sidebar-border p-4">
              <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-3">
                <Avatar className="h-10 w-10 border-2 border-sidebar-primary">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 lg:flex flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-primary shadow-lg shadow-sidebar-primary/30">
            <Droplet className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sidebar-foreground/70 text-sm">Hamro</span>
            <span className="font-bold text-sidebar-primary text-lg">Lifebank</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {filteredNavigation.map((item) => (
            <NavItemComponent
              key={item.name}
              item={item}
              pathname={pathname}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </nav>

      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card shadow-sm px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="relative hidden sm:block flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests, donors..."
              className="pl-10 h-9 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side: Notifications + User Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-muted">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg">
                    {notifications.length}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-semibold text-foreground">Notifications</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {notifications.length} new
                  </Badge>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start gap-1 p-4 cursor-pointer border-b border-border last:border-0"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div
                          className={cn(
                            'mt-1 h-2 w-2 rounded-full flex-shrink-0',
                            notification.type === 'critical' && 'bg-primary',
                            notification.type === 'info' && 'bg-secondary',
                            notification.type === 'success' && 'bg-green-500'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm text-foreground block">
                            {notification.title}
                          </span>
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            {notification.description}
                          </span>
                          <span className="text-xs text-muted-foreground/70 block mt-1">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="p-2 border-t border-border">
                  <Button variant="ghost" className="w-full text-sm text-primary hover:bg-primary/10">
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu / My Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {user?.role?.replace('_', ' ') || 'User'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

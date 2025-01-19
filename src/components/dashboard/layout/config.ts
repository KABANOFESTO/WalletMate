import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
   { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'transactions', title: 'Transaction', href: paths.dashboard.transaction, icon: 'money' },
  { key: 'accounts', title: 'Account', href: paths.dashboard.account, icon: 'bank' },
  { key: 'reports', title: 'Reports', href: paths.dashboard.report, icon: 'file-chart' },
  { key: 'budget', title: 'Budget', href: paths.dashboard.budget, icon: 'wallet' },
  { key: 'categories', title: 'Categories', href: paths.dashboard.categories, icon: 'list-ul' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear' }
] satisfies NavItemConfig[];

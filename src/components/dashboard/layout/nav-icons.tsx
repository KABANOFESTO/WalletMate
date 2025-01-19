import type { LucideIcon } from 'lucide-react';
import { 
  PieChart,
  Settings,
  Network,
  XSquare,
  User,
  Users,
  DollarSign,
  Building2,
  FileBarChart2,
  Wallet,
  ListTodo
} from 'lucide-react';

export const navIcons = {
  'chart-pie': PieChart,
  'money': DollarSign,
  'bank': Building2,
  'file-chart': FileBarChart2,
  'wallet': Wallet,
  'list-ul': ListTodo,
  'gear': Settings,
  'plugs-connected': Network,
  'x-square': XSquare,
  'user': User,
  'users': Users
} as Record<string, LucideIcon>;
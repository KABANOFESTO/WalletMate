import { Login } from "@mui/icons-material";

export const paths = {
  home: '/',
  auth: { 
    login: '/auth/sign-in', 
    signUp: '/auth/sign-up', 
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password'
  },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/accountDetail',
    transaction: '/dashboard/transaction',
    report: '/dashboard/report',
    budget: '/dashboard/budget',
    categories: '/dashboard/categories',
    settings: '/dashboard/settings',
    Login:'/components/auth/sign-in-form.tsx'
  },
  errors: { notFound: '/errors/not-found' },
} as const;

import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';

export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
  logLevel: keyof typeof LogLevel;
  apiUrl: string;
}

export const config: Config = {
  site: { name: 'Wallet Mate', description: '', themeColor: '#090a0b', url: getSiteURL() },
  logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) ?? LogLevel.ALL,
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
};

import axios from 'axios';
import { config } from '@/config';

class PasswordService {
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await axios.post(`${config.apiUrl}/auth/forgot-password`, { email });
    } catch (error) {
      throw new Error('Failed to request password reset');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${config.apiUrl}/auth/reset-password`, {
        token,
        newPassword,
      });
    } catch (error) {
      throw new Error('Failed to reset password');
    }
  }
}

export const passwordService = new PasswordService();

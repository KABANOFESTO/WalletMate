import { config } from '@/config';
import axios from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUser(): Promise<User | null> {
  try {
    const response = await axios.get<{ user: User }>('/api/auth/me');
    return response.data.user;
  } catch (error) {
    return null;
  }
}

export async function login(credentials: LoginCredentials): Promise<{ user: User | null; error?: string }> {
  try {
    const response = await axios.post<{ user: User; token: string }>('/api/auth/login', credentials);
    const { user, token } = response.data;
    
    if (!user) {
      return { user: null, error: 'Invalid credentials' };
    }

    localStorage.setItem('custom-auth-token', token);
    const transformedUser: User = {
      id: String(user.id),
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'USER',
      profilePicture: user.profilePicture,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString()
    };
    localStorage.setItem('user', JSON.stringify(transformedUser));
    return { user: transformedUser };
  } catch (error) {
    return { user: null, error: 'Login failed' };
  }
}

export async function register(credentials: RegisterCredentials): Promise<any> {
  try {
    const response = await axios.post<{ user: User; token: string }>('/api/auth/register', credentials);
    const { user, token } = response.data;
    
    if (!user) {
      throw new Error('Registration failed');
    }

    localStorage.setItem('custom-auth-token', token);
    const transformedUser: User = {
      id: String(user.id),
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'USER',
      profilePicture: user.profilePicture,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString()
    };
    localStorage.setItem('user', JSON.stringify(transformedUser));
    return { user: transformedUser };
  } catch (error) {
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user');
  } catch (error) {
    throw error;
  }
}

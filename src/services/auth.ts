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
    const response = await axios.get<{ user: User }>(`${config.apiUrl}/api/auth/me`);
    return response.data.user;
  } catch (error) {
    return null;
  }
}

export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    const response = await axios.post(`${config.apiUrl}/api/auth/login`, credentials);
    const { id, name, email, role, token } = response.data;

    if (!id || !token) {
      throw new Error('Invalid response from server');
    }

    localStorage.setItem('custom-auth-token', token);
    
    const transformedUser: User = {
      id: String(id),
      name: name || '',
      email: email || '',
      role: role || 'USER',
      profilePicture: '', 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    };
    
    localStorage.setItem('user', JSON.stringify(transformedUser));
    return transformedUser;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Authentication failed. Please check your credentials and try again.');
  }
}

export async function register(credentials: RegisterCredentials): Promise<any> {
  try {
    const response = await axios.post<{ user: User; token: string }>(`${config.apiUrl}/api/auth/register`, credentials);
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
    await axios.post(`${config.apiUrl}/api/auth/logout`);
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user');
  } catch (error) {
    throw error;
  }
}

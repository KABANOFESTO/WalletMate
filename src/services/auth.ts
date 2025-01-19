import { config } from '@/config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export async function login(credentials: LoginCredentials) {
  console.log('Attempting login with:', { 
    email: credentials.email,
    passwordLength: credentials.password?.length || 0,
    url: `${config.apiUrl}/api/auth/login` 
  });
  
  try {
    const response = await fetch(`${config.apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const responseText = await response.text();
    console.log('Raw server response:', responseText);

    if (!response.ok) {
      console.error('Login failed:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      throw new Error(responseText || 'Login failed');
    }

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : null;
      console.log('Parsed response data:', data);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid response format from server');
    }

    // Check the exact structure of the response
    console.log('Response structure:', {
      hasData: !!data,
      hasUser: data && !!data.user,
      userFields: data?.user ? Object.keys(data.user) : [],
      fullData: data
    });
    
    if (!data) {
      throw new Error('Empty response from server');
    }

    // Handle both possible response formats
    const userData = data.user || data;
    
    if (!userData || typeof userData.id === 'undefined') {
      console.error('Invalid user data structure:', userData);
      throw new Error('Invalid user data received from server');
    }

    // Transform the user data to match our User type
    const user = {
      id: String(userData.id),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'USER',
      profilePicture: userData.profilePicture,
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString()
    };

    console.log('Transformed user data:', user);

    // Store auth data in localStorage
    if (data.token) {
      localStorage.setItem('custom-auth-token', data.token);
    }
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function register(credentials: RegisterCredentials) {
  try {
    const response = await fetch(`${config.apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('Registration failed:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      throw new Error(responseText || 'Registration failed');
    }

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid response format from server');
    }

    console.log('Registration response data:', data);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function logout() {
  try {
    const response = await fetch(`${config.apiUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('Logout failed:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      throw new Error(responseText || 'Logout failed');
    }

    // Clear localStorage even if the API call fails
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user');

    console.log('Logout response data:', responseText);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

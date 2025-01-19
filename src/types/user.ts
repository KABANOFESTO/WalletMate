export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

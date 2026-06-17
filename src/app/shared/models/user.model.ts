export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'worker' | 'supplier' | 'admin';
  phone?: string;
  createdAt: string;
}

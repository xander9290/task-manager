export interface ActionResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Partner {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  slug: string;
  password: string;
  imageUrl: string | null;
  Partner: Partner | null; // <- cambio aquí
  partnerId: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

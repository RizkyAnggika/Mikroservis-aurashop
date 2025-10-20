export interface Tea {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'black' | 'green' | 'herbal' | 'oolong' | 'white';
  stock: number;
  isAvailable: boolean;
}

export interface CartItem {
  tea: Tea;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  customerName: string;
  orderDate: Date;
  notes?: string;

  clientId?: string;       
  source?: 'shop' | 'pos'; 
}



export interface User {
  id: string;
  username: string;
  role: 'admin' | 'kasir' | 'staf';
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type TeaCategory = Tea['category'];
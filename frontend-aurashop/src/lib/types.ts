// ✅ src/lib/types.ts
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
  // frontend-typed
  tea?: Tea;
  // backend variants
  productId?: string | number;
  nama_produk?: string;
  harga?: number;
  // qty variants
  quantity: number;
  qty?: number;
  // (opsional) subtotal dari backend
  subtotal?: number;
}

export type OrderStatus = 'pending' | 'paid';

// Biarkan fleksibel—karena backend kamu punya beberapa alias nama field
export interface Order {
  id: string | number;

  // customer name variants
  customer_name?: string;
  customerName?: string;

  items: CartItem[];

  // total variants
  totalPrice?: number;
  total?: number;

  // notes variants
  notes?: string | null;
  note?: string | null;

  // status variants
  order_status?: OrderStatus;
  status?: OrderStatus;

  // extra fee variants
  extra?: number;
  additionalFee?: number;

  // misc
  userId?: string | number;
  clientId?: string | number;
  source?: 'shop' | 'pos';
  createdAt?: string;
  created_at?: string;
  orderDate?: string | Date;
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

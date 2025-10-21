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
  tea?: Tea;
  productId?: string;
  nama_produk?: string;
  harga?: number;
  quantity: number;
  qty?: number;
}


export interface Order {
  id: string;
  userId?: string;
  customer_name: string;
  customerName?: string; // alias frontend
  items: CartItem[];
  totalPrice: number;
  total?: number; // ✅ alias untuk total
  note?: string | null;
  order_status: string;
  status?: string; // ✅ alias frontend
  clientId?: string; // ✅ tambahkan ini
  source?: "shop" | "pos";
  createdAt?: string;
  orderDate?: Date | string; // ✅ untuk tampilan frontend
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
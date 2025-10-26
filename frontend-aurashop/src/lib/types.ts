export interface Tea {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "black" | "green" | "herbal" | "oolong" | "white";
  stock: number;
  isAvailable: boolean;
}

export interface CartItem {
  tea?: Tea;
  productId?: string | number;
  nama_produk?: string;
  harga?: number;
  quantity: number;
  qty?: number;
  subtotal?: number;
}

export type OrderStatus = "pending" | "paid";

export interface Order {
  id: string | number;
  customer_name?: string;
  customerName?: string;
  items: CartItem[];
  totalPrice?: number;
  total?: number;
  notes?: string | null;
  note?: string | null;
  order_status?: OrderStatus;
  status?: OrderStatus;
  extra?: number;
  additionalFee?: number;
  userId?: string | number;
  clientId?: string | number;
  source?: "shop" | "pos";
  createdAt?: string;
  created_at?: string;
  orderDate?: string | Date;
  
  updatedAt?: string;
  updated_at?: string;
  paidAt?: string;
  paid_at?: string;
  payment_time?: string;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "kasir" | "staf";
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type TeaCategory = Tea["category"];

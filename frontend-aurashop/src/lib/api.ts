// 📁 src/lib/api.ts
import axios from "axios";
import { Tea, Order, CartItem } from "@/lib/types";

// ✅ Sesuaikan endpoint dengan backend kamu
const API_URL = "http://localhost:4001/api/inventory";
const ORDER_API = "http://localhost:5001/api/orders";

// ========================== //
// 🟢 TIPE BACKEND
// ========================== //
interface BackendTea {
  id: number;
  nama_produk: string;
  kategori: string;
  harga: number;
  stok: number;
  deskripsi: string;
  gambar: string;
}

interface BackendOrderItem {
  productId: string | number;
  nama_produk: string;
  harga: number;
  quantity: number;
}

interface BackendOrder {
  id: string | number;
  customer_name: string;
  items: BackendOrderItem[];
  totalPrice: number;
  order_status: string;
  note?: string | null;
  createdAt?: string;
}

export const api = {
  // ========================== //
  // 🟢 PRODUK (INVENTORY)
  // ========================== //
  async getTeas(): Promise<Tea[]> {
    const res = await axios.get<BackendTea[]>(API_URL);

    return res.data.map((item) => ({
      id: String(item.id), // 🔄 ubah number → string sesuai interface Tea
      name: item.nama_produk,
      description: item.deskripsi,
      price: item.harga,
      image: item.gambar,
      category: item.kategori as Tea["category"], // ✅ cast ke union type
      stock: item.stok,
      isAvailable: item.stok > 0,
    }));
  },

  async addTea(tea: Omit<Tea, "id">): Promise<Tea> {
    const res = await axios.post(API_URL, {
      nama_produk: tea.name,
      deskripsi: tea.description,
      harga: tea.price,
      gambar: tea.image,
      kategori: tea.category,
      stok: tea.stock,
    });
    return { ...tea, id: res.data.id };
  },

  async updateTea(id: string, updates: Partial<Tea>): Promise<void> {
    await axios.put(`${API_URL}/${id}`, {
      nama_produk: updates.name,
      deskripsi: updates.description,
      harga: updates.price,
      gambar: updates.image,
      kategori: updates.category,
      stok: updates.stock,
    });
  },

  async deleteTea(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },

  async updateTeaStock(id: string, diff: number): Promise<void> {
    await axios.patch(`${API_URL}/${id}/reduce-stok`, { quantity: diff });
  },

  // ========================== //
  // 🟡 PESANAN (ORDER)
  // ========================== //
  async createOrder(payload: {
    items: CartItem[];
    customerName: string;
    notes?: string;
    clientId?: string;
    source?: "shop" | "pos";
    extra?: number;
  }): Promise<Order> {
    const total =
      payload.items.reduce((s, it) => s + it.tea.price * it.quantity, 0) +
      (payload.extra ?? 0);

    const orderData = {
      userId: payload.clientId || 999, // ← kasih ID dummy untuk POS
      customer_name: payload.customerName || `Walk-in`,
      items: payload.items.map((it) => ({
        productId: it.tea.id,
        qty: it.quantity,
      })),
      totalPrice: total,
      note: payload.notes || null,
      order_status: "pending",
    };

    const res = await axios.post(ORDER_API, orderData);
    return res.data;
  },

  
async getOrders(): Promise<Order[]> {
  const res = await axios.get(ORDER_API);
  const raw = res.data;

  // 🧠 Pastikan kita ambil array order yang valid
  const data: BackendOrder[] =
    Array.isArray(raw)
      ? raw
      : Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw.orders)
      ? raw.orders
      : [];

  console.log("DEBUG Orders API Response:", raw);

  // 🧩 Mapping ke tipe Order frontend
  return data.map((order) => ({
    id: String(order.id),
    customer_name: order.customer_name || "Tanpa Nama",
    items: order.items.map((it): CartItem => ({
      tea: {
        id: String(it.productId),
        name: it.nama_produk,
        description: "",
        price: it.harga,
        image: "",
        category: "green",
        stock: 0,
        isAvailable: true,
      },
      productId: String(it.productId),
      nama_produk: it.nama_produk,
      harga: it.harga,
      quantity: it.quantity,
    })),
    totalPrice: order.totalPrice,
    order_status: order.order_status,
    note: order.note || null,
    status: order.order_status,
    orderDate: order.createdAt || new Date().toISOString(),
    source: "pos",
  }));
},

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await axios.put(`${ORDER_API}/${orderId}/status`, { order_status: status });
  },
};

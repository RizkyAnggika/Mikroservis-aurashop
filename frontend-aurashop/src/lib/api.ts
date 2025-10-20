// 📁 src/lib/api.ts
import axios from "axios";
import { Tea, Order, CartItem } from "@/lib/types";

// ✅ Sesuaikan endpoint dengan backend kamu
const API_URL = "http://localhost:4001/api/inventory";
const ORDER_API = "http://localhost:5001/api/orders";

export const api = {
  // ========================== //
  // 🟢 PRODUK (INVENTORY)
  // ========================== //
  async getTeas(): Promise<Tea[]> {
    const res = await axios.get(API_URL);

    console.log("📦 Data produk dari backend:", res.data); // Debug log

    // ⚙️ Sesuaikan struktur data dari backend MySQL kamu
    return res.data.map((item: any) => ({
      id: item.id,
      name: item.nama_produk,
      description: item.deskripsi,
      price: item.harga,
      image: item.gambar,
      category: item.kategori,
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
    // ✅ backend kamu pakai PATCH /:id/reduce-stok
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
      userId: payload.clientId || null,
      customer_name: payload.customerName || `User ${payload.clientId}`,
      items: payload.items.map((it) => ({
        productId: it.tea.id,
        qty: it.quantity, // ✅ sesuai backend order kamu
      })),
      totalPrice: total,
      note: payload.notes || null,
    };

    const res = await axios.post(ORDER_API, orderData);
    return res.data;
  },

  async getOrders(): Promise<Order[]> {
    const res = await axios.get(ORDER_API);
    return res.data.data || res.data;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await axios.put(`${ORDER_API}/${orderId}/status`, { order_status: status });
  },
};

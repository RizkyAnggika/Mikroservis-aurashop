// 📁 src/lib/api.ts
import axios from "axios";
import { Tea, Order, CartItem } from "@/lib/types";

// ========================== //
// 🔗 KONFIGURASI ENDPOINT
// ========================== //
const API_URL = "http://localhost:4001/api/inventory"; // Service Inventory
const ORDER_API = "http://localhost:5001/api/orders"; // Service Order
const PAYMENT_API = "http://localhost:4002/api/orders"; // Service Payment

// ========================== //
// 🟢 TIPE DATA BACKEND
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
  notes?: string | null;
  createdAt?: string;
}

type CreateOrderResponse = {
  message?: string;
  data?: {
    id?: number | string;
    orderId?: number | string;
    [k: string]: any;
  };
  [k: string]: any;
};


// ========================== //
// 🔧 API IMPLEMENTATION
// ========================== //
export const api = {
  updateOrder,
  // -------------------------- //
  // 🟢 PRODUK (INVENTORY)
  // -------------------------- //
  async getTeas(): Promise<Tea[]> {
    const res = await axios.get<BackendTea[]>(API_URL);
    return res.data.map((item) => ({
      id: String(item.id),
      name: item.nama_produk,
      description: item.deskripsi,
      price: item.harga,
      image: item.gambar,
      category: item.kategori as Tea["category"],
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

  // -------------------------- //
  // 🟡 PESANAN (ORDER)
  // -------------------------- //
    async createOrder(payload: {
    items: CartItem[];
    customerName: string;
    notes?: string;
    clientId?: string;
    source?: "shop" | "pos";
    extra?: number;
  }): Promise<CreateOrderResponse> {          // ⬅️ ubah tipe return di sini
    const total =
      payload.items.reduce((s, it) => s + it.tea.price * it.quantity, 0) +
      (payload.extra ?? 0);

    const orderData = {
      userId: payload.clientId || 999,
      customer_name: payload.customerName || "Walk-in",
      items: payload.items.map((it) => ({
        productId: it.tea.id,
        qty: it.quantity,
      })),
      totalPrice: total,
      notes: payload.notes || null,
      order_status: "pending",
    };

    const res = await axios.post(ORDER_API, orderData);
    return res.data; // biasanya { message, data: {...} }
  },

  // helper opsional (biar rapi): ambil id dari response mana pun
  getOrderIdFromCreate(res: CreateOrderResponse | any): string | number | undefined {
    return res?.data?.orderId ?? res?.data?.id ?? res?.orderId ?? res?.id;
  },

  async getOrders(): Promise<Order[]> {
    const res = await axios.get(ORDER_API);
    const raw = res.data;

    const data: BackendOrder[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw.orders)
      ? raw.orders
      : [];

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
      notes: (order as any).notes ?? (order as any).note ?? null,
      status: order.order_status,
      orderDate: (order as any).createdAt || (order as any).created_at || new Date().toISOString(),
      source: "pos",
    }));
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await axios.put(`${ORDER_API}/${orderId}/status`, { order_status: status });
  },

  // -------------------------- //
  // 💳 PEMBAYARAN (PAYMENT)
  // -------------------------- //
  async createPayment(orderId: number | string, payload: { paymentMethod: string; amount: number }) {
    try {
      const res = await axios.post(`${PAYMENT_API}/${orderId}/pay`, payload);
      return res.data;
    } catch (err: any) {
      console.error("❌ Gagal membuat pembayaran:", err?.response?.data || err.message);
      throw err;
    }
  },

  async getPayments(orderId: number | string) {
    const res = await axios.get(`${PAYMENT_API}/${orderId}/payments`);
    return res.data;
  },
};

// ⬇️ Tambahkan di atas export const api (bersama helper lain kalau mau dibuat terpisah)
function mapItemsForBackend(items: CartItem[]) {
  return items.map((it) => ({
    productId: it.tea?.id ?? it.productId,
    qty: it.quantity ?? it.qty ?? 1,
  }));
}

async function updateOrder(
  orderId: string | number,
  payload: {
    items?: CartItem[];
    customerName?: string;
    notes?: string | null;
    extra?: number;
  }
) {
  const body: any = {
    customer_name: payload.customerName,
    notes: payload.notes ?? null,
  };

  if (payload.items) {
    body.items = mapItemsForBackend(payload.items);
    body.totalPrice =
      payload.items.reduce((acc, it) => acc + it.tea.price * it.quantity, 0) +
      (payload.extra ?? 0);
  }

  Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);

  const attempts: Array<{ method: "put" | "patch"; url: string }> = [
    { method: "put",   url: `${ORDER_API}/${orderId}` },
    { method: "patch", url: `${ORDER_API}/${orderId}` },
    { method: "put",   url: `${ORDER_API}/update/${orderId}` },
    { method: "patch", url: `${ORDER_API}/update/${orderId}` },
    { method: "patch", url: `${ORDER_API}/${orderId}/update` },
  ];

  let lastErr: any = null;
  for (const a of attempts) {
    try {
      const res =
        a.method === "put" ? await axios.put(a.url, body) : await axios.patch(a.url, body);
      return res.data;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        console.warn(`[updateOrder] ${a.method.toUpperCase()} ${a.url} → 404, coba endpoint lain…`);
        lastErr = err;
        continue; // coba kombinasi berikutnya
      }
      throw err; // error lain: hentikan
    }
  }
  throw lastErr ?? new Error("Tidak ada endpoint update order yang cocok.");
}

import axios, { AxiosError } from "axios";
import { Tea, Order, CartItem, OrderStatus } from "@/lib/types";

const API_URL = "http://localhost:4001/api/inventory";
const ORDER_API = "http://localhost:5001/api/orders";
const PAYMENT_API = "http://localhost:4002/api/orders";
// const UPLOAD_API = "http://localhost:4001/api/inventory/upload";

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

type UnknownRecord = Record<string, unknown>;
const isObject = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;

// ========================== //
// 🔹 STATUS NORMALIZER
// ========================== //
const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  // FE status yang diizinkan
  pending: "pending",
  paid: "paid",

  // alias backend → dipetakan agar valid
  processing: "pending",
  process: "pending",
  unpaid: "pending",
  waiting: "pending",
  completed: "paid",
  success: "paid",
  payed: "paid",
  payment_success: "paid",
};

function normalizeOrderStatus(
  input: unknown,
  fallback: OrderStatus = "pending"
): OrderStatus {
  if (typeof input !== "string") return fallback;
  const key = input.trim().toLowerCase();
  return ORDER_STATUS_MAP[key] ?? fallback;
}

export type CreateOrderResponse = {
  message?: string;
  data?: Record<string, unknown>;
} & Record<string, unknown>;


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
      gambar: null,
      kategori: tea.category,
      stok: tea.stock,
    });
    return { ...tea, id: String((res.data as UnknownRecord).id ?? "") };
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

  async uploadImage(productId: string | number, file: File): Promise<{ url: string }> {
    const fd = new FormData();
    fd.append("image", file); // <-- harus 'image' sesuai multer.single('image')
    await axios.post(`${API_URL}/${productId}/image`, fd); // ❗️benar: /:id/image
    return { url: `${API_URL}/${productId}/image` };
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
  }): Promise<CreateOrderResponse> {
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
    return res.data as CreateOrderResponse;
  },

  getOrderIdFromCreate(res: CreateOrderResponse | unknown): string | number | undefined {
    if (!isObject(res)) return undefined;
    const data = isObject(res.data) ? res.data : undefined;
    return (
      (data?.orderId as string | number | undefined) ??
      (data?.id as string | number | undefined) ??
      (res.orderId as string | number | undefined) ??
      (res.id as string | number | undefined)
    );
  },

  async getOrders(): Promise<Order[]> {
    const res = await axios.get(ORDER_API);
    const raw = res.data as unknown;

    let data: BackendOrder[] = [];
    if (Array.isArray(raw)) data = raw as BackendOrder[];
    else if (isObject(raw) && Array.isArray(raw.data)) data = raw.data as BackendOrder[];
    else if (isObject(raw) && Array.isArray(raw.orders)) data = raw.orders as BackendOrder[];

    return data.map((order) => {
  const status = normalizeOrderStatus(order.order_status, "pending"); // ✅ normalisasi dulu

  return {
    id: String(order.id),
    customer_name: order.customer_name || "Tanpa Nama",
    items: order.items.map(
      (it): CartItem => ({
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
      })
    ),
    totalPrice: order.totalPrice,

    // ⬇️ gunakan hasil normalisasi (OrderStatus), bukan string backend mentah
    order_status: status,
    status, // (opsional) kalau interface Order kamu juga punya properti 'status'

    notes: order.notes ?? null,
    orderDate: order.createdAt ?? new Date().toISOString(),
    source: "pos",
  } as Order; // opsional kalau TS masih rewel
});
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await axios.put(`${ORDER_API}/${orderId}/status`, { order_status: status });
  },

  // -------------------------- //
  // 💳 PEMBAYARAN (PAYMENT)
  // -------------------------- //
  async createPayment(
    orderId: number | string,
    payload: { paymentMethod: string; amount: number }
  ): Promise<unknown> {
    try {
      const res = await axios.post(`${PAYMENT_API}/${orderId}/pay`, payload);
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Gagal membuat pembayaran:", err.response?.data);
      } else {
        console.error("❌ Gagal membuat pembayaran:", err);
      }
      throw err;
    }
  },

  async getPayments(orderId: number | string): Promise<unknown> {
    const res = await axios.get(`${PAYMENT_API}/${orderId}/payments`);
    return res.data;
  },
};

// ========================== //
// 🔧 HELPER & UPDATE ORDER
// ========================== //
function mapItemsForBackend(items: CartItem[]) {
  return items.map((it) => ({
    productId: it.tea?.id ?? it.productId,
    qty: it.quantity ?? 1,
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
): Promise<unknown> {
  const body: Record<string, unknown> = {
    customer_name: payload.customerName,
    notes: payload.notes ?? null,
  };

  if (payload.items) {
    body.items = mapItemsForBackend(payload.items);
    body.totalPrice =
      payload.items.reduce((acc, it) => acc + it.tea.price * it.quantity, 0) +
      (payload.extra ?? 0);
  }

  Object.keys(body).forEach((k) => {
    if (body[k] === undefined) delete body[k];
  });

  const attempts = [
    { method: "put", url: `${ORDER_API}/${orderId}` },
    { method: "patch", url: `${ORDER_API}/${orderId}` },
    { method: "put", url: `${ORDER_API}/update/${orderId}` },
    { method: "patch", url: `${ORDER_API}/update/${orderId}` },
    { method: "patch", url: `${ORDER_API}/${orderId}/update` },
  ] as const;

  let lastErr: AxiosError | Error | undefined;

  for (const a of attempts) {
    try {
      const res =
        a.method === "put"
          ? await axios.put(a.url, body)
          : await axios.patch(a.url, body);
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) {
          console.warn(`[updateOrder] ${a.method.toUpperCase()} ${a.url} → 404, coba endpoint lain…`);
          lastErr = err;
          continue;
        }
      }
      throw err;
    }
  }

  throw lastErr ?? new Error("Tidak ada endpoint update order yang cocok.");
}

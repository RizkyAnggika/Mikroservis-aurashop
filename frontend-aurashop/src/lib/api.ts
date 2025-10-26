import axios, { AxiosError } from "axios";
import { Tea, Order, CartItem, OrderStatus, Payment } from "@/lib/types";

const API_URL = "http://192.168.1.123:4001/api/inventory";
const ORDER_API = "http://192.168.1.123:5001/api/orders";
const PAYMENT_API = "http://192.168.1.123:4002/api";

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
  updatedAt?: string;
  // backend bisa pakai snake_case:
  // created_at?: string;
  // paidAt?: string;
  // paid_at?: string;
  // payment_time?: string;
}

type UnknownRecord = Record<string, unknown>;
const isObject = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null;

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  pending: "pending",
  paid: "paid",
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

export const api = {
  updateOrder,

  async getTeas(): Promise<Tea[]> {
    const res = await axios.get<BackendTea[]>(API_URL);
    return res.data.map((item) => ({
      id: String(item.id),
      name: item.nama_produk,
      description: item.deskripsi,
      price: Number(item.harga ?? 0),
      image: item.gambar,
      category: item.kategori as Tea["category"],
      stock: Number(item.stok ?? 0),
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

  async uploadImage(
    productId: string | number,
    file: File
  ): Promise<{ url: string }> {
    const fd = new FormData();
    fd.append("image", file);
    await axios.post(`${API_URL}/${productId}/image`, fd);
    return { url: `${API_URL}/${productId}/image` };
  },

  async deleteTea(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },

  async updateTeaStock(id: string, diff: number): Promise<void> {
    await axios.patch(`${API_URL}/${id}/reduce-stok`, { quantity: diff });
  },

  async deleteOrder(orderId: string | number): Promise<void> {
    await axios.delete(`${ORDER_API}/${orderId}`);
  },

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
        harga: Number(it.tea.price ?? 0),
      })),
      totalPrice: Number(total),
      notes: payload.notes || null,
      order_status: "pending",
    };

    const res = await axios.post(ORDER_API, orderData);
    return res.data as CreateOrderResponse;
  },

  getOrderIdFromCreate(
    res: CreateOrderResponse | unknown
  ): string | number | undefined {
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
    else if (isObject(raw) && Array.isArray(raw.data))
      data = raw.data as BackendOrder[];
    else if (isObject(raw) && Array.isArray(raw.orders))
      data = raw.orders as BackendOrder[];

    return data.map((order) => {
      const status = normalizeOrderStatus(order.order_status, "pending");
      
      // tarik timestamp dari berbagai kemungkinan field milik backend
      const created =
        order.createdAt ??
        (order as Order).created_at ??
        null;

      const paid =
        (order as Order).paidAt ??
        (order as Order).paid_at ??
        (order as Order).payment_time ??
        null;

      return {
        id: String(order.id),
        customer_name: order.customer_name || "Tanpa Nama",
        items: order.items.map(
          (it): CartItem => ({
            tea: {
              id: String(it.productId),
              name: it.nama_produk,
              description: "",
              price: Number(it.harga ?? 0),
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

        order_status: status,
        status,

        notes: order.notes ?? null,

        // ⬇️ hanya pakai waktu dari backend (tanpa fallback FE)
        orderDate: created,

        // ⬇️ simpan paidAt kalau backend kirim (untuk tampilan jam "paid")
        paidAt: paid,

        source: (order as Order).source ?? "pos",
      } as Order;
    });
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await axios.put(`${ORDER_API}/${orderId}/status`, { order_status: status });
  },

  async createPayment(
    orderId: number | string,
    payload: { paymentMethod: string; amount: number }
  ): Promise<unknown> {
    try {
      const res = await axios.post(`${PAYMENT_API}/orders/${orderId}/pay`, payload);
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Gagal membuat pembayaran:", err.response?.data);
      } else {
        console.error("Gagal membuat pembayaran:", err);
      }
      throw err;
    }
  },

  async getPayments(): Promise<Payment[]> {
    const res = await axios.get(`${PAYMENT_API}/payments`);
    return res.data.data || [];
  },
  async deletePay(paymentId: string | number): Promise<void> {
    await axios.delete(`${PAYMENT_API}/payments/${paymentId}`);
  },

};

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
      payload.items.reduce(
        (acc, it) => acc + it.tea.price * it.quantity,
        0
      ) + (payload.extra ?? 0);
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
          console.warn(
            `[updateOrder] ${a.method.toUpperCase()} ${a.url} → 404, coba endpoint lain…`
          );
          lastErr = err;
          continue;
        }
      }
      throw err;
    }
  }

  throw lastErr ?? new Error("Tidak ada endpoint update order yang cocok.");
}

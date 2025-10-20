import { Tea, Order, CartItem } from "@/lib/types";
import { mockTeas } from "@/data/mockData";
import { generateId } from "@/lib/utils";

const TEAS_KEY = "teashop_teas";
const ORDERS_KEY = "teashop_orders";

export class TeaShopAPI {
  private static instance: TeaShopAPI;
  private teas: Tea[] = [];
  private orders: Order[] = [];

  static getInstance(): TeaShopAPI {
    if (!TeaShopAPI.instance) TeaShopAPI.instance = new TeaShopAPI();
    return TeaShopAPI.instance;
  }

  constructor() {
    this.load();
  }

  // ---------- STORAGE ----------
  private load() {
    const t = localStorage.getItem(TEAS_KEY);
    const o = localStorage.getItem(ORDERS_KEY);

    this.teas = t ? JSON.parse(t) : [...mockTeas];

    const parsed: Order[] = o ? JSON.parse(o) : [];
    this.orders = parsed.map((x) => ({ ...x, orderDate: new Date(x.orderDate) }));

    this.save();
  }

  private save() {
    localStorage.setItem(TEAS_KEY, JSON.stringify(this.teas));
    localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify(this.orders.map((x) => ({ ...x, orderDate: x.orderDate })))
    );
  }

  // ==============================
  // TEA (CRUD PRODUK)
  // ==============================

  async getTeas(): Promise<Tea[]> {
    return [...this.teas];
  }

  async addTea(tea: Omit<Tea, "id">): Promise<Tea> {
    const newTea: Tea = { ...tea, id: generateId() };
    this.teas.push(newTea);
    this.save();
    return newTea;
  }

  async updateTea(id: string, updates: Partial<Tea>): Promise<Tea | null> {
    const idx = this.teas.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.teas[idx] = { ...this.teas[idx], ...updates };
    this.save();
    return this.teas[idx];
  }

  async deleteTea(id: string): Promise<boolean> {
    const idx = this.teas.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.teas.splice(idx, 1);
    this.save();
    return true;
  }

  async updateTeaStock(teaId: string, diff: number) {
    const t = this.teas.find((x) => x.id === teaId);
    if (!t) return false;
    t.stock = Math.max(0, t.stock + diff);
    t.isAvailable = t.stock > 0;
    this.save();
    return true;
  }

  async getLowStockTeas(threshold = 10): Promise<Tea[]> {
    return this.teas.filter((t) => t.stock <= threshold);
  }

  async getTotalInventoryValue(): Promise<number> {
    return this.teas.reduce((acc, t) => acc + t.price * t.stock, 0);
  }

  // ==============================
  // ORDERS (TERPUSAT)
  // ==============================

  async createOrder(payload: {
  items: CartItem[];
  customerName: string;
  notes?: string;
  clientId?: string;
  source?: "shop" | "pos";
  extra?: number;
}): Promise<Order> {
  const extra = payload.extra ?? 0;
  const total = payload.items.reduce(
    (s, it) => s + it.tea.price * it.quantity,
    0
  ) + extra;

  const order: Order = {
    id: generateId(),
    items: payload.items,
    total,
    status: "pending",
    customerName: payload.customerName,
    orderDate: new Date(),
    notes: payload.notes,
    clientId: payload.clientId ?? "anonymous",
    source: payload.source ?? "shop",
  };

  for (const it of payload.items) {
    await this.updateTeaStock(it.tea.id, -it.quantity);
  }

  this.orders.unshift(order);
  this.save();
  return order;
}


  async getOrders(filter?: { clientId?: string }): Promise<Order[]> {
    const list = filter?.clientId
      ? this.orders.filter((o) => (o as any).clientId === filter.clientId)
      : this.orders;
    return [...list].sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
  }

  async updateOrderStatus(orderId: string, status: Order["status"]) {
    const idx = this.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;
    this.orders[idx].status = status;
    this.save();
    return this.orders[idx];
  }
}

export const api = TeaShopAPI.getInstance();

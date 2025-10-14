import { Tea, Order, CartItem } from '@/lib/types';
import { mockTeas } from '@/data/mockData';
import { generateId } from '@/lib/utils';

const TEAS_STORAGE_KEY = 'teashop_teas';
const ORDERS_STORAGE_KEY = 'teashop_orders';

export class TeaShopAPI {
  private static instance: TeaShopAPI;
  private teas: Tea[] = [];
  private orders: Order[] = [];

  static getInstance(): TeaShopAPI {
    if (!TeaShopAPI.instance) {
      TeaShopAPI.instance = new TeaShopAPI();
    }
    return TeaShopAPI.instance;
  }

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      const storedTeas = localStorage.getItem(TEAS_STORAGE_KEY);
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      
      this.teas = storedTeas ? JSON.parse(storedTeas) : [...mockTeas];
      this.orders = storedOrders ? JSON.parse(storedOrders) : [];
      
      this.saveData();
    } catch (error) {
      console.error('Error loading data:', error);
      this.teas = [...mockTeas];
      this.orders = [];
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem(TEAS_STORAGE_KEY, JSON.stringify(this.teas));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(this.orders));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Tea Management
  async getTeas(): Promise<Tea[]> {
    return [...this.teas];
  }

  async getTeaById(id: string): Promise<Tea | null> {
    return this.teas.find(tea => tea.id === id) || null;
  }

  async addTea(tea: Omit<Tea, 'id'>): Promise<Tea> {
    const newTea: Tea = {
      ...tea,
      id: generateId(),
    };
    this.teas.push(newTea);
    this.saveData();
    return newTea;
  }

  async updateTea(id: string, updates: Partial<Tea>): Promise<Tea | null> {
    const index = this.teas.findIndex(tea => tea.id === id);
    if (index === -1) return null;

    this.teas[index] = { ...this.teas[index], ...updates };
    this.saveData();
    return this.teas[index];
  }

  async deleteTea(id: string): Promise<boolean> {
    const index = this.teas.findIndex(tea => tea.id === id);
    if (index === -1) return false;

    this.teas.splice(index, 1);
    this.saveData();
    return true;
  }

  // Order Management
  async createOrder(items: CartItem[], customerName: string, notes?: string): Promise<Order> {
    const total = items.reduce((sum, item) => sum + (item.tea.price * item.quantity), 0);
    
    const order: Order = {
      id: generateId(),
      items,
      total,
      status: 'pending',
      customerName,
      orderDate: new Date(),
      notes,
    };

    // Update stock
    for (const item of items) {
      await this.updateTeaStock(item.tea.id, -item.quantity);
    }

    this.orders.push(order);
    this.saveData();
    return order;
  }

  async getOrders(): Promise<Order[]> {
    return [...this.orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    const index = this.orders.findIndex(order => order.id === orderId);
    if (index === -1) return null;

    this.orders[index].status = status;
    this.saveData();
    return this.orders[index];
  }

  async updateTeaStock(teaId: string, stockChange: number): Promise<boolean> {
    const tea = this.teas.find(t => t.id === teaId);
    if (!tea) return false;

    tea.stock = Math.max(0, tea.stock + stockChange);
    tea.isAvailable = tea.stock > 0;
    this.saveData();
    return true;
  }

  // Inventory helpers
  async getLowStockTeas(threshold: number = 10): Promise<Tea[]> {
    return this.teas.filter(tea => tea.stock <= threshold);
  }

  async getTotalInventoryValue(): Promise<number> {
    return this.teas.reduce((total, tea) => total + (tea.price * tea.stock), 0);
  }
}

export const api = TeaShopAPI.getInstance();
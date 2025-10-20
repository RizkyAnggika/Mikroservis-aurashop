import { useEffect, useMemo, useState } from "react";
import { Search, History, RefreshCcw } from "lucide-react";
import { Tea, CartItem, Order } from "@/lib/types";
import { api } from "@/lib/api";
import { filterTeas, debounce } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import POSMenuCard from "@/components/pos/POSMenuCard";
import POSCart from "@/components/pos/POSCart";
import { teaCategories } from "@/data/mockData";
import { toast } from "sonner";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger,} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OrdersPage() {
  // ====== POS (kasir) state ======
  const [teas, setTeas] = useState<Tea[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // ====== Riwayat Orders state ======
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "shop" | "pos">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");

  // ====== Helpers ======
  const fmtIDR = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const fmtTime = (d: Date | string) =>
    new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  // ====== Load menu (POS) ======
  useEffect(() => {
    (async () => {
      try {
        const data = await api.getTeas();
        setTeas(data.filter((t) => t.isAvailable));
      } catch (e) {
        console.error(e);
        toast.error("Gagal memuat menu");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const debouncedSearch = useMemo(() => debounce((term: string) => setSearchTerm(term), 300), []);
  const filtered = useMemo(() => filterTeas(teas, searchTerm, selectedCategory), [teas, searchTerm, selectedCategory]);

  // ====== Cart handlers (POS) ======
  const handleAdd = (item: Tea) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.tea.id === item.id);
      if (found) {
        if (found.quantity >= item.stock) {
          toast.error("Stok tidak mencukupi");
          return prev;
        }
        return prev.map((i) => (i.tea.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { tea: item, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id: string, qty: number) =>
    setCartItems((prev) => prev.map((i) => (i.tea.id === id ? { ...i, quantity: qty } : i)));

  const handleRemove = (id: string) => setCartItems((prev) => prev.filter((i) => i.tea.id !== id));
  const handleClear = () => setCartItems([]);

  const handleSave = () => {
    localStorage.setItem("pos_draft", JSON.stringify(cartItems));
    toast.success("Draft pesanan disimpan");
  };

  // POS bayar → createOrder(source="pos")
  const handlePay = async ({ total, extra, notes }: { total: number; extra: number; notes?: string }) => {
    try {
      await api.createOrder({
        items: cartItems,
        customerName: "Walk-in",
        notes,
        source: "pos",
        extra,
      });
      toast.success(`Pembayaran berhasil. Total ${fmtIDR(total)}`);
      setCartItems([]);
      // segarkan riwayat jika dialog terbuka
      if (isHistoryOpen) void loadOrders();
    } catch {
      toast.error("Gagal memproses pembayaran");
    }
  };

  // ====== Riwayat Orders (shared Shop/POS) ======
  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const list = await api.getOrders(); // semua pesanan, karena Shop & POS sama² createOrder()
      setOrders(list);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat riwayat order");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // saat dialog dibuka → muat data
  useEffect(() => {
    if (isHistoryOpen) {
      void loadOrders();
    }
  }, [isHistoryOpen]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => (sourceFilter === "all" ? true : o.source === sourceFilter))
      .filter((o) => (statusFilter === "all" ? true : o.status === statusFilter))
      .filter((o) =>
        orderSearch.trim()
          ? o.customerName.toLowerCase().includes(orderSearch.trim().toLowerCase())
          : true
      );
  }, [orders, sourceFilter, statusFilter, orderSearch]);

  const updateStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast.success("Status diperbarui");
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  // ====== UI ======
  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Memuat menu…</div>;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header aksi riwayat */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-semibold">Kasir</div>
          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="gap-2">
                <History className="w-4 h-4" />
                Lihat Riwayat Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Riwayat Order
                </DialogTitle>
              </DialogHeader>

              {/* Toolbar filter & search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama pelanggan…"
                    className="pl-9"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
                <Select value={sourceFilter} onValueChange={(v: "all" | "shop" | "pos") => setSourceFilter(v)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Sumber" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Sumber</SelectItem>
                    <SelectItem value="shop">Shop</SelectItem>
                    <SelectItem value="pos">POS</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(v: "all" | Order["status"]) => setStatusFilter(v)}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={loadOrders} disabled={isLoadingOrders} className="gap-2">
                  <RefreshCcw className="w-4 h-4" />
                  {isLoadingOrders ? "Memuat…" : "Refresh"}
                </Button>
              </div>

              {/* List orders */}
              <ScrollArea className="h-[55vh] mt-4">
                {filteredOrders.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-10">
                    {isLoadingOrders ? "Memuat riwayat…" : "Belum ada order."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((o) => (
                      <Card key={o.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{o.customerName}</span>
                              <Badge variant="secondary" className="capitalize">
                                {o.source ?? "shop"}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {fmtTime(o.orderDate)} • {o.items.length} item
                            </div>
                            <div className="mt-2 text-sm">
                              {o.items.slice(0, 3).map((it) => (
                                <span key={it.tea.id} className="mr-2">
                                  {it.tea.name} × {it.quantity}
                                </span>
                              ))}
                              {o.items.length > 3 && <span>…</span>}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold">{fmtIDR(o.total)}</div>
                            <Select
                              value={o.status}
                              onValueChange={(v: Order["status"]) => updateStatus(o.id, v)}
                            >
                              <SelectTrigger className="mt-2 h-8 w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Kategori (POS) */}
        <div className="mb-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari menu…"
              className="pl-10 h-11"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-56 h-11">
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              {teaCategories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid: 8 / 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <POSMenuCard
                  key={item.id}
                  item={item}
                  isSelected={!!cartItems.find((ci) => ci.tea.id === item.id)}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <POSCart
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQty}
              onRemoveItem={handleRemove}
              onClearCart={handleClear}
              onSave={handleSave}
              onPay={handlePay}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

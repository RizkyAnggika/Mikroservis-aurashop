import { useEffect, useMemo, useState } from "react";
import { Search, History, RefreshCcw, Trash2, CreditCard } from "lucide-react";
import { Tea, CartItem, Order, OrderStatus, Payment } from "@/lib/types";
import { api } from "@/lib/api";
import { filterTeas, debounce } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { Dialog, DialogContent,DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import POSMenuCard from "@/components/pos/POSMenuCard";
import POSCart from "@/components/pos/POSCart";
import { teaCategories } from "@/data/mockData";
import { toast } from "sonner";

// ---------- Helpers ----------
const getCustomerName = (o: Order) => o.customer_name ?? o.customerName ?? "Walk-in";
const getNotes = (o: Order) => (o.notes ?? o.note ?? "") as string;
const getExtra = (o: Order) => Number(o.extra ?? o.additionalFee ?? 0);

// catat semua kemungkinan nama field dari backend
const getOrderDate = (o: Order) =>
  o.createdAt ??
  (typeof o.orderDate === "string" ? o.orderDate : "") ??
  (o as Order).created_at ??
  "";

const getUpdatedAt = (o: Order) =>
  (o as Order).updatedAt ?? (o as Order).updated_at ?? "";

const getPaidAt = (o: Order) =>
  (o as Order).paidAt ?? (o as Order).paid_at ?? (o as Order).payment_time ?? "";

const getTotal = (o: Order) => Number(o.totalPrice ?? o.total ?? 0);

const getStatus = (o: Order): OrderStatus =>
  (o.order_status ?? o.status ?? "pending") as OrderStatus;

// Urutan prioritas waktu tampil:
// 1) updatedAt (kalau ada)
// 2) paidAt (kalau status "paid")
// 3) createdAt
const getDisplayTimeISO = (o: Order) => {
  const updated = getUpdatedAt(o);
  if (updated) return updated;

  const status = getStatus(o);
  if (status === "paid") {
    return getPaidAt(o) || getOrderDate(o);
  }

  return getOrderDate(o);
};

export default function IndexPOSPage() {
  // ====== POS (kasir) state ======
  const [teas, setTeas] = useState<Tea[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [isPaying, setIsPaying] = useState(false);
  const [draftOrderId, setDraftOrderId] = useState<string | null>(() =>
    localStorage.getItem("pos_draft_orderId")
  );

  // ====== Riwayat Orders state ======
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [sourceFilter] = useState<"all" | "shop" | "pos">("all");
  const [statusFilter] = useState<"all" | OrderStatus>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState<string>("");
  const [cartNotes, setCartNotes] = useState<string>("");
  const [cartExtra, setCartExtra] = useState<number>(0);

  // ====== Formatters ======
  const fmtIDR = (v: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(v);

  const fmtTime = (d: Date | string) =>
    new Date(d).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

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

  const debouncedSearch = useMemo(
    () => debounce((term: string) => setSearchTerm(term), 300),
    []
  );

  const filtered = useMemo(
    () => filterTeas(teas, searchTerm, selectedCategory),
    [teas, searchTerm, selectedCategory]
  );

  // ====== Cart handlers ======
  const handleAdd = (item: Tea) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.tea.id === item.id);
      if (found) {
        if (found.quantity >= item.stock) {
          toast.error("Stok tidak mencukupi");
          return prev;
        }
        return prev.map((i) =>
          i.tea.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { tea: item, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id: string, qty: number) =>
    setCartItems((prev) =>
      prev.map((i) => (i.tea.id === id ? { ...i, quantity: qty } : i))
    );

  const handleRemove = (id: string) =>
    setCartItems((prev) => prev.filter((i) => i.tea.id !== id));
  const handleClear = () => setCartItems([]);

  // ====== Ambil order dari riwayat ke keranjang ======
  const loadOrderFromHistory = (o: Order) => {
    const idStr = String(o.id);
    setDraftOrderId(idStr);
    localStorage.setItem("pos_draft_orderId", idStr);

    setCustomerName(getCustomerName(o));
    setCartNotes(getNotes(o));
    setCartExtra(getExtra(o));

    const items: CartItem[] = (o.items ?? []).map((it) => ({
      tea: {
        id: String(it.productId ?? it.tea?.id ?? ""),
        name: it.nama_produk ?? it.tea?.name ?? "Produk",
        description: it.tea?.description ?? "",
        price: Number(it.harga ?? it.tea?.price ?? 0),
        image: it.tea?.image ?? "",
        category: (it.tea?.category as Tea["category"]) ?? "green",
        stock: it.tea?.stock ?? 999,
        isAvailable: true,
      },
      quantity: Number(it.quantity ?? it.qty ?? 1),
    }));

    setCartItems(items);
    toast.success(`Order #${idStr} (${getCustomerName(o)}) dimuat ke keranjang`);
  };

  // ====== Proses pembayaran ======
  const handlePay = async ({
    total,
    extra,
    notes,
    customerName,
  }: {
    total: number;
    extra: number;
    notes?: string;
    customerName?: string;
  }) => {
    const name = (customerName || "").trim() || "Walk-in";
    setIsPaying(true);
    try {
      let orderId = draftOrderId;

      if (!orderId) {
        const created = await api.createOrder({
          items: cartItems,
          customerName: name,
          notes: notes ?? "",
          source: "pos",
          extra: extra ?? 0,
        });
        const oid = api.getOrderIdFromCreate(created);
        if (!oid) throw new Error("Gagal dapat orderId dari createOrder");
        orderId = String(oid);
      } else {
        await api.updateOrder(orderId, {
          customerName: name,
          notes: notes ?? "",
          extra: extra ?? 0,
          items: cartItems,
        });
      }

      await api.createPayment(orderId, {
        paymentMethod: "cash",
        amount: total,
      });
      await api.updateOrderStatus(orderId, "paid");

      // refetch supaya updatedAt dari backend langsung tampil
      await loadOrders();

      toast.success(`💰 Pembayaran berhasil untuk ${name}`);
      setCartItems([]);
      setDraftOrderId(null);
      localStorage.removeItem("pos_draft_orderId");
      setCustomerName("");
    } catch (e) {
      console.error(e);
      toast.error("Gagal memproses pembayaran");
    } finally {
      setIsPaying(false);
    }
  };

  // ====== Riwayat Orders ======
  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const list = await api.getOrders();
      setOrders(list);
    } catch (e) {
      console.error("Gagal load orders:", e);
      toast.error("Gagal memuat riwayat order");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadOrdersAndPayments = async () => {
    try {
      const [orderList, paymentList] = await Promise.all([
        api.getOrders(),
        api.getPayments()
      ]);
      setOrders(orderList);
      setPayments(paymentList);
    } catch (e) {
      console.error("Gagal memuat riwayat:", e);
      toast.error("Gagal memuat riwayat pembayaran atau order");
    }
  };

  useEffect(() => {
    if (isHistoryOpen) void loadOrders();
  }, [isHistoryOpen]);

  useEffect(() => {
  if (isHistoryOpen) void loadOrders();
}, [isHistoryOpen]);

useEffect(() => {
  if (isPaymentOpen) void loadOrdersAndPayments();
}, [isPaymentOpen]);


  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) =>
        sourceFilter === "all" ? true : o.source === sourceFilter
      )
      .filter((o) => {
        const currentStatus = getStatus(o);
    
        if (statusFilter === "all") {
          return currentStatus === "pending";
        }
        return currentStatus === statusFilter;
      })
      .filter((o) =>
        orderSearch.trim()
          ? getCustomerName(o)
              .toLowerCase()
              .includes(orderSearch.trim().toLowerCase())
          : true
      );
  }, [orders, sourceFilter, statusFilter, orderSearch]);

  const filteredPayments = useMemo(() => {
    const term = paymentSearch.trim().toLowerCase();
    if (!term) return payments;

    return payments.filter((p) => {
      const orderInfo = orders.find(order => String(order.id) === String(p.orderId));
      const customer = orderInfo?.customer_name?.toLowerCase() ?? "";
      const method = p.paymentMethod?.toLowerCase() ?? "";
      const status = p.status?.toLowerCase() ?? "";
      const idStr = String(p.id);

      return (
        customer.includes(term) ||
        method.includes(term) ||
        status.includes(term) ||
        idStr.includes(term)
      );
    });
  }, [payments, orders, paymentSearch]);


  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Yakin hapus order #${orderId}?`)) return;
    try {
      setDeletingId(orderId);
      
      await api.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => String(o.id) !== orderId));
      if (draftOrderId === orderId) {
        setDraftOrderId(null);
        localStorage.removeItem("pos_draft_orderId");
        setCartItems([]);
        setCustomerName("");
        setCartNotes("");
        setCartExtra(0);
      }
      toast.success(`Order #${orderId} dihapus`);
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus order");
    } finally {
      setDeletingId(null);
    }
  };
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm(`Yakin hapus riwayat payment #${paymentId} (beserta order-nya)?`)) return;
    try {
      setDeletingId(paymentId);
      
      await api.deletePay(paymentId); // ⬅️ akan menghapus payment + order
      setPayments((prev) => prev.filter((o) => String(o.id) !== paymentId));

      // Optional: hapus dari list order juga kalau kamu punya
      setOrders((prev) => prev.filter((o) => String(o.id) !== paymentId)); // HANYA kalau paymentId === orderId

      toast.success(`Payment #${paymentId} dan order terkait dihapus`);
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus payment");
    } finally {
      setDeletingId(null);
    }
  };

  // ====== UI ======
  if (isLoading)
    return <div className="p-6 text-center text-muted-foreground">Memuat menu…</div>;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header & Dialog Riwayat */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-semibold">Kasir</div>

          <div className="flex gap-2">
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <History className="w-4 h-4" />
                  List Order Online
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-3xl sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Order Online
                  </DialogTitle>
                </DialogHeader>

                {/* Toolbar Filter */}
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

                  <Button
                    variant="outline"
                    onClick={loadOrders}
                    disabled={isLoadingOrders}
                    className="gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {isLoadingOrders ? "Memuat…" : "Refresh"}
                  </Button>
                </div>

                {/* List Orders */}
                <ScrollArea className="h-[55vh] mt-4">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10">
                      {isLoadingOrders ? "Memuat riwayat…" : "Belum ada order."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOrders.map((o) => {
                        const name = getCustomerName(o);
                        const displayISO = getDisplayTimeISO(o);
                        const displayTime = displayISO ? fmtTime(displayISO) : "-";
                        const total = getTotal(o);
                        const notes = getNotes(o);                      

                        return (
                          <Card key={o.id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{name}</span>
                                  <Badge variant="secondary" className="capitalize">
                                    {o.source ?? "pos"}
                                  </Badge>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  {displayTime} • {(o.items?.length ?? 0)} item
                                </div>

                                <div className="mt-2 text-sm">
                                  {Array.isArray(o.items) && o.items.length > 0 ? (
                                    o.items.slice(0, 3).map((it, i) => (
                                      <div key={i}>
                                        {(it.tea?.name || it.nama_produk || "Produk")} ×{" "}
                                        {it.quantity ?? it.qty ?? 0}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 italic">Tidak ada item</span>
                                  )}
                                  {(o.items?.length ?? 0) > 3 && <span>…</span>}
                                </div>

                                <div className="mt-1 text-xs text-muted-foreground">
                                  <span className="font-medium">Catatan:</span>{" "}
                                  {notes ? notes : <span className="italic text-gray-400">—</span>}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-semibold">{fmtIDR(total)}</div>

                                <div className="mt-2 flex gap-2 items-end">
                                  <div className="flex flex-col gap-2 w-full"> 
                                    <p className="border border-gray rounded-lg flex justify-center ">
                                      {o.order_status
                                        ? o.order_status.charAt(0).toUpperCase() + o.order_status.slice(1).toLowerCase()
                                        : ""}
                                    </p>                           

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        loadOrderFromHistory(o);
                                        setIsHistoryOpen(false);
                                      }}
                                    >
                                      Gunakan order ini
                                    </Button>
                                  </div>

                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => handleDeleteOrder(String(o.id))}
                                    disabled={deletingId === String(o.id)}
                                    title="Hapus order ini"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    {deletingId === String(o.id) ? "Menghapus…" : "Hapus"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2 bg-black hover:bg-gray-700 text-white">
                  <CreditCard className="w-4 h-4" />
                  Riwayat Payment
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-3xl sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment
                  </DialogTitle>
                </DialogHeader>

                {/* Toolbar Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama pelanggan…"
                      className="pl-9"
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={loadOrdersAndPayments}
                    disabled={isLoadingPayments}
                    className="gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {isLoadingPayments ? "Memuat…" : "Refresh"}
                  </Button>
                </div>

                {/* List Orders */}
                <ScrollArea className="h-[55vh] mt-4">
                  {Array.isArray(payments) && payments.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10">
                      {isLoadingPayments ? "Memuat riwayat…" : "Belum ada order."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPayments.map((p) => {
                        const orderInfo = orders.find(order => String(order.id) === String(p.orderId));

                        return (
                          <Card key={p.id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {orderInfo ? orderInfo.customer_name : "Order tidak ditemukan"}
                                  </span>
                                  <Badge variant="secondary" className="capitalize">
                                    {orderInfo?.source ?? "pos"}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {p.created_at} • {(orderInfo?.items?.length ?? 0)} item
                                </div>
                                <div className="mt-2 text-sm">
                                  {Array.isArray(orderInfo?.items) && orderInfo.items.length > 0 ? (
                                    orderInfo.items.slice(0, 3).map((it, i) => (
                                      <div key={i}>
                                        {(it.tea?.name || it.nama_produk || "Produk")} ×{" "}
                                        {it.quantity ?? it.qty ?? 0}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 italic">Tidak ada item</span>
                                  )}
                                  {(orderInfo?.items?.length ?? 0) > 3 && <span>…</span>}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  <span className="font-medium">Catatan:</span>{" "}
                                  {orderInfo?.notes ?? <span className="italic text-gray-400">—</span>}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-semibold">{fmtIDR(p.amount)}</div>
                                <div className="mt-2 flex gap-2 items-end">
                                  <div className="flex flex-col gap-2 w-full"> 
                                    <p className="border border-gray rounded-lg flex justify-center px-4 py-1.5">
                                      {orderInfo?.order_status
                                        ? orderInfo.order_status.charAt(0).toUpperCase() + orderInfo.order_status.slice(1).toLowerCase()
                                        : ""} {p.status}
                                    </p>
                                  </div>

                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => handleDeletePayment(String(p.id))}
                                    disabled={deletingId === String(orderInfo?.id)}
                                    title="Hapus order ini"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    {deletingId === String(orderInfo?.id) ? "Menghapus…" : "Hapus"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search & Kategori */}
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

        {/* Grid: Menu + Keranjang */}
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
              onPay={handlePay}
              isPaying={isPaying}
              customerName={customerName}
              onChangeCustomerName={setCustomerName}
              notesValue={cartNotes}
              onChangeNotes={setCartNotes}
              extraValue={cartExtra}
              onChangeExtra={setCartExtra}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

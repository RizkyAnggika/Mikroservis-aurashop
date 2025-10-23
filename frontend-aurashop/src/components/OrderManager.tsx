// src/pages/orders/OrderManager.tsx
import { useState, useEffect } from "react";
import { Order, CartItem, OrderStatus } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Receipt, Clock, ChefHat, CheckCircle, Package, DollarSign,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ---------- Types to avoid `any` ----------
type LegacyOrderFields = Partial<{
  total: number;          // beberapa payload pakai "total"
  created_at: string;     // beberapa payload pakai "created_at"
  customerName: string;   // alias frontend lama
}>;
type AnyOrder = Order & LegacyOrderFields;

// kalau OrderStatus di types.ts belum ada "paid", kita extend lokal saja
type ExtStatus = OrderStatus | "paid";

// ---------- Small helpers (tanpa `any`) ----------
const getIdStr = (o: Pick<Order, "id">) => String(o.id);

const getCustomerName = (o: AnyOrder) =>
  o.customer_name ?? o.customerName ?? "Walk-in";

const getStatus = (o: AnyOrder): ExtStatus =>
  (o.order_status ?? (o.status as ExtStatus) ?? "pending") as ExtStatus;

const getTotal = (o: AnyOrder) =>
  Number(o.totalPrice ?? o.total ?? 0);

const getOrderDate = (o: AnyOrder) => {
  const raw =
    o.createdAt ??
    (typeof o.orderDate === "string" ? o.orderDate : undefined) ??
    o.created_at;
  return raw ? new Date(raw) : null;
};

const itemLabel = (it: CartItem) => {
  const name = it.tea?.name ?? it.nama_produk ?? "Produk";
  const qty = it.quantity ?? it.qty ?? 0;
  return `${qty}× ${name}`;
};

// ---------- UI helpers ----------
const getStatusBadgeVariant = (status: ExtStatus) => {
  switch (status) {
    case "pending": return "secondary";
    case "preparing": return "default";
    case "ready": return "destructive";
    case "completed": return "outline";
    case "paid": return "default";
    default: return "secondary";
  }
};

const getStatusText = (status: ExtStatus) => {
  switch (status) {
    case "pending": return "Menunggu";
    case "preparing": return "Diproses";
    case "ready": return "Siap";
    case "completed": return "Selesai";
    case "paid": return "Terbayar";
    default: return status;
  }
};

const getStatusIcon = (status: ExtStatus) => {
  switch (status) {
    case "pending": return <Clock className="w-4 h-4" />;
    case "preparing": return <ChefHat className="w-4 h-4" />;
    case "ready": return <Package className="w-4 h-4" />;
    case "completed": return <CheckCircle className="w-4 h-4" />;
    case "paid": return <DollarSign className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getNextStatus = (status: ExtStatus): ExtStatus | null => {
  switch (status) {
    case "pending": return "preparing";
    case "preparing": return "ready";
    case "ready": return "completed";
    default: return null;
  }
};

const getNextStatusText = (status: ExtStatus) => {
  const next = getNextStatus(status);
  return next ? getStatusText(next) : "";
};

interface OrderManagerProps {
  onOrderUpdated?: () => void;
}

export default function OrderManager({ onOrderUpdated }: OrderManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ExtStatus | "all">("all");

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => loadOrders(), 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Gagal memuat data pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  // terima string | number, cast saat ke API
  const handleStatusUpdate = async (
    orderId: string | number,
    newStatus: ExtStatus
  ) => {
    try {
      await api.updateOrderStatus(String(orderId), newStatus);
      await loadOrders();
      onOrderUpdated?.();
      toast.success("Status pesanan berhasil diperbarui");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal memperbarui status pesanan");
    }
  };

  // Filter memakai getter status
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => getStatus(o as AnyOrder) === statusFilter);

  // Statistik
  const pendingOrders   = orders.filter((o) => getStatus(o as AnyOrder) === "pending").length;
  const preparingOrders = orders.filter((o) => getStatus(o as AnyOrder) === "preparing").length;
  const readyOrders     = orders.filter((o) => getStatus(o as AnyOrder) === "ready").length;
  const todayRevenue = orders
    .filter((o) => {
      const d = getOrderDate(o as AnyOrder);
      return d && d.toDateString() === new Date().toDateString() && getStatus(o as AnyOrder) === "completed";
    })
    .reduce((sum, o) => sum + getTotal(o as AnyOrder), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Receipt className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Memuat pesanan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            Manajemen Pesanan
          </h2>
          <p className="text-gray-600">Semua pesanan dari pelanggan (Shop & POS)</p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v: ExtStatus | "all") => setStatusFilter(v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="preparing">Diproses</SelectItem>
            <SelectItem value="ready">Siap</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="paid">Terbayar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium">Diproses</CardTitle>
            <ChefHat className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{preparingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium">Siap</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatIDR(todayRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Pesanan */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan ({filteredOrders.length})</CardTitle>
          <CardDescription>Semua pesanan pelanggan</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada pesanan ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((o) => {
                    const ao = o as AnyOrder;
                    const status = getStatus(ao);
                    const next = getNextStatus(status);
                    const when = getOrderDate(ao);
                    return (
                      <TableRow key={getIdStr(o)}>
                        <TableCell>
                          <code className="text-sm">{getIdStr(o)}</code>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{getCustomerName(ao)}</div>
                        </TableCell>
                        <TableCell>
                          <ScrollArea className="max-h-20 w-48">
                            {(o.items ?? []).map((it, i) => (
                              <div key={i} className="text-sm">
                                {itemLabel(it)}
                              </div>
                            ))}
                          </ScrollArea>
                        </TableCell>
                        <TableCell className="text-green-700 font-semibold">
                          {formatIDR(getTotal(ao))}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(status)}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusIcon(status)}
                            {getStatusText(status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {when ? when.toLocaleString("id-ID") : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {next && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(o.id, next)}
                              variant={status === "ready" ? "default" : "outline"}
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(next)}
                              {getNextStatusText(status)}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// src/pages/orders/OrderManager.tsx
import { useState, useEffect } from "react";
import { Order, CartItem } from "@/lib/types";
import { formatIDR } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Receipt, Clock, DollarSign, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ---------- Types (tanpa any) ----------
type LegacyOrderFields = Partial<{
  total: number;        // beberapa payload pakai "total"
  created_at: string;   // beberapa payload pakai "created_at"
  customerName: string; // alias FE lama
}>;

type AnyOrder = Order & LegacyOrderFields;

// Status UI yang dipakai halaman ini: hanya 2
type UIStatus = "pending" | "paid";

// ---------- Small helpers ----------
const getIdStr = (o: Pick<Order, "id">) => String(o.id);

const getCustomerName = (o: AnyOrder) =>
  o.customer_name ?? o.customerName ?? "Walk-in";

const mapToUIStatus = (o: AnyOrder): UIStatus => {
  const raw = (o.order_status ?? o.status ?? "pending").toString().toLowerCase();
  // peta alias BE → UIStatus
  if (
    raw === "paid" ||
    raw === "success" ||
    raw === "completed" ||
    raw === "payment_success" ||
    raw === "payed"
  ) {
    return "paid";
  }
  return "pending";
};

const getTotal = (o: AnyOrder) => Number(o.totalPrice ?? o.total ?? 0);

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
const getStatusBadgeVariant = (status: UIStatus) =>
  status === "paid" ? "default" : "secondary";

const getStatusText = (status: UIStatus) =>
  status === "paid" ? "Terbayar" : "Menunggu";

const getStatusIcon = (status: UIStatus) =>
  status === "paid" ? <DollarSign className="w-4 h-4" /> : <Clock className="w-4 h-4" />;

const getNextStatus = (status: UIStatus): UIStatus | null =>
  status === "pending" ? "paid" : null;

// ---------- Component ----------
interface OrderManagerProps {
  onOrderUpdated?: () => void;
}

export default function OrderManager({ onOrderUpdated }: OrderManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<UIStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleStatusUpdate = async (
    orderId: string | number,
    newStatus: UIStatus
  ) => {
    try {
      await api.updateOrderStatus(String(orderId), newStatus);
      // refresh ringan (tanpa request penuh) bisa juga:
      setOrders((prev) =>
        prev.map((o) =>
          String(o.id) === String(orderId)
            ? ({ ...o, order_status: newStatus } as Order)
            : o
        )
      );
      onOrderUpdated?.();
      toast.success("Status pesanan berhasil diperbarui");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal memperbarui status pesanan");
    }
  };

  const handleDeleteOrder = async (orderId: string | number) => {
    const idStr = String(orderId);
    if (!confirm(`Yakin menghapus order #${idStr}? Aksi ini tidak bisa dibatalkan.`)) return;

    try {
      setDeletingId(idStr);
      await api.deleteOrder(idStr); // DELETE /api/orders/:id
      // hapus dari state tanpa full reload
      setOrders((prev) => prev.filter((o) => String(o.id) !== idStr));
      onOrderUpdated?.();
      toast.success(`Order #${idStr} dihapus`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus order");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => mapToUIStatus(o as AnyOrder) === statusFilter);

  // Statistik
  const pendingOrders = orders.filter((o) => mapToUIStatus(o as AnyOrder) === "pending").length;
  const paidOrders    = orders.filter((o) => mapToUIStatus(o as AnyOrder) === "paid").length;

  const todayRevenue = orders
    .filter((o) => {
      const d = getOrderDate(o as AnyOrder);
      return d && d.toDateString() === new Date().toDateString() && mapToUIStatus(o as AnyOrder) === "paid";
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
          onValueChange={(v: UIStatus | "all") => setStatusFilter(v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="paid">Terbayar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardTitle className="text-sm font-medium">Terbayar</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{paidOrders}</div>
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
                    const status = mapToUIStatus(ao);
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
                          <div className="flex justify-end gap-2">
                            {next && status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(o.id, "paid")}
                                variant="default"
                                className="flex items-center gap-1"
                              >
                                <DollarSign className="w-4 h-4" />
                                Tandai Terbayar
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex items-center gap-1"
                              onClick={() => handleDeleteOrder(o.id)}
                              disabled={deletingId === String(o.id)}
                              title="Hapus order ini"
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingId === String(o.id) ? "Menghapus…" : "Hapus"}
                            </Button>
                          </div>
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

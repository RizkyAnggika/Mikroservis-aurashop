import { useState } from "react";
import { CartItem, Order } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  cartItems: CartItem[];
  onUpdateQuantity: (teaId: string, quantity: number) => void;
  onRemoveItem: (teaId: string) => void;
  onClearCart: () => void;

  sessionOrders?: Order[];
  onClearSessionOrders?: () => void;

  onCheckout?: (payload: {
    customerName: string;
    notes?: string;
    total: number;
  }) => Promise<void> | void;
}

export default function OrderCart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  sessionOrders = [],
  onClearSessionOrders,
  onCheckout,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalItems = cartItems.reduce((s, x) => s + x.quantity, 0);
  const totalPrice = cartItems.reduce((s, x) => s + x.tea.price * x.quantity, 0);

  const changeQty = (teaId: string, d: number) => {
    const item = cartItems.find(i => i.tea.id === teaId);
    if (!item) return;
    const q = Math.max(0, item.quantity + d);
    if (q === 0) {
      onRemoveItem(teaId);
    } else {
      onUpdateQuantity(teaId, q);
    }
  };

  const getName = (o: Order) => o.customerName ?? o.customer_name ?? "Walk-in";
  const getTotal = (o: Order) => Number(o.totalPrice ?? o.total ?? 0);
  const getStatus = (o: Order) => o.order_status ?? o.status ?? "pending";

  const submit = async () => {
    if (!customerName.trim()) {
      toast.error("Nama pelanggan harus diisi");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }
    if (!onCheckout) {
      toast.error("Checkout tidak tersedia");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCheckout({
        customerName: customerName.trim(),
        notes: notes.trim() || undefined,
        total: totalPrice,
      });
      setCustomerName("");
      setNotes("");
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Gagal membuat pesanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SessionHistory = () => {
    if (!sessionOrders.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Keranjang kosong</p>
          <p className="text-xs mt-2">Belum ada riwayat pesanan pada sesi ini</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Riwayat Pesanan (Sesi Ini)</h4>
          {onClearSessionOrders && (
            <Button size="sm" variant="outline" onClick={onClearSessionOrders}>
              Hapus Riwayat
            </Button>
          )}
        </div>

        {sessionOrders.map(ord => (
          <Card key={ord.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {getName(ord)} •{" "}
                  {new Date(ord.orderDate).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {ord.items.length} item • status: {getStatus(ord)}
                </p>
              </div>
              <div className="text-right font-semibold">
                {formatIDR(getTotal(ord))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
          size="lg"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Keranjang Belanja
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 mt-6">
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <Card key={item.tea.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.tea.image}
                        alt={item.tea.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.tea.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatIDR(item.tea.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeQty(item.tea.id, -1)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeQty(item.tea.id, 1)}
                            className="w-8 h-8 p-0"
                            disabled={item.quantity >= item.tea.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemoveItem(item.tea.id)}
                            className="w-8 h-8 p-0 ml-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatIDR(item.tea.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <SessionHistory />
            )}
          </ScrollArea>

          {cartItems.length > 0 && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span className="text-lg text-green-600">
                  {formatIDR(totalPrice)}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="customerName">Nama Pelanggan *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama pelanggan"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan khusus untuk pesanan"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClearCart}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Kosongkan
                </Button>
                <Button
                  onClick={submit}
                  className="flex-1"
                  disabled={isSubmitting || !customerName.trim() || !onCheckout}
                >
                  {isSubmitting ? "Memproses..." : "Buat Pesanan"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

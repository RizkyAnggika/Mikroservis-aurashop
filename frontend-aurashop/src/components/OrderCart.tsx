import { useState, useEffect } from 'react';
import { CartItem, Order } from '@/lib/types';
import { formatIDR } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Plus, Minus, Trash2, Receipt } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface OrderCartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (teaId: string, quantity: number) => void;
  onRemoveItem: (teaId: string) => void;
  onClearCart: () => void;
}

export default function OrderCart({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart }: OrderCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.tea.price * item.quantity), 0);

  useEffect(() => {
    loadRecentOrders();
  }, []);

  const loadRecentOrders = async () => {
    try {
      const orders = await api.getOrders();
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleQuantityChange = (teaId: string, change: number) => {
    const currentItem = cartItems.find(item => item.tea.id === teaId);
    if (!currentItem) return;

    const newQuantity = Math.max(0, currentItem.quantity + change);
    if (newQuantity === 0) {
      onRemoveItem(teaId);
    } else {
      onUpdateQuantity(teaId, newQuantity);
    }
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Nama pelanggan harus diisi');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await api.createOrder(cartItems, customerName.trim(), notes.trim() || undefined);
      toast.success(`Pesanan berhasil dibuat! ID: ${order.id}`);
      
      // Reset form
      setCustomerName('');
      setNotes('');
      onClearCart();
      setIsOpen(false);
      
      // Reload recent orders
      await loadRecentOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'preparing': return 'default';
      case 'ready': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'preparing': return 'Diproses';
      case 'ready': return 'Siap';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50" size="lg">
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
            <ShoppingCart className="w-5 h-5" />
            Keranjang Belanja
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 mt-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keranjang kosong</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.tea.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.tea.image}
                        alt={item.tea.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.tea.name}</h4>
                        <p className="text-sm text-gray-600">{formatIDR(item.tea.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.tea.id, -1)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.tea.id, 1)}
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
                        <p className="font-medium text-sm">{formatIDR(item.tea.price * item.quantity)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {cartItems.length > 0 && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span className="text-lg text-green-600">{formatIDR(totalPrice)}</span>
              </div>
              
              <Separator />
              
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
                  onClick={handleSubmitOrder}
                  className="flex-1"
                  disabled={isSubmitting || !customerName.trim()}
                >
                  {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
                </Button>
              </div>
            </div>
          )}

          {recentOrders.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Pesanan Terbaru
              </h3>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-gray-600">ID: {order.id}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                          {getStatusText(order.status)}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">{formatIDR(order.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
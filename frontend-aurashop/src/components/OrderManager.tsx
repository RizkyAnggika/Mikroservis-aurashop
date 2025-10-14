import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { formatIDR } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Receipt, Clock, ChefHat, CheckCircle, Package, TrendingUp, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface OrderManagerProps {
  onOrderUpdated?: () => void;
}

export default function OrderManager({ onOrderUpdated }: OrderManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await api.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Gagal memuat data pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      onOrderUpdated?.();
      toast.success('Status pesanan berhasil diperbarui');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Gagal memperbarui status pesanan');
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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'ready': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      case 'completed': return null;
      default: return null;
    }
  };

  const getNextStatusText = (currentStatus: Order['status']): string => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return '';
    return getStatusText(nextStatus);
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Statistics
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const preparingOrders = orders.filter(order => order.status === 'preparing').length;
  const readyOrders = orders.filter(order => order.status === 'ready').length;
  const todayRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString() && order.status === 'completed';
    })
    .reduce((sum, order) => sum + order.total, 0);

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
          <p className="text-gray-600">Kelola pesanan masuk dan status pengerjaan</p>
        </div>
        <Select value={statusFilter} onValueChange={(value: Order['status'] | 'all') => setStatusFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="preparing">Diproses</SelectItem>
            <SelectItem value="ready">Siap</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Perlu diproses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Diproses</CardTitle>
            <ChefHat className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{preparingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Dalam pengerjaan
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siap Diambil</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyOrders}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu pickup
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatIDR(todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Pesanan selesai
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Orders Alert */}
      {(pendingOrders > 0 || readyOrders > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Pesanan Prioritas
            </CardTitle>
            <CardDescription className="text-yellow-700">
              {pendingOrders > 0 && `${pendingOrders} pesanan menunggu diproses`}
              {pendingOrders > 0 && readyOrders > 0 && ' • '}
              {readyOrders > 0 && `${readyOrders} pesanan siap diambil`}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
          <CardDescription>
            Kelola semua pesanan yang masuk ({filteredOrders.length} pesanan)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada pesanan dengan status ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pesanan</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const nextStatus = getNextStatus(order.status);
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {order.id.toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            {order.notes && (
                              <div className="text-sm text-gray-500 truncate max-w-32">
                                {order.notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ScrollArea className="max-h-20 w-48">
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{item.quantity}x</span> {item.tea.name}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            {formatIDR(order.total)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1 w-fit">
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {new Date(order.orderDate).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {nextStatus && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, nextStatus)}
                              variant={order.status === 'ready' ? 'default' : 'outline'}
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(nextStatus)}
                              {getNextStatusText(order.status)}
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
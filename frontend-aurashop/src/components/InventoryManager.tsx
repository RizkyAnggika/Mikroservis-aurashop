import { useState, useEffect } from 'react';
import { Tea } from '@/lib/types';
import { formatIDR } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Plus, Edit, Trash2, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface InventoryManagerProps {
  onTeaUpdated?: () => void;
}

export default function InventoryManager({ onTeaUpdated }: InventoryManagerProps) {
  const [teas, setTeas] = useState<Tea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTea, setEditingTea] = useState<Tea | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'black' as Tea['category'],
    stock: '',
    isAvailable: true,
  });

  useEffect(() => {
    loadTeas();
  }, []);

  const loadTeas = async () => {
    try {
      const teasData = await api.getTeas();
      setTeas(teasData);
    } catch (error) {
      console.error('Error loading teas:', error);
      toast.error('Gagal memuat data inventaris');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'black',
      stock: '',
      isAvailable: true,
    });
    setEditingTea(null);
  };

  const handleOpenDialog = (tea?: Tea) => {
    if (tea) {
      setEditingTea(tea);
      setFormData({
        name: tea.name,
        description: tea.description,
        price: tea.price.toString(),
        image: tea.image,
        category: tea.category,
        stock: tea.stock.toString(),
        isAvailable: tea.isAvailable,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.stock) {
      toast.error('Semua field harus diisi');
      return;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    if (isNaN(price) || price <= 0) {
      toast.error('Harga harus berupa angka positif');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast.error('Stok harus berupa angka non-negatif');
      return;
    }

    try {
      const teaData = {
        name: formData.name,
        description: formData.description,
        price,
        image: formData.image || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
        category: formData.category,
        stock,
        isAvailable: formData.isAvailable && stock > 0,
      };

      if (editingTea) {
        await api.updateTea(editingTea.id, teaData);
        toast.success('Teh berhasil diperbarui');
      } else {
        await api.addTea(teaData);
        toast.success('Teh berhasil ditambahkan');
      }

      await loadTeas();
      onTeaUpdated?.();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tea:', error);
      toast.error('Gagal menyimpan data teh');
    }
  };

  const handleDelete = async (tea: Tea) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${tea.name}"?`)) {
      return;
    }

    try {
      await api.deleteTea(tea.id);
      toast.success('Teh berhasil dihapus');
      await loadTeas();
      onTeaUpdated?.();
    } catch (error) {
      console.error('Error deleting tea:', error);
      toast.error('Gagal menghapus teh');
    }
  };

  const handleStockUpdate = async (teaId: string, stockChange: number) => {
    try {
      await api.updateTeaStock(teaId, stockChange);
      await loadTeas();
      onTeaUpdated?.();
      toast.success('Stok berhasil diperbarui');
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Gagal memperbarui stok');
    }
  };

  const lowStockTeas = teas.filter(tea => tea.stock <= 10);
  const totalValue = teas.reduce((sum, tea) => sum + (tea.price * tea.stock), 0);
  const totalItems = teas.reduce((sum, tea) => sum + tea.stock, 0);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { variant: 'destructive' as const, text: 'Habis' };
    if (stock <= 5) return { variant: 'destructive' as const, text: 'Kritis' };
    if (stock <= 10) return { variant: 'secondary' as const, text: 'Rendah' };
    return { variant: 'default' as const, text: 'Normal' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Package className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2">Memuat inventaris...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Manajemen Inventaris
          </h2>
          <p className="text-gray-600">Kelola stok dan data produk teh</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Teh Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTea ? 'Edit Teh' : 'Tambah Teh Baru'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <div className="space-y-4 pr-4">
                <div>
                  <Label htmlFor="name">Nama Teh *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama teh"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Deskripsi *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Deskripsi teh"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Harga (IDR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stok *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select value={formData.category} onValueChange={(value: Tea['category']) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black">Teh Hitam</SelectItem>
                      <SelectItem value="green">Teh Hijau</SelectItem>
                      <SelectItem value="herbal">Teh Herbal</SelectItem>
                      <SelectItem value="oolong">Teh Oolong</SelectItem>
                      <SelectItem value="white">Teh Putih</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="image">URL Gambar</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Batal
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                {editingTea ? 'Perbarui' : 'Tambah'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teas.length}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockTeas.length} produk stok rendah
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Unit di seluruh inventaris
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Inventaris</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total nilai stok
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockTeas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Peringatan Stok Rendah
            </CardTitle>
            <CardDescription className="text-orange-700">
              {lowStockTeas.length} produk memiliki stok rendah atau habis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockTeas.map(tea => (
                <Badge key={tea.id} variant="secondary" className="text-orange-800 bg-orange-200">
                  {tea.name} ({tea.stock} unit)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Inventaris</CardTitle>
          <CardDescription>
            Kelola semua produk teh dalam inventaris
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teas.map((tea) => {
                  const stockStatus = getStockStatus(tea.stock);
                  return (
                    <TableRow key={tea.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={tea.image}
                            alt={tea.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{tea.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-40">
                              {tea.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {tea.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatIDR(tea.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockUpdate(tea.id, -1)}
                            disabled={tea.stock === 0}
                            className="w-6 h-6 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{tea.stock}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockUpdate(tea.id, 1)}
                            className="w-6 h-6 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.text}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatIDR(tea.price * tea.stock)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(tea)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(tea)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
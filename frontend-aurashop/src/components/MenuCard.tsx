import { useState } from 'react';
import { Tea } from '@/lib/types';
import { formatIDR } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Edit } from 'lucide-react';
import { authService } from '@/lib/auth';

interface MenuCardProps {
  tea: Tea;
  onAddToCart: (tea: Tea) => void;
  onEdit?: (tea: Tea) => void;
}

export default function MenuCard({ tea, onAddToCart, onEdit }: MenuCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const canEdit = authService.canManageMenu();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart(tea);
    } finally {
      setIsLoading(false);
    }
  };

  const getStockBadgeVariant = (stock: number) => {
    if (stock <= 5) return 'destructive';
    if (stock <= 10) return 'secondary';
    return 'default';
  };

  const getStockText = (stock: number) => {
    if (stock <= 5) return 'Stok Menipis';
    if (stock <= 10) return 'Stok Terbatas';
    return `Stok: ${stock}`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={tea.image}
          alt={tea.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop';
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge variant={getStockBadgeVariant(tea.stock)} className="text-xs">
            <Package className="w-3 h-3 mr-1" />
            {getStockText(tea.stock)}
          </Badge>
        </div>
        {canEdit && onEdit && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onEdit(tea)}
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1">
            {tea.name}
          </CardTitle>
          <Badge variant="outline" className="ml-2 text-xs capitalize">
            {tea.category}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-600 line-clamp-2">
          {tea.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-green-600">
          {formatIDR(tea.price)}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!tea.isAvailable || tea.stock === 0 || isLoading}
          className="w-full"
          variant={tea.isAvailable && tea.stock > 0 ? "default" : "secondary"}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {!tea.isAvailable || tea.stock === 0 
            ? 'Stok Habis' 
            : isLoading 
              ? 'Menambahkan...' 
              : 'Tambah ke Keranjang'
          }
        </Button>
      </CardFooter>
    </Card>
  );
}
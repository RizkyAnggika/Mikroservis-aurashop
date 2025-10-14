import { Tea, User } from '@/lib/types';

export const mockTeas: Tea[] = [
  {
    id: '1',
    name: 'Earl Grey Supreme',
    description: 'Premium black tea with bergamot oil and cornflower petals',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
    category: 'black',
    stock: 25,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Dragon Well Green Tea',
    description: 'Delicate Chinese green tea with a sweet, nutty flavor',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    category: 'green',
    stock: 30,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Chamomile Dreams',
    description: 'Soothing herbal blend perfect for evening relaxation',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1597318112874-acd2d4d4d4a4?w=400&h=300&fit=crop',
    category: 'herbal',
    stock: 5,
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Jasmine Phoenix Pearls',
    description: 'Hand-rolled green tea scented with jasmine flowers',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop',
    category: 'green',
    stock: 15,
    isAvailable: true,
  },
  {
    id: '5',
    name: 'Royal Pu-erh',
    description: 'Aged dark tea with rich, earthy flavors',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    category: 'black',
    stock: 20,
    isAvailable: true,
  },
  {
    id: '6',
    name: 'Himalayan White',
    description: 'Rare white tea with subtle sweetness and delicate aroma',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1563822249548-d3a9dc872c07?w=400&h=300&fit=crop',
    category: 'white',
    stock: 8,
    isAvailable: true,
  },
  {
    id: '7',
    name: 'Iron Goddess Oolong',
    description: 'Traditional Chinese oolong with complex floral notes',
    price: 58000,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&h=300&fit=crop',
    category: 'oolong',
    stock: 12,
    isAvailable: true,
  },
  {
    id: '8',
    name: 'Peppermint Fresh',
    description: 'Invigorating herbal tea with cooling peppermint leaves',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1597318112874-acd2d4d4a4a4?w=400&h=300&fit=crop',
    category: 'herbal',
    stock: 22,
    isAvailable: true,
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    name: 'Administrator',
  },
  {
    id: '2',
    username: 'kasir1',
    role: 'kasir',
    name: 'Kasir Satu',
  },
  {
    id: '3',
    username: 'staf1',
    role: 'staf',
    name: 'Staff Satu',
  },
];

export const teaCategories = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'black', label: 'Teh Hitam' },
  { value: 'green', label: 'Teh Hijau' },
  { value: 'herbal', label: 'Teh Herbal' },
  { value: 'oolong', label: 'Teh Oolong' },
  { value: 'white', label: 'Teh Putih' },
];
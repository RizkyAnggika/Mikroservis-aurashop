import { useState, useEffect, useMemo } from "react"
import { Search, Coffee } from "lucide-react"
import { Tea, CartItem } from "@/lib/types"
import { filterTeas, debounce } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import MenuCard from "@/components/MenuCard"
import OrderCart from "@/components/OrderCart"
import { api } from "@/lib/api"
import { teaCategories } from "@/data/mockData"
import { toast } from "sonner"

export default function Shop() {
  const [teas, setTeas] = useState<Tea[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const teasData = await api.getTeas()
        setTeas(teasData)
      } catch (error) {
        console.error("Error loading teas:", error)
        toast.error("Gagal memuat data teh")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const debouncedSearch = useMemo(() => debounce((term: string) => setSearchTerm(term), 300), [])
  const filteredTeas = useMemo(() => filterTeas(teas, searchTerm, selectedCategory), [teas, searchTerm, selectedCategory])

  const handleAddToCart = (tea: Tea) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.tea.id === tea.id)
      if (existingItem) {
        if (existingItem.quantity >= tea.stock) {
          toast.error("Stok tidak mencukupi")
          return prev
        }
        return prev.map(item => item.tea.id === tea.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { tea, quantity: 1 }]
    })
    toast.success(`${tea.name} ditambahkan ke keranjang`)
  }

  const handleUpdateQuantity = (teaId: string, quantity: number) =>
    setCartItems(prev => prev.map(item => item.tea.id === teaId ? { ...item, quantity } : item))

  const handleRemoveItem = (teaId: string) => {
    setCartItems(prev => prev.filter(item => item.tea.id !== teaId))
    toast.success("Item dihapus dari keranjang")
  }

  const handleClearCart = () => {
    setCartItems([])
    toast.success("Keranjang dikosongkan")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 mx-auto mb-4 animate-spin text-green-600" />
          <p className="text-gray-600">Memuat menu teh...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      {/* Header sederhana (tanpa login) */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coffee className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">TeaShop</h1>
                <p className="text-sm text-gray-600">Premium Tea Collection</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Selamat Datang di
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-amber-600">
                TeaShop Premium
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Nikmati koleksi teh premium terbaik dari seluruh dunia.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <Badge variant="secondary" className="px-4 py-2"><Coffee className="w-4 h-4 mr-2" />100% Premium Quality</Badge>
              <Badge variant="secondary" className="px-4 py-2">🌿 Organic & Natural</Badge>
              <Badge variant="secondary" className="px-4 py-2">🚚 Fresh Daily Delivery</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input placeholder="Cari teh favorit Anda..." className="pl-10 h-12"
                       onChange={(e) => debouncedSearch(e.target.value)} />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {teaCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Menu Teh Premium</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">Pilihan teh berkualitas tinggi yang dipilih khusus.</p>
            <Separator className="w-24 mx-auto mt-6" />
          </div>

          {filteredTeas.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="text-center py-12">
                <Coffee className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">Tidak ada teh yang ditemukan</h4>
                <p className="text-gray-500">Coba ubah kata kunci pencarian atau kategori</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTeas.map((tea) => (
                <MenuCard key={tea.id} tea={tea} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Coffee className="w-8 h-8 text-green-400" />
              <h4 className="text-2xl font-bold">TeaShop</h4>
            </div>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Menghadirkan pengalaman minum teh premium dengan kualitas terbaik.
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-400">
              <span>📞 (021) 123-4567</span>
              <span>📧 info@teashop.id</span>
              <span>📍 Jakarta, Indonesia</span>
            </div>
            <Separator className="my-6 bg-gray-700" />
            <p className="text-sm text-gray-500">© 2024 TeaShop. Dibuat dengan ❤️ menggunakan React & TypeScript.</p>
          </div>
        </div>
      </footer>

      {/* Floating Cart */}
      <OrderCart
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  )
}

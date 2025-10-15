import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Tea, CartItem } from "@/lib/types"
import { api } from "@/lib/api"
import { filterTeas, debounce } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import POSMenuCard from "@/components/pos/POSMenuCard"
import POSCart from "@/components/pos/POSCart"
import { teaCategories } from "@/data/mockData"
import { toast } from "sonner"
import OrderManager from "@/components/OrderManager" // komponen riwayat lama

export default function StaffDashboard() {
  const [teas, setTeas] = useState<Tea[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getTeas()  // atau import { mockTeas } dan pakai langsung
        setTeas(data.filter(t => t.isAvailable))
      } catch (e) {
        console.error(e)
        toast.error("Gagal memuat menu")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const debouncedSearch = useMemo(() => debounce((term: string) => setSearchTerm(term), 300), [])
  const filtered = useMemo(
    () => filterTeas(teas, searchTerm, selectedCategory),
    [teas, searchTerm, selectedCategory]
  )

  const handleAdd = (item: Tea) => {
    setCartItems(prev => {
      const found = prev.find(i => i.tea.id === item.id)
      if (found) {
        if (found.quantity >= item.stock) {
          toast.error("Stok tidak mencukupi")
          return prev
        }
        return prev.map(i => i.tea.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { tea: item, quantity: 1 }]
    })
  }

  const handleUpdateQty = (id: string, qty: number) =>
    setCartItems(prev => prev.map(i => i.tea.id === id ? { ...i, quantity: qty } : i))

  const handleRemove = (id: string) =>
    setCartItems(prev => prev.filter(i => i.tea.id !== id))

  const handleClear = () => setCartItems([])

  const handleSave = () => {
    localStorage.setItem("pos_draft", JSON.stringify(cartItems))
    toast.success("Draft pesanan disimpan")
  }

  const handlePay = async ({ total, extra, notes }: { total: number; extra: number; notes?: string }) => {
    try {
      // contoh integrasi backend:
      // await api.createOrder({ items: cartItems, total, extra, notes })
      toast.success(`Pembayaran berhasil. Total Rp ${total.toLocaleString("id-ID")}`)
      setCartItems([])
    } catch {
      toast.error("Gagal memproses pembayaran")
    }
  }

  useEffect(() => {
    // render komponen riwayat ke dalam dialog slot
    const slot = document.getElementById("order-history-slot")
    if (!slot) return
    const mount = document.createElement("div")
    slot.appendChild(mount)
    // Render manual: React 18 root terpisah
    import("react-dom/client").then(({ createRoot }) => {
      const root = createRoot(mount)
      root.render(<OrderManager onOrderUpdated={() => {}} />)
    })
    return () => {
      slot.innerHTML = ""
    }
  }, [])

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Memuat menu…</div>

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Search & Kategori */}
        <div className="mb-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Cari menu…" className="pl-10 h-11"
                   onChange={(e) => debouncedSearch(e.target.value)} />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-56 h-11">
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              {teaCategories.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid: 8 / 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <POSMenuCard
                  key={item.id}
                  item={item}
                  isSelected={!!cartItems.find(ci => ci.tea.id === item.id)}
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
              onSave={handleSave}
              onPay={handlePay}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

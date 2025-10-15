import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Trash2, Minus, Plus } from "lucide-react"
import { CartItem } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Props = {
  cartItems: CartItem[]
  onUpdateQuantity: (teaId: string, qty: number) => void
  onRemoveItem: (teaId: string) => void
  onClearCart: () => void
  onSave?: () => void
  onPay?: (payload: { total: number; extra: number; notes?: string }) => void
}

export default function POSCart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSave,
  onPay
}: Props) {
  const [extra, setExtra] = useState<number>(0)
  const [notes, setNotes] = useState<string>("")

  const subTotal = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.tea.price * it.quantity, 0),
    [cartItems]
  )
  const total = subTotal + (extra || 0)

  return (
    <div className="sticky top-4">
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="p-4">
          <div className="font-semibold mb-2">Pesanan</div>
          <Separator className="mb-3" />

          {cartItems.length === 0 ? (
            <div className="text-sm text-muted-foreground py-10 text-center">
              Keranjang kosong. Pilih menu di sebelah kiri.
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.tea.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{item.tea.name}</div>
                    <div className="text-[12px] text-muted-foreground">
                      Rp {item.tea.price.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => onUpdateQuantity(item.tea.id, Math.max(1, item.quantity - 1))}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="w-8 text-center">{item.quantity}</div>
                    <Button variant="outline" size="icon" onClick={() => onUpdateQuantity(item.tea.id, item.quantity + 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.tea.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator className="my-3" />

          {/* Biaya tambahan + catatan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Biaya Tambahan</span>
              <Input
                type="number"
                value={String(extra ?? 0)}
                onChange={(e) => setExtra(Number(e.target.value || 0))}
                className="w-36 h-9"
                placeholder="0"
              />
            </div>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan (opsional)"
              className="h-9"
            />
          </div>

          <Separator className="my-3" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Total</div>
            <div className="text-2xl font-extrabold text-red-600">
              Rp {total.toLocaleString("id-ID")}
            </div>
          </div>

          {/* Aksi */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={onClearCart}>Kosongkan</Button>
            <Button onClick={() => onSave?.()}>Simpan</Button>
            <Button
              className="col-span-1"
              onClick={() => onPay?.({ total, extra, notes })}
              disabled={cartItems.length === 0}
            >
              Bayar
            </Button>
          </div>
        </div>
      </div>

      {/* Riwayat Order (pakai komponen lama via slot) */}
      <div className="mt-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">Lihat Riwayat Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader><DialogTitle>Riwayat Order</DialogTitle></DialogHeader>
            <div id="order-history-slot" />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

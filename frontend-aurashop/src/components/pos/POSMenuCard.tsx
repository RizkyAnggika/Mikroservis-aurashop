import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Tea } from "@/lib/types"
import { cn } from "@/lib/utils"

const fmtIDR = (v: number | string) => {
  const n = typeof v === "string" ? Number(v) : v;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

type Props = {
  item: Tea
  isSelected?: boolean
  onAdd: (item: Tea) => void
}

function POSMenuCardBase({ item, isSelected, onAdd }: Props) {
  const disabled = !item.isAvailable || item.stock <= 0
  return (
    <Card
      className={cn(
        "group overflow-hidden cursor-pointer hover:shadow-md transition",
        isSelected && "ring-2 ring-green-500",
        disabled && "opacity-60 pointer-events-none"
      )}
      onClick={() => onAdd(item)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover group-hover:scale-105 transition"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-400">No Image</div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="text-sm font-medium line-clamp-2">{item.name}</div>
        <div className="mt-1 text-[12px] text-muted-foreground line-clamp-2">
          {item.description}
        </div>
        <div className="mt-1 text-[12px] text-muted-foreground">Stok: {item.stock}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold">{fmtIDR(item.price)}</span>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onAdd(item)
            }}
          >
            + Tambah
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const POSMenuCard = memo(POSMenuCardBase)
export default POSMenuCard

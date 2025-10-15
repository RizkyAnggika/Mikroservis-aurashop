import { Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import InventoryManager from "@/components/InventoryManager"
import { toast } from "sonner"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header Admin sederhana (tanpa auth UI) */}
      <header className="bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">TeaShop Management System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Konten */}
      <div className="container mx-auto px-4 py-8">
        <InventoryManager onTeaUpdated={() => toast.success("Data teh diperbarui")} />
      </div>
    </div>
  )
}

import { ReactNode } from "react"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      {children}
    </div>
  )
}

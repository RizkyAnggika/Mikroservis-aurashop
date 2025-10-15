import React from "react"
import ReactDOM from "react-dom/client"
import "@/index.css"
import AdminDashboard from "@/pages/AdminDashboard"
import { Toaster } from "sonner"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminDashboard />
    <Toaster richColors position="top-right" />
  </React.StrictMode>
)

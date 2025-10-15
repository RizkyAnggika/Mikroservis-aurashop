import React from "react"
import ReactDOM from "react-dom/client"
import "@/index.css"
import StaffDashboard from "@/pages/StaffDashboard"
import { Toaster } from "sonner"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StaffDashboard />
    <Toaster richColors position="top-right" />
  </React.StrictMode>
)

import React from "react"
import ReactDOM from "react-dom/client"
import "@/index.css"
import Shop from "@/pages/Shop"
import { Toaster } from "sonner"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Shop />
    <Toaster richColors position="top-right" />
  </React.StrictMode>
)

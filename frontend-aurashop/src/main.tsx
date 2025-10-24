import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import "@/index.css"

import Shop from "@/pages/Shop"
import AdminDashboard from "@/pages/AdminDashboard"
import StaffDashboard from "@/pages/StaffDashboard"
import NotFound from "@/pages/NotFound"

function RequireAuth({ children }: { children: React.ReactNode }) {
  const allowed = true
  return allowed ? <>{children}</> : <Navigate to="/" replace />
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <StaffDashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

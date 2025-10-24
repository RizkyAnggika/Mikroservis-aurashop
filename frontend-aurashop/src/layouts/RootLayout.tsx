import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* 🔥 Background gambar fix: selalu di belakang, full screen */}
      <img
        src="/bg_apk.png"           // file di public/bg_apk.png
        alt=""
        className="fixed inset-0 w-full h-full object-cover -z-50 pointer-events-none select-none"
      />

      {/* ⛔️ TIDAK ADA overlay di sini */}
      <main className="relative min-h-screen bg-transparent">
        {children}
      </main>
    </div>
  );
}

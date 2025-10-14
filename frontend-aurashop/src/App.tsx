import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow border p-8 text-center">
        <div className="flex items-center justify-center gap-6 mb-6">
          <a href="https://vite.dev" target="_blank" rel="noreferrer">
            <img
              src={viteLogo}
              alt="Vite"
              className="h-14 transition hover:drop-shadow-lg"
            />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img
              src={reactLogo}
              alt="React"
              className="h-14 transition hover:drop-shadow-lg"
            />
          </a>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Vite + React + Tailwind</h1>
        <p className="mt-2 text-gray-600">
          Edit <code className="font-mono">src/App.tsx</code> dan simpan untuk HMR.
        </p>

        <button
          onClick={() => setCount((c) => c + 1)}
          className="mt-6 w-full rounded-xl px-4 py-3 font-medium bg-indigo-600 text-white hover:opacity-90 transition"
        >
          Klik aku ({count})
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Count disimpan di state React (hot reload aman).
        </p>
      </div>
    </main>
  );
}

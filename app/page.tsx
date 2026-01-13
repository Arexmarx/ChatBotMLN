'use client'
import Headers from "../components/layout/Header";
import HomePage from "@/components/common/HomePage";
import { getHomeViewCount } from "./api/countApi";

export default async function Home() {
  const viewCount = await getHomeViewCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-white font-sans">
      <Headers />
      <div className="mx-auto flex w-full max-w-7xl justify-end px-6 pt-6">
        <div className="rounded-full bg-white/80 px-4 py-2 text-sm text-gray-600 shadow-sm">
          {viewCount !== null ? `Số lượt đã hiển thị: ${viewCount.toLocaleString("vi-VN")}` : "Dang cap nhat luot xem..."}
        </div>
      </div>
      <main className="mx-auto flex max-w-7xl flex-1 flex-col px-6 py-10">
        <HomePage />
      </main>
    </div>
  );
}

"use client";
import Headers from "../components/layout/Header";
import HomePage from "@/components/common/HomePage";
import { useEffect, useState } from "react";

export default function Home() {
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchViewCount() {
      try {
        const response = await fetch('/api/counter');
        const data = await response.json();
        setViewCount(data.count);
      } catch (error) {
        console.error('Failed to fetch view count:', error);
        setViewCount(null);
      }
    }

    fetchViewCount();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-white font-sans">
      <Headers />
      <div className="mx-auto flex w-full max-w-7xl justify-end px-6 pt-6">
        <div className="rounded-full bg-white/80 px-4 py-2 text-sm text-gray-600 shadow-sm">
          {viewCount !== null ? `Số lượt đã hiển thị: ${viewCount.toLocaleString("vi-VN")}` : "Đang cập nhật lượt xem..."}
        </div>
      </div>
      <main className="mx-auto flex max-w-7xl flex-1 flex-col px-6 py-10">
        <HomePage />
      </main>
    </div>
  );
}

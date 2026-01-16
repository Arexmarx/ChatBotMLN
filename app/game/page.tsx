import type { Metadata } from "next";
import GameClient from "./GameClient";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Quiz Game | Tìm hiểu Dân chủ XHCN",
  description: "Thử thách kiến thức với 12 câu hỏi ngẫu nhiên về nền Dân chủ Xã hội chủ nghĩa và ghi điểm trên bảng xếp hạng.",
};

export default function GamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-white font-sans">
      <Header />
      <div className="px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <main className="max-w-4xl mx-auto">
          <GameClient />
        </main>
      </div>
    </div>
  );
}
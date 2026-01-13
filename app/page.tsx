import Headers from "../components/layout/Header";
import HomePage from "@/components/common/HomePage";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-white font-sans">
      <Headers />
      <main className="mx-auto flex max-w-7xl flex-1 flex-col px-6 py-10">
        <HomePage />
      </main>
    </div>
  );
}

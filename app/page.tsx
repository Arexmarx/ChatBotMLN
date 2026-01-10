import Headers from "../components/layout/Header";
import HomePage from "@/components/common/HomePage";
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Headers/>
      <HomePage/>
    </div>
  );
}

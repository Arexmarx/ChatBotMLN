import type { Metadata } from "next";
import SlidesContent from "./SlidesContent";

export const metadata: Metadata = {
  title: "Kho tư liệu",
  description:
    "Kho tư liệu trình bày dưới dạng slide tương tác, tổng hợp kiến thức về chủ nghĩa xã hội khoa học và lịch sử Việt Nam.",
};

export default function SlidesPage() {
  return <SlidesContent />;
}

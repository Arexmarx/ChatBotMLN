import type { Metadata } from "next";
import SlidesProduct from "./SlidesProduct";

export const metadata: Metadata = {
  title: "Về sản phẩm",
  description: "Slides giới thiệu sản phẩm với nội dung trực quan, dễ tiếp cận.",
};

export default function DocsPage() {
  return <SlidesProduct />;
}

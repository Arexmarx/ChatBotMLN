import React from "react";
import Link from "next/link";
import { Bot, Library, Network, GraduationCap, ArrowRight } from "lucide-react";

const pillars = [
  {
    title: "Nền tảng lý luận",
    description:
      "Hiểu rõ các nguyên lý của chủ nghĩa Mác - Lênin và sự phát triển của khoa học xã hội học.",
    icon: GraduationCap,
  },
  {
    title: "Liên hệ lịch sử",
    description:
      "Phân tích tiến trình cách mạng Việt Nam qua từng giai đoạn gắn liền với phong trào công nhân thế giới.",
    icon: Library,
  },
  {
    title: "Ứng dụng hiện tại",
    description:
      "Đối thoại cùng AI để khám phá các luận điểm về con đường đi lên chủ nghĩa xã hội của Việt Nam.",
    icon: Network,
  },
];

const timeline = [
  {
    year: "1848",
    title: "Tuyên ngôn Đảng Cộng sản",
    description: "Cơ sở lý luận nền tảng do C. Mác và Ph. Ăng-ghen xây dựng.",
  },
  {
    year: "1917",
    title: "Cách mạng Tháng Mười Nga",
    description: "Biến lý luận thành hiện thực, mở ra thời đại quá độ lên CNXH trên thế giới.",
  },
  {
    year: "1930",
    title: "Đảng Cộng sản Việt Nam ra đời",
    description: "Đánh dấu sự kết hợp chủ nghĩa Mác - Lênin với phong trào công nhân và yêu nước Việt Nam.",
  },
  {
    year: "Đổi mới",
    title: "Từ 1986 đến nay",
    description: "Kiên định mục tiêu xã hội chủ nghĩa, sáng tạo mô hình phát triển phù hợp thực tiễn Việt Nam.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 text-gray-900">
      <section className="overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-amber-50 shadow-lg">
        <div className="grid gap-10 px-10 py-14 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
              <Bot className="h-4 w-4" />
              Scientific Socialism
            </span>
            <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              Khám phá chủ nghĩa xã hội khoa học qua đối thoại thông minh
            </h1>
            <p className="text-base text-gray-600 md:text-lg">
              Việt Sử Chatbot đồng hành cùng bạn nghiên cứu các luận điểm cốt lõi của
              chủ nghĩa xã hội khoa học, từ nền tảng lý luận đến thực tiễn cách mạng ở Việt Nam.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
              >
                Bắt đầu trò chuyện
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/kien-thuc"
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Xem kho tư liệu
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-6 hidden h-20 w-20 rounded-full bg-red-200 blur-2xl md:block" />
            <div className="absolute -right-16 bottom-0 hidden h-32 w-32 rounded-full bg-amber-200 blur-3xl md:block" />
            <div className="relative rounded-2xl border border-red-100 bg-white/80 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold text-red-600">
                Cấu trúc học tập đề xuất
              </h2>
              <ul className="mt-5 space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  Cơ sở hình thành và phát triển của chủ nghĩa xã hội khoa học.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  Những luận điểm về sứ mệnh lịch sử của giai cấp công nhân.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  Các mô hình xây dựng CNXH và kinh nghiệm Việt Nam thời kỳ đổi mới.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  Ứng dụng tư tưởng khoa học xã hội trong giáo dục và truyền thông.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {pillars.map((item) => (
          <article
            key={item.title}
            className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <item.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-gray-900">
              {item.title}
            </h3>
            <p className="mt-3 text-sm text-gray-600">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Dòng thời gian chủ nghĩa xã hội khoa học
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          Ôn lại những mốc son quan trọng đã định hướng con đường xây dựng xã hội mới của nhân loại và Việt Nam.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {timeline.map((milestone) => (
            <div
              key={milestone.year}
              className="rounded-2xl border border-red-100 bg-red-50/60 p-5"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-red-500">
                {milestone.year}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">
                {milestone.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{milestone.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useCallback, useRef } from "react";
import Header from "@/components/layout/Header";

const CANVA_EMBED_URL = "https://www.canva.com/design/DAG-AmGc7Ok/TmDLZweAVE7m8b2pgDs3_A/view?embed";
const CANVA_DIRECT_URL = "https://www.canva.com/design/DAG-AmGc7Ok/TmDLZweAVE7m8b2pgDs3_A/view";

type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => void;
};

export default function SlidesContent() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const handleFullscreen = useCallback(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const element = section as FullscreenCapableElement;

    const boundRequest =
      element.requestFullscreen?.bind(element) ??
      element.webkitRequestFullscreen?.bind(element) ??
      element.mozRequestFullScreen?.bind(element) ??
      (element.msRequestFullscreen
        ? () => {
            element.msRequestFullscreen?.();
          }
        : null);

    if (boundRequest) {
      try {
        const result = boundRequest();
        if (result && typeof (result as Promise<void>).catch === "function") {
          (result as Promise<void>).catch((error) => {
            console.error("Fullscreen request failed", error);
          });
        }
      } catch (error) {
        console.error("Fullscreen request failed", error);
      }
      return;
    }

    // Fall back to directly requesting fullscreen on the iframe if the section is unsupported.
    const iframe = section.querySelector("iframe") as FullscreenCapableElement | null;
    const iframeRequest = iframe?.requestFullscreen?.bind(iframe);
    if (iframeRequest) {
      try {
        const result = iframeRequest();
        if (result && typeof (result as Promise<void>).catch === "function") {
          (result as Promise<void>).catch((error) => {
            console.error("Fullscreen request failed", error);
          });
        }
      } catch (error) {
        console.error("Fullscreen request failed", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-white font-sans">
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 text-gray-900 dark:text-gray-100">
        <section
          ref={sectionRef}
          className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <iframe
            title="Kho tư liệu Canva"
            src={CANVA_EMBED_URL}
            className="h-[70vh] w-full rounded-2xl border-0"
            allow="fullscreen"
            allowFullScreen
            loading="lazy"
          />
        </section>

        <footer className="flex flex-col gap-4 rounded-3xl border border-red-100 bg-white/90 p-6 text-sm text-gray-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-gray-300 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-1 text-center md:text-left">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Trải nghiệm slides tốt nhất ở chế độ toàn màn hình.
            </p>
            <p>
              Sử dụng nút bên phải để mở trực tiếp trong Canva hoặc phóng to trong trang này.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:justify-end">
            <a
              href={CANVA_DIRECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-400/60 dark:text-red-400 dark:hover:bg-red-400/10"
            >
              Mở Canva
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

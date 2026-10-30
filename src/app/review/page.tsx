import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { ReviewClient } from "@/components/site/ReviewClient";

// Landing page behind the review QR code: no header, footer or pop-up, so nothing distracts from the review.
const GOOGLE_REVIEW_URL = "https://g.page/r/CYZ70nvJaRk1EBM/review";

export const metadata: Metadata = { title: "Review Softgress on Google", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#04060F" };

export default function ReviewPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(120%_60%_at_50%_0%,#172440_0%,#04060F_70%)] px-4 pb-8 pt-6 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-center gap-2.5">
          <Image src="/brand/softgress-mark.png" alt="" width={32} height={32} priority className="h-8 w-8" />
          <span className="font-display text-[20px] font-bold tracking-tight">Softgress</span>
        </div>
        <ReviewClient reviewUrl={GOOGLE_REVIEW_URL} />
      </div>
    </main>
  );
}

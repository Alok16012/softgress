import type { Metadata } from "next";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { ReviewClient } from "@/components/site/ReviewClient";

// Landing page behind the review QR code. Kept out of search results.
const GOOGLE_REVIEW_URL = "https://g.page/r/CYZ70nvJaRk1EBM/review";

export const metadata: Metadata = { title: "Review Softgress on Google", robots: { index: false, follow: false } };

export default function ReviewPage() {
  return (
    <>
      <PageHero eyebrow="Thank you" title="Review us on Google" accent="Your feedback helps other businesses find us.">
        <div className="mt-2 max-w-xl">
          <ReviewClient reviewUrl={GOOGLE_REVIEW_URL} />
        </div>
      </PageHero>
      <SiteFooter cta={false} />
    </>
  );
}

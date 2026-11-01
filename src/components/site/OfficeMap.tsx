import { GEO } from "@/lib/seo";
import { office } from "@/content/company";

/** Google Map of the Akurdi office (the Business Profile pin), lazy-loaded so it never slows the page. */
export function OfficeMap({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[24px] border border-ink/10 ${className}`}>
      <iframe
        title="Softgress office on Google Maps, Akurdi, Pimpri-Chinchwad"
        src={`https://maps.google.com/maps?q=${GEO.latitude},${GEO.longitude}&z=16&output=embed`}
        className="block h-[320px] w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a href={office.mapsUrl} target="_blank" rel="noopener noreferrer" className="block bg-paper px-5 py-3 text-[15px] font-medium text-teal-dark hover:underline">
        Open Softgress Pvt Ltd in Google Maps
      </a>
    </div>
  );
}

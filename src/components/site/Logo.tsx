import Image from "next/image";
import Link from "next/link";

/** Brand lock-up for dark surfaces: the gradient "S" mark (from assets/) with a white wordmark. */
export function Logo({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 text-white ${className}`} aria-label="Softgress home">
      <Image src="/brand/softgress-mark.png" alt="" width={36} height={36} priority={priority} className="h-9 w-9" />
      <span className="font-display text-[22px] font-bold tracking-tight">Softgress</span>
    </Link>
  );
}

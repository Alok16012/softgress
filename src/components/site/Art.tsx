import Image from "next/image";
import { Bot, Building2, CodeXml, Megaphone, Palette, Presentation, type LucideIcon } from "lucide-react";
import clsx from "clsx";

const ICONS: Record<string, LucideIcon> = {
  reception: Building2,
  software: CodeXml,
  marketing: Megaphone,
  creative: Palette,
  automation: Bot,
  strategy: Presentation,
};

const DEPARTMENT_IMAGES: Record<string, string> = {
  software: "/images/software.webp",
  marketing: "/images/marketing.webp",
  creative: "/images/creative.webp",
  automation: "/images/automation.webp",
  strategy: "/images/strategy.webp",
};

const PROJECT_IMAGES: Record<string, { src: string; alt: string }> = {
  "sample-d2c-storefront": {
    src: "/images/storefront.webp",
    alt: "Illustrative ceramics storefront concept on a laptop beside handmade bowls.",
  },
  "sample-clinic-lead-funnel": {
    src: "/images/clinic.webp",
    alt: "Illustrative clinic booking concept with a mobile appointment calendar and location pin.",
  },
  "sample-field-service-saas": {
    src: "/images/field-service.webp",
    alt: "Illustrative field-service dashboard concept with a job calendar and mobile route map.",
  },
  "sample-cafe-rebrand": {
    src: "/images/cafe.webp",
    alt: "Illustrative café identity concept with terracotta coffee packaging, menu and coaster.",
  },
};

export function deptIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? ICONS.reception;
}

/** Original generated artwork; adjacent department headings provide the accessible label. */
export function DeptArt({ slug, className }: { slug: string; uid: string; className?: string }) {
  return (
    <div aria-hidden className={clsx("relative overflow-hidden rounded-[20px] bg-midnight", className)}>
      <Image
        src={DEPARTMENT_IMAGES[slug] ?? DEPARTMENT_IMAGES.strategy}
        alt=""
        fill
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 640px"
        className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04060f]/90 via-transparent to-transparent" />
    </div>
  );
}

export function ProjectArt({ slug, departmentSlug, className }: { slug: string; departmentSlug: string; className?: string }) {
  const image = PROJECT_IMAGES[slug];
  if (!image) return <DeptArt slug={departmentSlug} uid={slug} className={className} />;
  return (
    <div className={clsx("relative overflow-hidden rounded-[32px] bg-midnight", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 640px"
        className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
      />
    </div>
  );
}

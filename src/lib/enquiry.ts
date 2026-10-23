import type { EnquiryServiceGroup } from "@/components/site/EnquiryForm";
import type { Department, Service } from "@/lib/types";

/** Services grouped by active department, for the enquiry form's "I'm interested in" menu. */
export function enquiryGroups(departments: Department[], services: Service[]): EnquiryServiceGroup[] {
  return departments
    .filter((d) => d.slug !== "reception" && d.active)
    .map((d) => ({ name: d.name, services: services.filter((s) => s.departmentSlug === d.slug).map((s) => ({ slug: s.slug, title: s.title })) }))
    .filter((g) => g.services.length > 0);
}

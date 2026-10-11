import { departments } from "@/content/departments";
import { services } from "@/content/services";
import { staff } from "@/content/staff";
import { knowledgeDocuments } from "@/content/knowledge";
import { projects } from "@/content/projects";
import { assetManifest } from "@/content/assets";
import type { Db } from "./driver";

/**
 * Idempotent seed. Inserts missing rows only (`on conflict do nothing`) so admin
 * edits are never overwritten by a re-seed.
 */
export async function seed(db: Db) {
  await db.tx(async (tx) => {
    for (const [i, d] of departments.entries()) {
      await tx.query(
        `insert into public.departments (slug, name, short_name, description, scene_id, active, sort_order)
         values ($1,$2,$3,$4,$5,$6,$7) on conflict (slug) do nothing`,
        [d.slug, d.name, d.shortName, d.description, d.sceneId, d.active, i],
      );
    }
    for (const [i, s] of services.entries()) {
      await tx.query(
        `insert into public.services (department_id, slug, title, summary, description, deliverables,
           process, what_we_need, keywords, pricing_type, starting_price, currency, active, sort_order)
         select d.id, $2, $3, $4, $5, $6::text::jsonb, $7::text::jsonb, $8::text::jsonb, $9::text::jsonb, $10, $11, $12, $13, $14
         from public.departments d where d.slug = $1
         on conflict (slug) do nothing`,
        [
          s.departmentSlug, s.slug, s.title, s.summary, s.description,
          JSON.stringify(s.deliverables), JSON.stringify(s.process), JSON.stringify(s.whatWeNeed),
          JSON.stringify(s.keywords), s.pricingType, s.startingPrice, s.currency, s.active, i,
        ],
      );
    }
    for (const r of staff) {
      await tx.query(
        `insert into public.virtual_staff (id, department_id, display_name, role_title, config)
         select $1, d.id, $3, $4, $5::text::jsonb from public.departments d where d.slug = $2
         on conflict (id) do nothing`,
        [r.id, r.departmentSlug, r.displayName, r.roleTitle, JSON.stringify(r)],
      );
    }
    for (const k of knowledgeDocuments) {
      await tx.query(
        `insert into public.knowledge_documents (id, department_id, title, body, visibility, approved_at, version, is_seed)
         values ($1, (select id from public.departments where slug = $2), $3, $4, $5, $6, $7, $8)
         on conflict (id) do nothing`,
        [k.id, k.departmentSlug, k.title, k.body, k.visibility, k.approvedAt, k.version, k.isSeed],
      );
    }
    for (const p of projects) {
      await tx.query(
        `insert into public.projects (slug, title, summary, body, industry, service_slugs, is_sample, published)
         values ($1,$2,$3,$4,$5, array(select jsonb_array_elements_text($6::text::jsonb)), $7, $8)
         on conflict (slug) do nothing`,
        [p.slug, p.title, p.summary, p.body, p.industry, JSON.stringify(p.serviceSlugs), p.isSample, p.published],
      );
    }
    for (const a of assetManifest) {
      await tx.query(
        `insert into public.asset_manifest (id, zone, name, kind, status, source, license, url, triangle_budget, notes)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict (id) do nothing`,
        [a.id, a.zone, a.name, a.kind, a.status, a.source, a.license, a.url, a.triangleBudget, a.notes],
      );
    }
  });
}

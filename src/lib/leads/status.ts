import { z } from "zod";
import { normalisePhone } from "./schema";

export const referenceSchema = z
  .string()
  .transform((s) => s.trim().toUpperCase())
  .pipe(z.string().regex(/^SG-[0-9A-Z]{4}-[0-9A-Z]{4}$/, "Reference looks like SG-XXXX-XXXX"));

export const requestCodeSchema = z
  .object({
    reference: referenceSchema,
    contact: z.string().trim().min(3).max(254),
  })
  .transform((v) => {
    const isEmail = v.contact.includes("@");
    return {
      reference: v.reference,
      email: isEmail ? v.contact.toLowerCase() : undefined,
      phone: isEmail ? undefined : normalisePhone(v.contact) ?? undefined,
    };
  });

export const verifyCodeSchema = z.object({
  reference: referenceSchema,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const codeHash = (reference: string, code: string, secret: string) => `${reference}:${code}:${secret}`;

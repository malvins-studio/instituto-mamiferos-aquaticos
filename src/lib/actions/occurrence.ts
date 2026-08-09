"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formSchema, type OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";
import {
  OccurrenceMappingError,
  toOccurrenceCreateInput,
} from "@/lib/actions/occurrence-mappers";

export type CreateOccurrenceResult =
  | { success: true; id: string }
  | { success: false; errors: Record<string, string> };

async function persistOccurrence(
  values: OccurrenceFormValues,
  persist: (data: Prisma.OccurrenceCreateInput) => Promise<{ id: string }>
): Promise<CreateOccurrenceResult> {
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in errors)) {
        errors[field] = issue.message;
      }
    }
    return { success: false, errors };
  }

  try {
    const data = toOccurrenceCreateInput(parsed.data);
    const occurrence = await persist(data);
    return { success: true, id: occurrence.id };
  } catch (error) {
    if (error instanceof OccurrenceMappingError) {
      return { success: false, errors: { [error.field]: error.message } };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        errors: { tomboIma: "Já existe um registro com este Tombo IMA." },
      };
    }
    throw error;
  }
}

export async function createOccurrence(
  values: OccurrenceFormValues
): Promise<CreateOccurrenceResult> {
  return persistOccurrence(values, (data) => prisma.occurrence.create({ data }));
}

export async function updateOccurrence(
  id: string,
  values: OccurrenceFormValues
): Promise<CreateOccurrenceResult> {
  return persistOccurrence(values, (data) =>
    prisma.occurrence.update({ where: { id }, data })
  );
}

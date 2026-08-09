// src/lib/actions/occurrence-queries.ts
import { Prisma, type Occurrence } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type OccurrenceSituacao = "aberto" | "encerrado" | "todos";

export type OccurrenceListItem = Pick<
  Occurrence,
  "id" | "tomboIma" | "especie" | "nomeComum" | "dataOcorrencia" | "destinoFinal"
>;

export async function listOccurrences(params: {
  situacao?: OccurrenceSituacao;
  busca?: string;
}): Promise<OccurrenceListItem[]> {
  const { situacao = "todos", busca } = params;

  const where: Prisma.OccurrenceWhereInput = {};

  if (situacao === "aberto") {
    where.destinoFinal = null;
  } else if (situacao === "encerrado") {
    where.destinoFinal = { not: null };
  }

  if (busca) {
    where.OR = [
      { tomboIma: { contains: busca, mode: "insensitive" } },
      { especie: { contains: busca, mode: "insensitive" } },
      { municipio: { contains: busca, mode: "insensitive" } },
    ];
  }

  return prisma.occurrence.findMany({
    where,
    orderBy: { dataOcorrencia: "desc" },
    select: {
      id: true,
      tomboIma: true,
      especie: true,
      nomeComum: true,
      dataOcorrencia: true,
      destinoFinal: true,
    },
  });
}

export async function getOccurrence(id: string): Promise<Occurrence | null> {
  return prisma.occurrence.findUnique({ where: { id } });
}

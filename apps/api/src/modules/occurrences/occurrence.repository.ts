import { Injectable } from "@nestjs/common";
import { prisma, type Occurrence, type Prisma } from "@siima/database";

export type OccurrenceListItem = Pick<
  Occurrence,
  "id" | "tomboIma" | "especie" | "nomeComum" | "dataOcorrencia" | "destinoFinal"
>;

@Injectable()
export class OccurrenceRepository {
  create(data: Prisma.OccurrenceCreateInput): Promise<Occurrence> {
    return prisma.occurrence.create({ data });
  }

  update(id: string, data: Prisma.OccurrenceUpdateInput): Promise<Occurrence> {
    return prisma.occurrence.update({ where: { id }, data });
  }

  findMany(where: Prisma.OccurrenceWhereInput): Promise<OccurrenceListItem[]> {
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

  findById(id: string): Promise<Occurrence | null> {
    return prisma.occurrence.findUnique({ where: { id } });
  }
}

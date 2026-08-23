import { Prisma, type Occurrence } from "@siima/database";
import type { OccurrenceFormValues } from "@siima/shared";
import { OccurrenceRepository, type OccurrenceListItem } from "./occurrence.repository";
import { OccurrenceService } from "./occurrence.service";

function buildValidValues(
  overrides: Partial<OccurrenceFormValues> = {}
): OccurrenceFormValues {
  return {
    tomboIma: "IMA00001",
    responsavelRegistro: "Fulano de Tal",
    dataOcorrencia: "2026-08-20",
    horarioColeta: "14:30",
    uf: "RJ",
    municipio: "Angra dos Reis",
    localEspecifico: "Praia Vermelha",
    latitude: "-23.0",
    longitude: "-44.3",
    tipoEntrada: "Entrega voluntária",
    statusAnimal: "Vivo",
    classificacaoOcorrencia: "Resgate e Reabilitação",
    codeDecomposicao: 1,
    interacaoPesca: "Nao",
    classe: "Mammalia",
    ordem: "Cetacea",
    familia: "Delphinidae",
    genero: "Sotalia",
    especie: "Sotalia guianensis",
    sexo: "M",
    faixaEtaria: "adulto",
    ...overrides,
  } as OccurrenceFormValues;
}

function createRepositoryMock(): jest.Mocked<OccurrenceRepository> {
  return {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
  } as unknown as jest.Mocked<OccurrenceRepository>;
}

describe("OccurrenceService", () => {
  describe("create", () => {
    it("retorna erros de validação sem chamar o repositório quando os dados são inválidos", async () => {
      const repository = createRepositoryMock();
      const service = new OccurrenceService(repository);

      const result = await service.create(
        buildValidValues({ tomboIma: "INVALIDO" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.tomboIma).toBeDefined();
      }
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("cria a ocorrência mapeando os valores do formulário e retorna o id", async () => {
      const repository = createRepositoryMock();
      repository.create.mockResolvedValue({ id: "occ-1" } as Occurrence);
      const service = new OccurrenceService(repository);

      const result = await service.create(buildValidValues());

      expect(result).toEqual({ success: true, id: "occ-1" });
      expect(repository.create).toHaveBeenCalledTimes(1);
      const data = repository.create.mock.calls[0][0];
      expect(data.tomboIma).toBe("IMA00001");
      expect(data.latitude).toBe(-23.0);
      expect(data.longitude).toBe(-44.3);
      expect(data.tipoEntrada).toBe("ENTREGA_VOLUNTARIA");
      expect(data.classificacaoOcorrencia).toBe("RESGATE_REABILITACAO");
    });

    it("retorna erro amigável quando o Tombo IMA já existe (violação de unicidade)", async () => {
      const repository = createRepositoryMock();
      repository.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          clientVersion: "7.9.1",
        })
      );
      const service = new OccurrenceService(repository);

      const result = await service.create(buildValidValues());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.tomboIma).toBe(
          "Já existe um registro com este Tombo IMA."
        );
      }
    });

    it("exige CODE 1 quando o status do animal é Vivo", async () => {
      const repository = createRepositoryMock();
      const service = new OccurrenceService(repository);

      const result = await service.create(
        buildValidValues({ statusAnimal: "Vivo", codeDecomposicao: 3 })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.codeDecomposicao).toBeDefined();
      }
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("list", () => {
    it("lista sem filtro de situação quando 'todos' é usado (padrão)", async () => {
      const repository = createRepositoryMock();
      repository.findMany.mockResolvedValue([] as OccurrenceListItem[]);
      const service = new OccurrenceService(repository);

      await service.list({});

      expect(repository.findMany).toHaveBeenCalledWith({});
    });

    it("filtra ocorrências em aberto (destinoFinal nulo)", async () => {
      const repository = createRepositoryMock();
      repository.findMany.mockResolvedValue([] as OccurrenceListItem[]);
      const service = new OccurrenceService(repository);

      await service.list({ situacao: "aberto" });

      expect(repository.findMany).toHaveBeenCalledWith({
        destinoFinal: null,
      });
    });

    it("filtra ocorrências encerradas (destinoFinal preenchido)", async () => {
      const repository = createRepositoryMock();
      repository.findMany.mockResolvedValue([] as OccurrenceListItem[]);
      const service = new OccurrenceService(repository);

      await service.list({ situacao: "encerrado" });

      expect(repository.findMany).toHaveBeenCalledWith({
        destinoFinal: { not: null },
      });
    });

    it("aplica busca textual em tomboIma, espécie e município", async () => {
      const repository = createRepositoryMock();
      repository.findMany.mockResolvedValue([] as OccurrenceListItem[]);
      const service = new OccurrenceService(repository);

      await service.list({ busca: "guianensis" });

      expect(repository.findMany).toHaveBeenCalledWith({
        OR: [
          { tomboIma: { contains: "guianensis", mode: "insensitive" } },
          { especie: { contains: "guianensis", mode: "insensitive" } },
          { municipio: { contains: "guianensis", mode: "insensitive" } },
        ],
      });
    });

    it("retorna a lista resolvida pelo repositório", async () => {
      const repository = createRepositoryMock();
      const items = [
        {
          id: "occ-1",
          tomboIma: "IMA00001",
          especie: "Sotalia guianensis",
          nomeComum: null,
          dataOcorrencia: new Date("2026-08-20"),
          destinoFinal: null,
        },
      ] as OccurrenceListItem[];
      repository.findMany.mockResolvedValue(items);
      const service = new OccurrenceService(repository);

      const result = await service.list({});

      expect(result).toBe(items);
    });
  });
});

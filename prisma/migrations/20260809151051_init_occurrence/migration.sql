-- CreateEnum
CREATE TYPE "TipoEntrada" AS ENUM ('Entrega voluntária', 'Repasse por terceiros', 'Pronto Atendimento');

-- CreateEnum
CREATE TYPE "StatusAnimal" AS ENUM ('Vivo', 'Morto');

-- CreateEnum
CREATE TYPE "ClassificacaoOcorrencia" AS ENUM ('Resgate e Reabilitação', 'Coleta', 'Registro', 'Manutenção', 'Encalhe');

-- CreateEnum
CREATE TYPE "SimNao" AS ENUM ('Sim', 'Nao');

-- CreateEnum
CREATE TYPE "Classe" AS ENUM ('Amphibia', 'Aves', 'Elasmobranchii', 'Mammalia', 'Reptilia');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('M', 'F', 'IN');

-- CreateEnum
CREATE TYPE "FaixaEtaria" AS ENUM ('feto', 'filhote', 'juvenil', 'subadulto', 'adulto');

-- CreateEnum
CREATE TYPE "UnidadePeso" AS ENUM ('g', 'kg');

-- CreateEnum
CREATE TYPE "CondicaoCorporal" AS ENUM ('boa', 'regular', 'péssima');

-- CreateEnum
CREATE TYPE "UnidadeComprimento" AS ENUM ('mm', 'cm', 'm');

-- CreateEnum
CREATE TYPE "CausaMortisCategoria" AS ENUM ('Antrópica', 'Patológica', 'Fisiológica', 'Desconhecida', 'Indeterminada');

-- CreateEnum
CREATE TYPE "DestinoFinal" AS ENUM ('soltura', 'transferencia', 'obito', 'colecao_cientifica', 'enterro', 'incineracao', 'maceracao', 'doacao', 'colecao cientifica IMA', 'outro');

-- CreateTable
CREATE TABLE "Occurrence" (
    "id" TEXT NOT NULL,
    "tomboIma" TEXT NOT NULL,
    "responsavelRegistro" TEXT NOT NULL,
    "dataOcorrencia" DATE NOT NULL,
    "horarioColeta" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "localEspecifico" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "nomeFoto" TEXT,
    "tipoEntrada" "TipoEntrada" NOT NULL,
    "statusAnimal" "StatusAnimal" NOT NULL,
    "classificacaoOcorrencia" "ClassificacaoOcorrencia" NOT NULL,
    "codeDecomposicao" INTEGER NOT NULL,
    "interacaoPesca" "SimNao" NOT NULL,
    "interacaoPescaDescricao" TEXT,
    "classe" "Classe" NOT NULL,
    "ordem" TEXT NOT NULL,
    "familia" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "nomeComum" TEXT,
    "sexo" "Sexo" NOT NULL,
    "faixaEtaria" "FaixaEtaria" NOT NULL,
    "anilhaNumero" TEXT,
    "pesoEntradaG" DOUBLE PRECISION,
    "pesoEntradaGUnidade" "UnidadePeso",
    "condicaoCorporal" "CondicaoCorporal",
    "procedimentosClinicos" TEXT,
    "amostrasAntemortem" TEXT,
    "biometriaCt" DOUBLE PRECISION,
    "biometriaCtUnidade" "UnidadeComprimento",
    "biometriaCcc" DOUBLE PRECISION,
    "biometriaCccUnidade" "UnidadeComprimento",
    "biometriaCompBico" DOUBLE PRECISION,
    "biometriaBicoUnidade" "UnidadeComprimento",
    "biometriaLcc" DOUBLE PRECISION,
    "biometriaLccUnidade" "UnidadeComprimento",
    "responsavelNecropsia" TEXT,
    "dataObito" DATE,
    "achadosNecropsia" TEXT,
    "presencaTumores" "SimNao",
    "descricaoTumores" TEXT,
    "causaMortisDiagnostico" TEXT,
    "causaMortisCategoria" "CausaMortisCategoria",
    "amostrasPostmortem" TEXT,
    "resultadoRadiografia" TEXT,
    "resultadoToxicologico" TEXT,
    "resultadoHistopatologico" TEXT,
    "achadosBioquimica" TEXT,
    "achadosHemograma" TEXT,
    "achadosFezesUrina" TEXT,
    "resultadoMicrobiologico" TEXT,
    "pesoFinal" DOUBLE PRECISION,
    "pesoFinalUnidade" "UnidadePeso",
    "dataSaida" DATE,
    "destinoFinal" "DestinoFinal",
    "outroDestinoEspecificar" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Occurrence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Occurrence_tomboIma_key" ON "Occurrence"("tomboIma");

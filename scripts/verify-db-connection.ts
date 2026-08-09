import { prisma } from "@/lib/prisma";

async function main() {
  const count = await prisma.occurrence.count();
  console.log(`OK: conectado ao banco. Ocorrências existentes: ${count}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

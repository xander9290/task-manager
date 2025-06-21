import prisma from "./prisma";

function formatCode(prefix: string, value: number, length = 4): string {
  return `${prefix.toUpperCase()}${value.toString().padStart(length, "0")}`;
}

async function getNextValue(prefix: string, model: string) {
  const nextValue = await prisma.$transaction(async (tx) => {
    const counter = await tx.counter.upsert({
      where: { id: model },
      update: { value: { increment: 1 } },
      create: { id: model, value: 1 },
    });
    return counter.value;
  });

  return formatCode(prefix, nextValue); // Ej: INV-0001
}

export default getNextValue;

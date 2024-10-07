import prisma from "../client"

export async function resetDb() {
  await prisma.$transaction([
    prisma.move.deleteMany(),
    prisma.gameOutcomes.deleteMany(),
    prisma.game.deleteMany(),
    prisma.user.deleteMany(),
  ])
}

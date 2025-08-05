import { PrismaClient } from "./generated/prisma";

const prismaClientSingleton = () => {
  return new PrismaClient()
}
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

// create dummy user
export const getCurrentUser = async () => {
  // For tutorial purposes, we'll always use the same user
  const user = await prisma.user.findFirst();

  if(!user) {
    return prisma.user.create({
      data: {
        coins: 0
      }
    })
  }

  return user;
}
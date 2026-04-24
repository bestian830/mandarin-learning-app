// Prisma Client 单例
// 用法: import { prisma } from '../db/client.js'
// 注意: Prisma Client 由 schema.prisma 生成，路径在 src/generated/prisma/
//       运行 `npx prisma generate` 可以重新生成

import { PrismaClient } from "../generated/prisma/client.js";

// dev 模式下防止 hot-reload 创建多个连接实例
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

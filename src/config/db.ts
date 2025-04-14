import { PrismaClient } from "@prisma/client";
 
const prisma = new PrismaClient();

export default prisma;
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected successfully");
  } catch (error) {
    console.error("Database disconnection failed", error);
  }
}
export const resetDB = async () => {
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
    console.log("Database reset successfully");
  } catch (error) {
    console.error("Database reset failed", error);
  }
}


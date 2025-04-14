import prisma from "config/db";

export async function storeSnapshot(data: {
  method: string;
  url: string;
  headers: any;
  body: any;
}) {
  await prisma.snapshot.create({
    data,
  });
}

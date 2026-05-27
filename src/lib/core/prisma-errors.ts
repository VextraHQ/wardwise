import { Prisma } from "@prisma/client";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function isPrismaConnectivityError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return (
      error.code === "P1001" ||
      error.code === "P1002" ||
      getErrorMessage(error).includes("Can't reach database server")
    );
  }

  return getErrorMessage(error).includes("Can't reach database server");
}

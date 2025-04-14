import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllBooks = async () => {
    return await prisma.book.findMany();
}

export const getBookById = async (id: string) => {
    return await prisma.book.findUnique({ 
        where: { id } ,
    });
}

export const createBook = async (data: any) => {
    const { createdById, ...bookData } = data;
    return await prisma.book.create({
      data: {
        ...bookData,
        createdBy: { connect: { id: createdById } },
      },
    });
  };

  export const updateBook = async (id: string, data: any) => {
    const { updatedById, ...bookData } = data;
    return await prisma.book.update({
      where: { id },
      data: {
        ...bookData,
        ...(updatedById && { updatedBy: { connect: { id: updatedById } } }),
      },
    });
  };
  

export const deleteBook = async (id: string) => {
    return await prisma.book.delete({ where: { id } });
}

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllBooks = async () => {
    return await prisma.book.findMany();
}

export const getBookById = async (id: string) => {
    return await prisma.book.findUnique( { where: {id} } );
}

export const createBook = async (data: any) => {
    return await prisma.book.create( {data} );
}

export const updateBook = async (id: string, data: any) => {
    return await prisma.book.update({ where:  {id} , data });
}

export const deleteBook = async (id: string) => {
    return await prisma.book.delete({ where: {id} });
}

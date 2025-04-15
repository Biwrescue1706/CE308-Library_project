import { prisma } from "../utils/prisma";

type BorrowRequestItem = { bookId: string; quantity: number };

export const borrowMultipleBooks = async (userId: string, items: BorrowRequestItem[]) => {
  const result = [];
  for (const item of items) {
    const book = await prisma.book.findUnique({ where: { id: item.bookId } });
    if (!book) throw new Error(`ไม่พบหนังสือ ${item.bookId}`);
    if (book.availableCopies < item.quantity) throw new Error(`หนังสือ "${book.title}" คงเหลือไม่พอ`);

    const loan = await prisma.loan.create({
      data: {
        userId,
        bookId: item.bookId,
        quantity: item.quantity,
        loanDate: new Date(),
        returned: false,
      },
    });

    await prisma.book.update({
      where: { id: item.bookId },
      data: { availableCopies: { decrement: item.quantity } },
    });

    result.push(loan);
  }
  return result;
};

export const returnBook = async (loanId: string) => {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan || loan.returned) throw new Error("คืนไปแล้วหรือไม่พบข้อมูลการยืม");

  const updatedLoan = await prisma.loan.update({
    where: { id: loanId },
    data: { returned: true, returnDate: new Date() },
  });

  await prisma.book.update({
    where: { id: loan.bookId },
    data: { availableCopies: { increment: loan.quantity } },
  });

  return updatedLoan;
};

export const getLoansByUser = async (userId: string) => {
  return prisma.loan.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { loanDate: "desc" },
  });
};
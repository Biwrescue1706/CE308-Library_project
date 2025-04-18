import { prisma } from "../utils/prisma";

import { differenceInDays } from "date-fns";

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
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // กำหนดวันครบกำหนดคืน
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

  const returnDate = new Date();
  let lateDays = 0;
  if (loan.dueDate) {
    lateDays = Math.max(differenceInDays(returnDate, loan.dueDate), 0);
  }

  const updatedLoan = await prisma.loan.update({
    where: { id: loanId },
    data: {
      returned: true,
      returnDate,
      lateDays,
    },
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
    include: {
      book: true,
    },
    orderBy: {
      loanDate: "desc",
    },
  });
};

export const getAllLoans = async () => {
  const loans = await prisma.loan.findMany({
    include: {
      user: {
        select: {
          memberId: true,
          username: true,
          phone: true,
          titleTH: true,
          firstNameTH: true,
          lastNameTH: true,
        },
      },
      book: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      loanDate: "desc",
    },
  });

  return loans.map((loan) => {
    const lateDays = loan.returnDate && loan.dueDate && loan.returnDate > loan.dueDate
      ? Math.ceil((+loan.returnDate - +loan.dueDate!) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      id: loan.id,
      username: loan.user.username,
      memberId: loan.user.memberId,
      fullNameTH: `${loan.user.titleTH}${loan.user.firstNameTH} ${loan.user.lastNameTH}`,
      phone: loan.user.phone,
      title: loan.book.title,
      quantity: loan.quantity,
      loanDate: loan.loanDate,
      dueDate: loan.dueDate,
      returnDate: loan.returnDate,
      returned: loan.returned,
      lateDays,
    };
  });
};

export const getActiveLoans = async () => {
  const loans = await prisma.loan.findMany({
    where: { returned: false },
    include: {
      user: {
        select: {
          memberId: true,
          username: true,
          phone: true,
          titleTH: true,
          firstNameTH: true,
          lastNameTH: true,
        },
      },
      book: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      loanDate: "desc",
      dueDate: "desc",
    },
  });

  return loans.map((loan) => {
    const lateDays = loan.returnDate && loan.dueDate && loan.returnDate > loan.dueDate
      ? Math.ceil((+loan.returnDate - +loan.dueDate!) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      id: loan.id,
      username: loan.user.username,
      memberId: loan.user.memberId,
      fullNameTH: `${loan.user.titleTH}${loan.user.firstNameTH} ${loan.user.lastNameTH}`,
      phone: loan.user.phone,
      title: loan.book.title,
      quantity: loan.quantity,
      loanDate: loan.loanDate,
      dueDate: loan.dueDate,
      returnDate: loan.returnDate,
      returned: loan.returned,
      lateDays,
    };
  });
};

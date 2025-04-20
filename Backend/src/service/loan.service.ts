import { prisma } from "../utils/prisma";
import { addDays, differenceInDays } from "date-fns";

// ✅ ยืมหนังสือหลายเล่ม
type BorrowRequestItem = {
  bookId: string;
  quantity: number;
};

export const borrowMultipleBooks = async (userId: string, items: BorrowRequestItem[]) => {
  const results = [];

  for (const item of items) {
    const book = await prisma.book.findUnique({ where: { id: item.bookId } });
    if (!book) throw new Error(`ไม่พบหนังสือรหัส: ${item.bookId}`);
    if (book.availableCopies < item.quantity) {
      throw new Error(`หนังสือ "${book.title}" เหลือไม่พอ (${book.availableCopies} เล่ม)`);
    }

    const loan = await prisma.loan.create({
      data: {
        userId,
        bookId: item.bookId,
        borrowedQuantity: item.quantity,
        returnedQuantity: 0,
        loanDate: new Date(),
        dueDate: addDays(new Date(), 7),
        returned: false,
      },
    });

    await prisma.book.update({
      where: { id: item.bookId },
      data: { availableCopies: { decrement: item.quantity } },
    });

    results.push(loan);
  }

  return results;
};

// ✅ คืนทีละเล่ม
export const returnBook = async (loanId: string, quantity: number) => {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan || loan.returned) throw new Error("ไม่พบข้อมูลหรือคืนครบแล้ว");

  const remaining = loan.borrowedQuantity - loan.returnedQuantity;
  const returnQty = Math.min(quantity || remaining, remaining);
  const updatedReturned = loan.returnedQuantity + returnQty;
  const isFullyReturned = updatedReturned >= loan.borrowedQuantity;
  const now = new Date();
  const lateDays = isFullyReturned && loan.dueDate
    ? Math.max(differenceInDays(now, loan.dueDate), 0)
    : loan.lateDays ?? 0;

  const updatedLoan = await prisma.loan.update({
    where: { id: loanId },
    data: {
      returnedQuantity: updatedReturned,
      ...(isFullyReturned && {
        returned: true,
        returnDate: now,
        lateDays,
      }),
    },
  });

  await prisma.book.update({
    where: { id: loan.bookId },
    data: { availableCopies: { increment: returnQty } },
  });

  return updatedLoan;
};

// ✅ คืนหลายเล่ม
type ReturnItem = {
  loanId: string;
  quantity: number;
};

export const returnMultipleBooks = async (userId: string, items: ReturnItem[]) => {
  const now = new Date();
  const results = [];

  for (const item of items) {
    const loan = await prisma.loan.findUnique({
      where: { id: item.loanId },
      include: { book: true },
    });

    if (!loan || loan.userId !== userId || loan.returned) {
      throw new Error(`ไม่พบหรือคืนครบแล้ว: ${item.loanId}`);
    }

    const remaining = loan.borrowedQuantity - loan.returnedQuantity;
    const returnQty = Math.min(item.quantity, remaining);
    const updatedReturned = loan.returnedQuantity + returnQty;
    const isFullyReturned = updatedReturned >= loan.borrowedQuantity;
    const lateDays = loan.dueDate ? Math.max(differenceInDays(now, loan.dueDate), 0) : loan.lateDays ?? 0;

    const updatedLoan = await prisma.loan.update({
      where: { id: item.loanId },
      data: {
        returnedQuantity: updatedReturned,
        ...(isFullyReturned && {
          returned: true,
          returnDate: now,
          lateDays,
        }),
      },
    });

    await prisma.book.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: returnQty } },
    });

    results.push({
      loanId: loan.id,
      bookTitle: loan.book.title,
      returnedQuantity: returnQty,
      fullyReturned: isFullyReturned,
      lateDays: isFullyReturned ? lateDays : 0,
    });
  }

  return results;
};

// ✅ ดึงรายการยืมของผู้ใช้
export const getLoansByUser = async (userId: string) => {
  return prisma.loan.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { loanDate: "desc" },
  });
};

// ✅ ดึงรายการยืมทั้งหมด (admin)
export const getAllLoans = async () => {
  return prisma.loan.findMany({
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
      book: { select: { title: true } },
    },
    orderBy: { loanDate: "desc" },
  });
};

// ✅ ดึงรายการที่ยังไม่คืน (admin)
export const getActiveLoans = async () => {
  return prisma.loan.findMany({
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
      book: { select: { title: true } },
    },
    orderBy: { loanDate: "desc" },
  });
};

// ✅ ดึงรายการที่เกินกำหนดคืน (admin)
export const getOverdueLoans = async () => {
  const today = new Date();

  const loans = await prisma.loan.findMany({
    where: {
      returned: false,
      dueDate: { lt: today },
    },
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
      book: { select: { title: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return loans.map((loan) => ({
    ...loan,
    lateDays: differenceInDays(today, loan.dueDate!),
  }));
};

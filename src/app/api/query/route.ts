import { prisma } from '@/lib/prisma';

async function listInvoices() {
  const invoices = await prisma.invoice.findMany({
    where: { amount: 666 },
    select: {
      amount: true,
      customer: { select: { name: true } },
    },
  });
  return invoices;
}

export async function GET() {
  try {
    const invoices = await listInvoices();
    const response = Response.json(invoices);
    return response;
  } catch (error) {
    const errorResponse = Response.json({ error }, { status: 500 });
    return errorResponse;
  }
}

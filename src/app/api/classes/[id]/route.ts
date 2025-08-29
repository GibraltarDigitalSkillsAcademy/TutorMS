// app/api/instructors/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: object) {
  const id = parseInt(params.id, 10);
  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

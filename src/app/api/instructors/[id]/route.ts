// app/api/instructors/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  await prisma.instructor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

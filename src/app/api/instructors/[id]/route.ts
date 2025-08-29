// app/api/instructors/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  await prisma.instructor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function GET(req: Request, { params}: Promise<{id: string}>) {
  const id = parseInt(params.id, 10);
  const instructor = await prisma.instructor.findUnique({
    where: { id },
    include: { classes: { include: { room: true } } },
  });
  return NextResponse.json(instructor);
}
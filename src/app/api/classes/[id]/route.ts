// app/api/instructors/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


type RouteContext = {
  params: { id: string };
};


const prisma = new PrismaClient();

export async function DELETE(req: Request, ctx: RouteContext<'classes/[id]'>) {
  const id = await ctx.params;
  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

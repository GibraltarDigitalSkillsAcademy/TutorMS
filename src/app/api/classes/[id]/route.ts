// app/api/instructors/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


type RouteContext = {
  params: { id: string };
};


const prisma = new PrismaClient();


export async function GET(req: Request, {params}: { params : Promise<{id: string}>}) {
  console.log("GET with PARAM");
  const id = parseInt((await params).id);
  console.log(id);
  const chosen_class = await prisma.class.findUnique({
    where: { id },
    include: { room: true },
  });
  return NextResponse.json(chosen_class);
}



export async function DELETE(req: Request, {params}: { params : Promise<{id: string}>}) {
  const id = parseInt((await params).id);
  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

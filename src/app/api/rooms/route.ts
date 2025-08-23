import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  
  const rooms = await prisma.room.findMany();
  return NextResponse.json(rooms);
}

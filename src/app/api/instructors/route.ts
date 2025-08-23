import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  
  const instructors = await prisma.instructor.findMany();
  return NextResponse.json(instructors);
}

export async function POST(req: Request) {
  
  const data = await req.json();
  const instructor = await prisma.instructor.create({ data });
  return NextResponse.json(instructor);
}


import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  
  const classes = await prisma.class.findMany({
    include: {
      instructor: true,
      room: true,
    },
  });
  return NextResponse.json(classes);
}


export async function POST(req: Request) {
  
  const data = await req.json();  
  const new_class = await prisma.class.create({
    data: {
      name: data.name,
      description: data.description,
      startDatetime: data.startDatetime,
      durationMinutes: data.durationMinutes,
      timezone: data.timezone,
      rruleFreq: data.rruleFreq,
      rruleInterval: data.rruleInterval,
      rruleCount: data.rruleCount,
      instructor: {connect: {id: data.instructorId}},
      room: {connect: {id: data.roomId}} 
    }
  });
  
  return NextResponse.json(new_class);
}

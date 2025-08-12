import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  
  const events = await prisma.event.findMany();
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  
  const data = await req.json();

  const event = await prisma.event.create({
           
             class: {
               connect: {
                 id: data.connect.id
               }
             },
             durationMinutes: data.durationMinutes,
             rruleInterval: data.rruleInterval,
             rruleFreq: data.rruleFreq,
             startDatetime: data.startDatetime
           
         })

  const new_event = await prisma.event.create({event});
  return NextResponse.json(new_event);
}


import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function MOCK_GET() {

  return [
  {
    id: 1,
    title: 'Python PCEP',
    start: new Date(2025, 6, 30, 10, 0),
    end: new Date(2025, 6, 30, 12, 0),
    instructor: 'Alice',
    class: 'Python PCEP',
  },
  {
    id: 2,
    title: 'KS2 Robotics',
    start: new Date(2025, 6, 31, 14, 0),
    end: new Date(2025, 6, 31, 15, 30),
    instructor: 'Bob',
    class: 'KS2 Robotics',
  },
];

}


export async function GET() {
  
  const classes = await prisma.class.findMany({
    include: {
      instructor: true,
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
      instructor: {connect: {id: data.instructorId}} 
    }
  });
  
  return NextResponse.json(new_class);
}

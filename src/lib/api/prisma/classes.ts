//import { NextResponse } from 'next/server';
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


export class PrismaBackend() {
    private test: number;
    private model: string;

    constructor(model: string) {
        this.number = 4;
    }



}



export class ClassSchedule() {

}

export class Instructor() {}

export class Room() {}
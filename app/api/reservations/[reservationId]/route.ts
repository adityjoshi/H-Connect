import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  reservationId?: string;
}

export async function DELETE(
  request: Request, 
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { reservationId } = params;

  if (!reservationId || typeof reservationId !== 'string') {
    throw new Error('Invalid ID');
  }
  const listingResp :any = await prisma.reservation.findUnique({
    where: {
      id: reservationId,
    }
  });

  console.log(listingResp)

  const reservation = await prisma.reservation.deleteMany({
    where: {
      id: reservationId,
      OR: [
        { userId: currentUser.id },
        { listing: { userId: currentUser.id } }
      ]
    }
  });
  await prisma.listing.update({
    where: {
      id: listingResp.listingId,
    },
    data:{
      roomCount:{
        increment:1
      }
    }
  });

  return NextResponse.json(reservation);
}

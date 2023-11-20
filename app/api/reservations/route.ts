// import { NextResponse } from "next/server";

// import prisma from "@/app/libs/prismadb";
// import getCurrentUser from "@/app/actions/getCurrentUser";

// export async function POST(
//   request: Request, 
// ) {
//   const currentUser = await getCurrentUser();

//   if (!currentUser) {
//     return NextResponse.error();
//   }

//   const body = await request.json();
//   const { 
//     listingId,
//     startDate,
//     endDate,
//     totalPrice
//    } = body;

//    if (!listingId || !startDate || !endDate || !totalPrice) {
//     return NextResponse.error();
//   }

//   const listingAndReservation = await prisma.listing.update({
    
//     where: {
//       id: listingId
//     },
  
//     data: {
//       roomCount:{decrement:1},
//       reservations: {
//         create: {
//           userId: currentUser.id,
//           startDate,
//           endDate,
//           totalPrice,
//         }
//       }
//     }
//   });

//   return NextResponse.json(listingAndReservation);
// }


// import { NextResponse } from "next/server";
// import prisma from "@/app/libs/prismadb";
// import getCurrentUser from "@/app/actions/getCurrentUser";

// export async function POST(request: Request) {
//   const currentUser = await getCurrentUser();

//   if (!currentUser) {
//     return NextResponse.error();
//   }

//   const body = await request.json();
//   const { listingId, startDate, endDate, totalPrice } = body;

//   if (!listingId || !startDate || !endDate || !totalPrice) {
//     return NextResponse.error();
//   }

//   const listing = await prisma.listing.findUnique({
//     where: {
//       id: listingId,
//     },
//     select: {
//       roomCount: true,
//     },
//   });

//   if (listing && listing.roomCount > 0) {
//     const updatedListingAndReservation = await prisma.listing.update({
//       where: {
//         id: listingId,
//       },
//       data: {
//         roomCount: {
//           decrement: 1,
//         },
//         reservations: {
//           create: {
//             userId: currentUser.id,
//             startDate,
//             endDate,
//             totalPrice,
//           },
//         },
//       },
//     });

//     return NextResponse.json(updatedListingAndReservation);
//   } else {
//     // Handle case where roomCount is not greater than 0, you might want to return an error response.
//     return NextResponse.error();
//   }
// }



import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { listingId, startDate, endDate, totalPrice } = body;

  if (!listingId || !startDate || !endDate || !totalPrice) {
    return new Response("Bad Request", { status: 400 });
  }

  const existingReservation = await prisma.reservation.findFirst({
    where: {
      userId: currentUser.id,
      listingId: listingId,
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
  });

  if (existingReservation) {
    return new Response("You have already reserved this room for the specified dates.", {
      status: 400,
    });
  }

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    select: {
      roomCount: true,
    },
  });

  if (listing && listing.roomCount > 0) {
    const updatedListingAndReservation = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        roomCount: {
          decrement: 1,
        },
        reservations: {
          create: {
            userId: currentUser.id,
            startDate,
            endDate,
            totalPrice,
          },
        },
      },
    });

    return new Response(JSON.stringify(updatedListingAndReservation), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return new Response("No available rooms for reservation.", { status: 400 });
  }
}

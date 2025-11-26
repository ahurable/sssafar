import { getSession } from '@/lib/auth';
import { flightSessionService } from '@/lib/flight-session';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Types for incoming request body
interface Traveler {
  id: string;
  age: number;
  email: string;
  gender: string;
  lastName: string;
  firstName: string;
  nationalId: string;
  dateOfBirth: string;
  phoneNumber: string;
  passengerType: string;
  passportExpiry: string;
  passportNumber: string;
}

interface Room {
  Name: string;
  RoomId: string;
  MealType: string;
  BedGroups: string;
  ChildAges: any | null;
  RoomMapId: string | null;
  AdultCount: number;
  ChildCount: number;
  RoomMapName: string | null;
  ExtraBedCount: number;
  SharingBedding: boolean;
  HotelRoomEarlyCheckin: any | null;
  HotelRoomLateCheckout: any | null;
}

interface IncomingBookRequest {
  fareSourceCode: string;
  hotelId: number;
  travelers: Traveler[];
  checkIn: string;
  checkOut: string;
  invoiceId: string;
  rooms: Room[];
  straightPayment?: boolean;
}

// Types for external API request
interface ExternalPassenger {
  FirstName: string;
  LastName: string;
  PassengerType: string;
  PassengerTitle: string | null;
  Gender: boolean;
  ChildAge: number | null;
  NationalId: string;
  PassportNumber: string;
}

interface ExternalRoom {
  Passengers: ExternalPassenger[];
  HotelRoomEarlyCheckin: any | null;
  HotelRoomLateCheckout: any | null;
}

interface ExternalBookRequest {
  SessionId: string;
  FareSourceCode: string;
  ClientUniqueId: string;
  PhoneNumber: string;
  Email: string;
  Rooms: ExternalRoom[];
  Note: string;
  GuestArrival: any | null;
  GuestDeparture: any | null;
  Nationality: string | null;
}

export async function POST(request: NextRequest) {
  const session = await getSession()

  const bookData: IncomingBookRequest = await request.json();

  if (!session && !bookData.straightPayment) {
    return NextResponse.json({
      message: "ابتدا وارد حساب کاربری خود شوید"
    }, {status: 401})
  }

  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: bookData.invoiceId } })
    
    if (!invoice) {
      return NextResponse.json({
        message: "صورت حساب شما یافت نشد"
      }, { status: 400 })
    }
    
    // console.log('Received booking request:', bookData);

    const sessionId = await flightSessionService.getSession();
    
    // Validate required fields
    if (!bookData.fareSourceCode) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            id: "VALIDATION_ERROR",
            message: "FareSourceCode is required"
          }
        },
        { status: 400 }
      );
    }

    if (!bookData.travelers || bookData.travelers.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            id: "VALIDATION_ERROR",
            message: "At least one traveler is required"
          }
        },
        { status: 400 }
      );
    }

    if (!bookData.rooms || bookData.rooms.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            id: "VALIDATION_ERROR",
            message: "At least one room is required"
          }
        },
        { status: 400 }
      );
    }

    // Validate travelers
    for (const traveler of bookData.travelers) {
      if (!traveler.firstName || !traveler.lastName) {
        return NextResponse.json(
          { 
            success: false, 
            error: {
              id: "VALIDATION_ERROR",
              message: "Each traveler must have firstName and lastName"
            }
          },
          { status: 400 }
        );
      }
    }

    // Generate ClientUniqueId if not provided (using timestamp + random)
    const clientUniqueId = `HOTEL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Use first traveler's phone and email as primary contact
    const primaryTraveler = bookData.travelers[0];

    // Transform travelers to passengers
    const passengers: ExternalPassenger[] = bookData.travelers.map(traveler => {
      // Map passenger type
      let passengerType = "Adt"; // Default to Adult
      if (traveler.passengerType === "1") passengerType = "Adt";
      if (traveler.passengerType === "2") passengerType = "Chd";
      if (traveler.passengerType === "3") passengerType = "Inf";

      // Map gender
      let gender = false; // Default to male (false)
      if (traveler.gender && traveler.gender.toLowerCase() === 'female') {
        gender = true;
      }

      // Calculate ChildAge if passenger is child
      let childAge = null;
      if (passengerType === "Chd" || passengerType === "Inf") {
        if (traveler.dateOfBirth) {
          const birthDate = new Date(traveler.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          childAge = age;
        } else if (traveler.age > 0) {
          childAge = traveler.age;
        }
      }

      return {
        FirstName: traveler.firstName,
        LastName: traveler.lastName,
        PassengerType: passengerType,
        PassengerTitle: null, // Not provided in incoming request
        Gender: gender,
        ChildAge: childAge,
        NationalId: traveler.nationalId || "0000000000",
        PassportNumber: traveler.passportNumber || "N/A"
      };
    });

    const userPhone = await prisma.user.findUnique({
      where: { id: invoice.userId},
      select: { phone: true }
    })

    // Transform to external API format
    const externalRequest: ExternalBookRequest = {
      SessionId: sessionId,
      FareSourceCode: bookData.fareSourceCode,
      ClientUniqueId: clientUniqueId,
      PhoneNumber: userPhone && userPhone.phone || "123456789",
      Email: primaryTraveler.email || "IT@Partocrs.com",
      Rooms: bookData.rooms.map(room => ({
        Passengers: passengers, // All passengers in each room (adjust if needed)
        HotelRoomEarlyCheckin: room.HotelRoomEarlyCheckin,
        HotelRoomLateCheckout: room.HotelRoomLateCheckout
      })),
      Note: `Booking for ${bookData.rooms.length} room(s) from ${bookData.checkIn} to ${bookData.checkOut}`,
      GuestArrival: bookData.checkIn,
      GuestDeparture: bookData.checkOut,
      Nationality: "IR" // Default to Iran, adjust as needed
    };

    // console.log('Sending booking request to external API:', {
    //   sessionId: externalRequest.SessionId,
    //   fareSourceCode: externalRequest.FareSourceCode,
    //   clientUniqueId: externalRequest.ClientUniqueId,
    //   roomCount: externalRequest.Rooms.length,
    //   passengerCount: passengers.length,
    //   hotelId: bookData.hotelId
    // });

    // Make request to external API
    const response = await fetch('https://apidemo.partocrs.com/api/Hotel/HotelBook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(externalRequest)
    });

    // Read the response once and store it
    const responseText = await response.text();
    
    let externalResponse;
    try {
      externalResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse external API response:', parseError);
      externalResponse = { error: 'Invalid JSON response', raw: responseText };
    }

    // Create reservation regardless of API response status
    const makeReservationAnyWay = await prisma.booking.create({
      data: {
        bookingCode: invoice.id,
        type: "HOTEL",
        bookingInformation: JSON.stringify(invoice.order) || JSON.stringify({error:"صورت حساب یافت نشد"}),
        data: externalResponse,
        totalPrice: invoice && parseInt(invoice.amount) || 0,
        status: response.ok ? "CONFIRMED" : "CANCELLED",
        userId: invoice.userId
      }
    })

    if (!response.ok) {
      console.error('External API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: `${response.status}: ${response.statusText}`,
          externalError: externalResponse
        },
        { status: response.status }
      );
    }

    // console.log('Booking response received:', {
    //   success: externalResponse.Success,
    //   bookingId: externalResponse.BookingId,
    //   error: externalResponse.Error
    // });

    // Return the external API response
    return NextResponse.json(externalResponse);

  } catch (error) {
    console.error('Error in hotel booking:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: {
          id: "INTERNAL_SERVER_ERROR",
          message: "An internal server error occurred while processing your booking"
        }
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      message: "Use POST method to book a hotel",
      exampleRequest: {
        fareSourceCode: "6666333863346230633861313438653239343933363966656638316538376537263634263532333932313426313031",
        hotelId: 11749816,
        travelers: [
          {
            id: "1760812709419",
            age: 0,
            email: "ahura.alipur19@yahoo.com",
            gender: "",
            lastName: "عالی پور هفشجانی",
            firstName: "اهورا",
            nationalId: "0123456789",
            dateOfBirth: "2025-09-29",
            phoneNumber: "09903392645",
            passengerType: "1",
            passportExpiry: "2025-10-21",
            passportNumber: "0123456790"
          }
        ],
        checkIn: "2025-10-21T00:00:00",
        checkOut: "2025-10-22T00:00:00",
        rooms: [
          {
            Name: "Deluxe Apartment",
            RoomId: "1575441",
            MealType: "Room Only",
            BedGroups: "1 QueenBed",
            ChildAges: null,
            RoomMapId: null,
            AdultCount: 2,
            ChildCount: 0,
            RoomMapName: null,
            ExtraBedCount: 0,
            SharingBedding: false,
            HotelRoomEarlyCheckin: null,
            HotelRoomLateCheckout: null
          }
        ]
      }
    },
    { status: 200 }
  );
}
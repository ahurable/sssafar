import { getSession } from "@/lib/auth";
import { flightSessionService } from "@/lib/flight-session";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    const session = await getSession()
    const sessionId = await flightSessionService.getSession()
    
    if (!session) {
        return NextResponse.json({
            message: "ابتدا وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    try {
        const body = await request.json()
        const user = await prisma.user.findUnique({
            where: {
                id: session.userId
            }
        })

        // FIX: Remove the extra array wrapper around each traveler
        const requestBody = {
            FareSourceCode: body.fareSourceCode,
            SessionId: sessionId,
            TravelerInfo: {
                PhoneNumber: user?.phone,
                Email: user?.email,
                AirTravelers: body.travelers.map((traveler: any) => ({
                    DateOfBirth: traveler.dateOfBirth,
                    Gender: parseInt(traveler.gender),
                    PassengerType: parseInt(traveler.passengerType),
                    PassengerName: {
                        PassengerFirstName: traveler.firstName,
                        PassengerLastName: traveler.lastName,
                        PassengerMiddleName: "",
                        PassengerTitle: 0
                    },
                    Passport: {
                        ExpiryDate: traveler.passportExpiry,
                        PassportNumber: traveler.passportNumber
                    },
                    NationalId: traveler.nationalId,
                    SeatPreference: 0,
                    MealPreference: 0
                }))
            }
        }

        console.log("Sending request to AirBook API:", JSON.stringify(requestBody, null, 2))

        const res = await fetch(
            'https://apidemo.partocrs.com/api/Air/AirBook', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        )
        
        const data = await res.json()
        
        console.log("AirBook API response:", {
            status: res.status,
            statusText: res.statusText,
            data: data
        })

        if (res.ok) {
            return NextResponse.json({
                message: 'بلیط هواپیما سفارش داده شد',
                data: data
            })
        }

        return NextResponse.json({
            message: 'مشکلی در رزرو بلیط هواپیما پیش آمد',
            error: data
        }, { status: 500 })

    } catch (error) {
        console.error("Error in flight booking:", error)
        return NextResponse.json({
            message: 'خطای سرور در رزرو بلیط',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { travelersSchema } from "@/lib/validations/traveler";

export async function POST(request: NextRequest) {
    const session = await getSession();
    const body = await request.json();
    
    if (!session) {
        return NextResponse.json({
            error: 'وارد حساب کاربری شوید'
        }, { status: 401 });
    }

    try {
        // Validate the incoming data
        const validatedData = travelersSchema.parse(body);
        
        // Use Promise.all to create all travelers concurrently and wait for completion
        const createdTravelers = await Promise.all(
            validatedData.children.map(async (travelerData) => {
                const createTraveler = await prisma.traveler.create({
                    data: {
                        firstName: travelerData.firstName,
                        lastName: travelerData.lastName,
                        nationalId: travelerData.nationalId,
                        dateOfBirth: new Date(travelerData.dateOfBirth),
                        passportNumber: travelerData.passportNumber, // Make sure this matches your Prisma schema
                        passportExpiry: travelerData.passportExpiry, // Make sure this matches your Prisma schema
                        userId: session.userId // Use session.user.id instead of session.userId
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        dateOfBirth: true,
                        nationalId: true,
                        passportExpiry: true,
                        passportNumber: true
                    }
                });
                return createTraveler;
            })
        );
        
        return NextResponse.json({
            message: 'مسافران با موفقیت اضافه شدند',
            travelers: createdTravelers
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error creating travelers:", error);
        
        if (error.name === 'ZodError') {
            return NextResponse.json({
                error: 'داده‌های ورودی معتبر نیستند',
                details: error.errors
            }, { status: 400 });
        }

        // Check for Prisma unique constraint violation (duplicate nationalId)
        if (error.code === 'P2002') {
            return NextResponse.json({
                error: 'کد ملی تکراری است'
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'در ایجاد مسافر مشکلی پیش آمد'
        }, { status: 500 });
    }
}
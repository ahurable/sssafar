import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    try {
        const session = await getSession()
        const body = await request.json()
        
        if (!session) {
            return NextResponse.json({
                message: "ابتدا وارد حساب کاربری خود شوید"
            }, { status: 401 })
        }

        if (!body.otpCode) {
            return NextResponse.json({
                message: "کد ارسال شده را وارد نمایید"
            }, { status: 400 })
        }

        // Get the LATEST OTP code for the user
        const otpCode = await prisma.otpCode.findFirst({
            where: {
                userId: session.userId
            },
            orderBy: {
                creatdDate: 'desc' // Get the most recent one
            }
        })

        if (!otpCode) {
            return NextResponse.json({
                message: "کد یکبارمصرفی برای شما یافت نشد. لطفا کد جدیدی درخواست کنید"
            }, { status: 404 })
        }

        const now = new Date()
        
        // console.log("Current time:", now)
        // console.log("OTP code from DB:", otpCode.code)
        // console.log("OTP code from request:", body.otpCode)
        // console.log("OTP expires at:", otpCode.expireDate)

        // Check if OTP is expired
        if (otpCode.expireDate < now) {
            return NextResponse.json({
                message: "این کد منقضی شده است. لطفا درخواست ارسال کد جدید بدهید"
            }, { status: 400 })
        }

        // FIX: Compare the code property, not the entire object
        if (otpCode.code.toString() === body.otpCode.toString()) {
            // Mark OTP as used
            // Update user verification status
            const updateUser = await prisma.user.update({
                where: {
                    id: session.userId
                },
                data: {
                    phoneVerified: true
                }
            })

            return NextResponse.json({
                message: "شماره همراه شما با موفقیت تایید شد"
            }, { status: 200 })
        } else {
            return NextResponse.json({
                message: "کد وارد شده با کد ارسالی مطابقت ندارد"
            }, { status: 400 })
        }

    } catch (error: any) {
        console.error("Error in verify-number:", error)
        return NextResponse.json({
            message: "خطایی از سمت سرور رخ داد"
        }, { status: 500 })
    }
}
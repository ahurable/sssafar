import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({
            message: "ابتدا باید وارد حساب کاربری خود شوید"
        }, {status: 401})
    }
    const user = await prisma.user.findUnique({
        where: {
            id: session.userId
        }, 
        select: {
            phone: true
        }
    })

    if (!user) {
        return NextResponse.json({
            message: "حساب کاربری پیدا نشد"
        }, { status: 404 })
    }

    if (user.phone && user.phone.length == 0 || !user.phone) {
        return NextResponse.json({
            message: "ابتدا شماره همراه خود را اضافه کنید"
        }, { status: 400 })
    }

    const generateOtpCode = () => {
        return Math.floor(100000 + Math.random() * 900000);
    }

    const getExpireDate: () => Date = () => {
        return new Date(Date.now() + 2 * 60 * 1000);
    }

    const sendOtpCode = async () => {
        const otp = generateOtpCode()
        const expireDate = getExpireDate()
        await prisma.otpCode.deleteMany({
            where: {
                userId: session.userId
            }
        })
        const addOtpCode = await prisma.otpCode.create({
            data: {
                code: otp,
                expireDate: expireDate,
                userId: session.userId
            }
        })
        console.log(addOtpCode)
        console.log(`کد تایید برای کاربر ${user.phone} : ${otp}`)
        const username = process.env.MELI_PAYAMAK_USERNAME
        const password = process.env.MELI_PAYAMAK_PASSWORD
        try {
            const MelipayamakApi = require('melipayamak-api')

            const meli = new MelipayamakApi(username, password)
            const sms = meli.sms()
            const to = user.phone
            const from = process.env.MELI_PAYAMAK_FROM_NUMBER
            const text = `کد تایید شماره همراه شما : ${otp}`
            sms.send(to, from, text)
            .then((res:any) => console.log(res))
            .then((err:any) => console.log(err))
        } catch (error) {
            console.log(error)
        }
    }

    await sendOtpCode()

    return NextResponse.json({
        message: "کد یکبار مصرف به شماره شما ارسال شد"
    }, { status: 200 })
}
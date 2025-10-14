import { getSession } from "@/lib/auth";
import { flightSessionService } from "@/lib/flight-session";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (request:NextRequest) => {
    const session = await getSession()
    const sessionId = await flightSessionService.getSession()
    if (!session) {
        return NextResponse.json({
            error: "لطفا وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    const body = await request.json()

    try {

        const validateFar = await fetch('https://apidemo.partocrs.com/api/Air/AirRevalidate', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                SessionId: sessionId,
                FareSourceCode: body.FareSourceCode,
                IsGenuine: body.IsGenuine || false
            })
        })

        const data = await validateFar.json()
        return NextResponse.json({
            ...data
        }, { status: 200 })
    } catch {
        return NextResponse.json({
            error: 'مشکلی در دریافت اطلاعات پرواز رخ داد'
        }, { status: 500 })
    }
}
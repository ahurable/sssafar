import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


const createContractTitle = z.object({
    title: z.string(),
    organizationName: z.string(),
    description: z.string().optional()
})


export const GET = async (request: NextRequest) => {
    const session = await getSession()

    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            error: "لطفا وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    try {
        const contracts = await prisma.contract.findMany({
            select: {
                id: true,
                title: true,
                organizationName: true,
                description: true
            }
        })

        return NextResponse.json({
            contracts
        }, {status: 200})
    } catch {
        return NextResponse.json({
            error: "قردادی پیدا نشد"
        }, { status: 404 })
    }
}



export const POST = async (request: NextRequest) => {

    const session = await getSession()

    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            error: "لطفا وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createContractTitle.parse(body)
    console.log(`the body is ${validatedData.organizationName}`)
    if (!body) {
        return NextResponse.json({
            error: "لطفا اطلاعات فرم را کامل ارسال کنید"
        })
    }

    // try {

        const contract = await prisma.contract.create({
            data: {
                ...validatedData,
                userId: session.userId
            },
            select: {
                id: true,
                title: true,
                organizationName: true
            }
        })

        return NextResponse.json(
            { 
                contract
            }, { status: 201 }
        )

    // } catch { 
    //     return NextResponse.json({error: 'خطایی رخ داد مطمئن شوید اطلاعات قرارداد را به درستی وارد کرده اید'}, {status:500})
    // }

}
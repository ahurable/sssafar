import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";



export async function POST(request: NextRequest, { params } : { params : { id: string}}) {
    const session = await getSession()
    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            error: "لطفا وارد شوید"
        }, {status:401})
    }
    try {
        const body = await request.json()
        
        const contractExists = await prisma.contract.findUnique({
            where: {
                id: body.id
            }
        })

        if (contractExists) {
            const updatePanel = await prisma.panel.update({
                where:{
                    id: params.id
                },
                data: {
                    contractId: body.id
                }
            })

            return NextResponse.json({status: 201})
        }

        return NextResponse.json({
            error: "مطمئن شوید قرارداد انتخاب شده درست است"
        }, {status:500})

    } catch {
        NextResponse.json({error: "Something went wrong with your request"}, {status: 500})
    }
}
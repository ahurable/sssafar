import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params } : { params : { id: string}}) {
    const session = await getSession()
    // try {
        // const panelUsers = await prisma.panelUser.findMany()
        // return NextResponse.json({
        //     panelUsers
        // }, { status: 200 })
    if (session?.role == "ADMIN") {
        const panel = await prisma.panel.findUnique({
            where: {
                id: params.id
            }, 
            include: {
                contract: {
                    select: {
                        id: true
                    }
                },
                user: {
                    select: {
                        id: true
                    }
                },
                members: true,
                panelUser: {
                    select: {
                        userId: true,
                        role: true
                    }
                }
            }
        })
        
        return NextResponse.json({
            panel
        }, { status: 200 })
    }   

    const panel = await prisma.panel.findUnique({
        where: {
            id: params.id
        },
        include: {
            panelUser: {
                select: {
                    userId: true,
                    role: true
                }
            },
            members: true
        }
    })

    return NextResponse.json({
        panel
    }, { status: 200 })
    // } catch {
        // return NextResponse.json({error: "خطا در دریافت پنل"}, { status: 500 })
    // }
}




export async function PUT(request: NextRequest, { params } : { params : { id: string }}) {

    const session = await getSession()
    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            error: "لطفا وارد شوید"
        }, {status:401})
    }

    const body = await request.json()

    try {
        const result = await prisma.$transaction(async (tx) => {
            const upPanel = await tx.panel.update({
                where: {
                    id: params.id
                },
                data: {
                    name: body.name,
                    description: body.description,
                    totalCredit: body.credit
                }
            })

            return { action: "updated" }
        })

        return NextResponse.json({
            success: "بروزرسانی شد"
        }, { status : 201 })
        
    } catch {
        return NextResponse.json({
            error: "مشکلی پیش آمد"
        }, { status: 500 })
    }

}
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params } : { params : { id: string}}) {
    try {
        // const panelUsers = await prisma.panelUser.findMany()
        // return NextResponse.json({
        //     panelUsers
        // }, { status: 200 })
        const panel = await prisma.panel.findUnique({
            where: {
                id: params.id
            }
        })
        return NextResponse.json({
            panel
        }, { status: 200 })
    } catch {
        return NextResponse.json({error: "خطا در دریافت پنل"}, { status: 500 })
    }
}



// ریکویست با متد پست مخصوص کاربر ادمین هست و با این نوع ریکویست میتوان مدیر پنل کاربری این پنل را مشخص کرد
export async function POST(request: NextRequest, { params } : { params : { id: string}}) {
    const session = await getSession()
    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            error: "لطفا وارد شوید"
        }, {status:401})
    }
    try {
        const body = await request.json()
        const existingPanelUser = await prisma.panelUser.findUnique(
            {
                where: {
                    panelId: params.id
                },
                select: {
                    panel: true,
                    panelId: true,
                    user: true,
                    userId: true
                }
            }
        )
        if (existingPanelUser) {
            const updatePanelUser = await prisma.panelUser.update({
                where: {
                    panelId: params.id
                }, 
                data: {
                    userId: body.id
                }, 
                select: {
                    user:true,
                    userId: true,
                    panel: true,
                    joinedAt: true
                }
            })
            return NextResponse.json({
                updatePanelUser
            }, {status:200})
        }
        const createPanelUser = await prisma.panelUser.create({
            data: {
                userId: body.id,
                panelId: params.id.toString()
            },
            select: {
                user: true,
                userId: true,
                panel: true,
                joinedAt: true
            }
        })
        return NextResponse.json({
            createPanelUser
        }, {status: 201})
    } catch {
        NextResponse.json({error: "Something went wrong with your request"}, {status: 500})
    }
}
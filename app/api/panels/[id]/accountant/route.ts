import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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
        console.log(body)
        
        const existingPanelUser = await prisma.panelUser.findFirst(
            {
                where: {
                    panelId: params.id,
                    role: "ACC"
                },
                select: {
                    id: true,
                    panel: true,
                    panelId: true,
                    user: true,
                    userId: true
                }
            }
        )

        // Start a transaction to ensure both operations succeed or fail together
        const result = await prisma.$transaction(async (tx) => {
            if (existingPanelUser && existingPanelUser.userId) {
                // Remove ORGAN role from previous user
                await tx.user.update({
                    where: {
                        id: existingPanelUser.userId
                    },
                    data: {
                        role: "USER"
                    }
                })

                // Update panel user with new user
                const updatePanelUser = await tx.panelUser.update({
                    where: {
                        id: existingPanelUser.id
                    }, 
                    data: {
                        userId: body.id,
                        role: "ACC"
                    }, 
                    select: {
                        user: true,
                        userId: true,
                        panel: true,
                        joinedAt: true
                    }
                })

                // Assign ORGAN role to new user
                await tx.user.update({
                    where: {
                        id: body.id
                    },
                    data: {
                        role: "ORGAN" // Assign ORGAN role
                    }
                })

                return { updatePanelUser, action: "updated" }
            } else {
                // Create new panel user
                const createPanelUser = await tx.panelUser.create({
                    data: {
                        userId: body.id,
                        panelId: params.id.toString(),
                        role: "ACC"
                    },
                    select: {
                        user: true,
                        userId: true,
                        panel: true,
                        joinedAt: true
                    }
                })

                // Assign ORGAN role to new user
                await tx.user.update({
                    where: {
                        id: body.id
                    },
                    data: {
                        role: "ORGAN" // Assign ORGAN role
                    }
                })

                return { createPanelUser, action: "created" }
            }
        })

        return NextResponse.json({
            ...result,
            message: result.action === "created" 
                ? "کاربر جدید به عنوان ORGAN به پنل اضافه شد" 
                : "کاربر ORGAN پنل به‌روزرسانی شد"
        }, {status: result.action === "created" ? 201 : 200})

    } catch (error) {
        console.error("Error in POST /api/panels/[id]/user:", error)
        return NextResponse.json({
            error: "خطا در انجام عملیات"
        }, {status: 500})
    }
}

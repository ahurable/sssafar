import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession()
    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            error: "لطفا وارد شوید"
        }, { status: 401 })
    }

    try {
        const body = await request.json()
        console.log(body)

        // ✅ Find existing ECO user for this panel
        const existingPanelUser = await prisma.panelUser.findFirst({
            where: {
                panelId: params.id,
                role: 'ECO'
            },
            select: {
                id: true,
                panelId: true,
                user: true,
                userId: true,
                role: true
            }
        })

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            if (existingPanelUser && existingPanelUser.userId) {
                // Remove ORGAN role from previous ECO user
                await tx.user.update({
                    where: {
                        id: existingPanelUser.userId
                    },
                    data: {
                        role: "USER"
                    }
                })

                // ✅ Update using the panel user ID (the correct unique identifier)
                const updatePanelUser = await tx.panelUser.update({
                    where: {
                        id: existingPanelUser.id // Use the actual panel user record ID
                    },
                    data: {
                        userId: body.id,
                        role: "ECO"
                    },
                    select: {
                        user: true,
                        userId: true,
                        panel: true,
                        joinedAt: true,
                        role: true
                    }
                })

                // Assign ORGAN role to new user
                await tx.user.update({
                    where: {
                        id: body.id
                    },
                    data: {
                        role: "ORGAN"
                    }
                })

                return { panelUser: updatePanelUser, action: "updated" }
            } else {
                // Check if user already exists in this panel with any role
                const existingUserInPanel = await tx.panelUser.findFirst({
                    where: {
                        panelId: params.id,
                        userId: body.id
                    }
                })

                if (existingUserInPanel) {
                    // ✅ Update existing user's role to ECO
                    const updatePanelUser = await tx.panelUser.update({
                        where: {
                            id: existingUserInPanel.id
                        },
                        data: {
                            role: "ECO"
                        },
                        select: {
                            user: true,
                            userId: true,
                            panel: true,
                            joinedAt: true,
                            role: true
                        }
                    })

                    // Assign ORGAN role to user
                    await tx.user.update({
                        where: {
                            id: body.id
                        },
                        data: {
                            role: "ORGAN"
                        }
                    })

                    return { panelUser: updatePanelUser, action: "updated_role" }
                } else {
                    // ✅ Create new panel user for ECO role
                    const createPanelUser = await tx.panelUser.create({
                        data: {
                            userId: body.id,
                            panelId: params.id,
                            role: "ECO"
                        },
                        select: {
                            user: true,
                            userId: true,
                            panel: true,
                            joinedAt: true,
                            role: true
                        }
                    })

                    // Assign ORGAN role to new user
                    await tx.user.update({
                        where: {
                            id: body.id
                        },
                        data: {
                            role: "ORGAN"
                        }
                    })

                    return { panelUser: createPanelUser, action: "created" }
                }
            }
        })

        let message = ""
        switch (result.action) {
            case "created":
                message = "کاربر جدید به عنوان ORGAN به پنل اضافه شد"
                break
            case "updated":
                message = "کاربر ORGAN پنل به‌روزرسانی شد"
                break
            case "updated_role":
                message = "نقش کاربر به ORGAN تغییر یافت"
                break
        }

        return NextResponse.json({
            ...result,
            message
        }, { status: result.action === "created" ? 201 : 200 })

    } catch (error) {
        console.error("Error in POST /api/panels/[id]/eco:", error)
        return NextResponse.json({
            error: "خطا در انجام عملیات"
        }, { status: 500 })
    }
}
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({
            error: "لطفا وارد حساب کاربری خود شوید"
        })
    }

    try {
        const members = await prisma.user.findMany({
            where: {
                panelMember: {
                    some: {
                        panelId: params.id
                    }
                }
            },
            select: {
                panelMember: {
                    where: {
                        panelId: params.id
                    },
                    select: {
                        credit: true,
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json({
            members
        }, { status: 200 })
    } catch {
        return NextResponse.json({
            error: "خطا در دریافت اعضا"
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession()

        // Check authentication and authorization
        if (!session) {
            return NextResponse.json({ error: "لطفا وارد شوید" }, { status: 401 })
        }

        // Normalize role for comparison
        const userRole = session.role?.toString().trim().toUpperCase()
        const allowedRoles = ["ADMIN", "ORGAN"]

        if (!allowedRoles.includes(userRole)) {
            return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
        }

        // Verify panel exists and user has access
        const panel = await prisma.panel.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: { id: true, email: true }
                },
                panelUser: {
                    select: { userId: true }
                }
            }
        })

        if (!panel) {
            return NextResponse.json({ error: "پنل مورد نظر یافت نشد" }, { status: 404 })
        }

        // If user is ORGAN, check if they own this panel
        if (userRole === "ORGAN" && !panel.panelUser.find(user => user.userId == session.userId)) {
            return NextResponse.json({
                error: "شما فقط می‌توانید به پنل‌های خود اعضا اضافه کنید"
            }, { status: 403 })
        }

        const body = await request.json()
        const { userIds, initialCredit = 0 } = body

        // Validate request body
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({
                error: "لیست کاربران الزامی است"
            }, { status: 400 })
        }

        if (initialCredit < 0) {
            return NextResponse.json({
                error: "اعتبار اولیه نمی‌تواند منفی باشد"
            }, { status: 400 })
        }

        // Verify all users exist
        const users = await prisma.user.findMany({
            where: {
                id: { in: userIds }
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
            }
        })

        if (users.length !== userIds.length) {
            const foundUserIds = users.map(user => user.id)
            const missingUserIds = userIds.filter(id => !foundUserIds.includes(id))

            return NextResponse.json({
                error: `کاربران با شناسه‌های زیر یافت نشدند: ${missingUserIds.join(', ')}`
            }, { status: 404 })
        }

        // Check for existing memberships to avoid duplicates
        const existingMemberships = await prisma.membersOnPanel.findMany({
            where: {
                panelId: params.id,
                userId: { in: userIds }
            },
            select: {
                userId: true,
                user: {
                    select: { email: true }
                }
            }
        })

        if (existingMemberships.length > 0) {
            const existingUserEmails = existingMemberships.map(member => member.user.email)
            return NextResponse.json({
                error: `کاربران زیر قبلاً به این پنل اضافه شده‌اند: ${existingUserEmails.join(', ')}`
            }, { status: 409 })
        }

        // Get the PanelUser ID for the current user (if they are a panel user)
        let panelUserId: string | null = null

        // For ORGAN users who own the panel, find their PanelUser record
        if (panel.adminId === session.userId) {
            const panelUser = await prisma.panelUser.findFirst({
                where: {
                    panelId: params.id,
                    userId: session.userId
                },
                select: { id: true }
            })
            panelUserId = panelUser?.id || null
        }

        // Get all panel users with approval roles (ADMIN, ECO, ACC)
        const approvalPanelUsers = await prisma.panelUser.findMany({
            where: {
                panelId: params.id,
                role: { in: ['ADMIN', 'ECO', 'ACC'] }
            },
            select: {
                id: true,
                role: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        // Create memberships and credit transactions in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create all memberships with zero initial credit
            const memberships = await tx.membersOnPanel.createMany({
                data: userIds.map(userId => ({
                    panelId: params.id,
                    userId: userId,
                    credit: 0, // Start with zero credit until approved
                    isActive: true
                }))
            })

            // Get the created memberships
            const createdMemberships = await tx.membersOnPanel.findMany({
                where: {
                    panelId: params.id,
                    userId: { in: userIds }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true
                        }
                    }
                }
            })

            // Create pending credit transactions for each user
            const creditTransactions = await Promise.all(
                userIds.map(userId =>
                    tx.panelCreditTransaction.create({
                        data: {
                            amount: initialCredit,
                            status: 'PENDING',
                            type: 'INITIAL',
                            panelId: params.id,
                            userId: userId,
                            requestedBy: session.userId!,
                            // Create approval records for each required role
                            approvals: {
                                create: approvalPanelUsers.map(panelUser => ({
                                    panelUserId: panelUser.id,
                                    role: panelUser.role,
                                    status: 'PENDING'
                                }))
                            }
                        },
                        include: {
                            approvals: {
                                include: {
                                    panelUser: {
                                        include: {
                                            user: {
                                                select: {
                                                    firstName: true,
                                                    lastName: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })
                )
            )

            // Get client IP and user agent for activity log
            const ipAddress = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'
            const userAgent = request.headers.get('user-agent') || 'unknown'

            // Create activity log entry
            await tx.panelActivityLog.create({
                data: {
                    panelId: params.id,
                    userId: panelUserId,
                    action: "ADD_MEMBERS",
                    details: {
                        addedUserIds: userIds,
                        addedUserEmails: users.map(u => u.email),
                        initialCredit: initialCredit,
                        totalAdded: userIds.length,
                        performedBy: session.userId,
                        performedByRole: userRole,
                        creditTransactions: creditTransactions.map(tx => ({
                            id: tx.id,
                            amount: tx.amount,
                            status: tx.status
                        }))
                    },
                    ipAddress: ipAddress,
                    userAgent: userAgent
                }
            })

            return {
                memberships: createdMemberships,
                creditTransactions: creditTransactions
            }
        })

        return NextResponse.json({
            message: `${userIds.length} عضو با موفقیت به پنل اضافه شدند`,
            members: result.memberships,
            creditTransactions: result.creditTransactions,
            totalAdded: userIds.length,
            initialCredit: initialCredit,
            note: "اعتبار اولیه در حالت انتظار تایید می‌باشد و پس از تایید توسط ADMIN, ECO, ACC به حساب اعضا اضافه خواهد شد"
        }, { status: 201 })

    } catch (error: any) {
        console.error("Error adding members to panel:", error)

        // Handle specific Prisma errors
        if (error.code === 'P2003') {
            return NextResponse.json({
                error: "خطا در ایجاد لاگ فعالیت"
            }, { status: 500 })
        }

        if (error.code === 'P2002') {
            return NextResponse.json({
                error: "برخی از کاربران قبلاً به این پنل اضافه شده‌اند"
            }, { status: 409 })
        }

        return NextResponse.json({
            error: "خطا در افزودن اعضا به پنل"
        }, { status: 500 })
    }
}
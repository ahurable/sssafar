import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// app/api/transactions/[id]/approve/route.ts
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "لطفا وارد شوید" }, { status: 401 })
        }

        const { approved } = await request.json()

        const transaction = await prisma.$transaction(async (tx) => {
            // Get the transaction with approvals
            const existingTransaction = await tx.panelCreditTransaction.findUnique({
                where: { id: params.id },
                include: {
                    approvals: {
                        include: {
                            panelUser: true
                        }
                    }
                }
            })

            if (!existingTransaction) {
                throw new Error("تراکنش یافت نشد")
            }

            // Get the panel user making the approval
            const panelUser = await tx.panelUser.findFirst({
                where: {
                    panelId: existingTransaction.panelId,
                    userId: session.userId
                }
            })

            if (!panelUser) {
                throw new Error("دسترسی غیرمجاز")
            }

            // Update approval status
            await tx.panelCreditTransactionApproval.update({
                where: {
                    transactionId_panelUserId: {
                        transactionId: params.id,
                        panelUserId: panelUser.id
                    }
                },
                data: {
                    status: approved ? 'APPROVED' : 'REJECTED',
                    [approved ? 'approvedAt' : 'rejectedAt']: new Date()
                }
            })

            // Check if all required approvals are received
            const updatedTransaction = await tx.panelCreditTransaction.findUnique({
                where: { id: params.id },
                include: {
                    approvals: true
                }
            })

            if (!updatedTransaction) throw new Error("تراکنش یافت نشد")

            const approvedCount = updatedTransaction.approvals.filter(a => a.status === 'APPROVED').length
            const rejectedCount = updatedTransaction.approvals.filter(a => a.status === 'REJECTED').length

            // If all three roles approved, update the transaction and member credit
            if (approvedCount === 3) {
                await tx.panelCreditTransaction.update({
                    where: { id: params.id },
                    data: { status: 'APPROVED' }
                })

                // Add credit to member
                await tx.membersOnPanel.update({
                    where: {
                        panelId_userId: {
                            panelId: updatedTransaction.panelId,
                            userId: updatedTransaction.userId
                        }
                    },
                    data: {
                        credit: {
                            increment: updatedTransaction.amount.toNumber()
                        }
                    }
                })
            } else if (rejectedCount > 0) {
                // If any rejection, mark as rejected
                await tx.panelCreditTransaction.update({
                    where: { id: params.id },
                    data: { status: 'REJECTED' }
                })
            }

            return tx.panelCreditTransaction.findUnique({
                where: { id: params.id },
                include: {
                    approvals: {
                        include: {
                            panelUser: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
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
        })

        return NextResponse.json({ transaction })
    } catch (error: any) {
        console.error("Error approving transaction:", error)
        return NextResponse.json({ error: error.message || "خطا در تایید تراکنش" }, { status: 500 })
    }
}
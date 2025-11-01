import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (request: NextRequest) => {
    const session = await getSession()
    if (!session || session.role !== "ADMIN") {
        return null
    }

    try {
        const creditTransactions = await prisma.creditTransaction.findMany()
        const panelCreditTransactions = await prisma.panelCreditTransaction.findMany()
        const userTransactions = await prisma.userTransaction.findMany()

        return NextResponse.json({
            creditTransactions,
            panelCreditTransactions,
            userTransactions
        }, { status: 200 })
    } catch {
        return null
    }
}
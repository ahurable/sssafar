import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export const POST = async (request: NextRequest, { params }: { params: { id: string } }) => {

    const session = await getSession()

    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            message: "دسترسی غیر مجاز"
        }, { status: 401 })
    }

    try {
        const { title } = await request.json()
        await prisma.airportServeType.create({
            data: {
                airportId: params.id,
                title: title
            }
        })
        return NextResponse.json({
            message: "عملیات موفق"
        }, { status: 201 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: "خطای سیستمی"
        }, { status: 500 })
    }

}


export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
    const session = await getSession()
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({
            message: "خطای دسترسی"
        }, { status: 403 })
    }
    try {
        const airportServices = await prisma.airportServeType.findMany({
            where: {
                airportId: params.id
            }
        })

        return NextResponse.json(airportServices, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            message: "خطای سیستمی"
        }, { status: 500 })
    }
}


export const PUT = async (request: NextRequest, { params }: { params: { id: string } }) => {
    const session = await getSession()
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({
            message: "خطای دسترسی"
        }, { status: 403 })
    }
    try {
        const { serviceId, title } = await request.json()
        const airportService = await prisma.airportServeType.update({
            where: {
                id: serviceId
            },
            data: {
                title: title
            }
        })

        return NextResponse.json(airportService, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            message: "خطای سیستمی"
        }, { status: 500 })
    }
}



export const DELETE = async (request: NextRequest, { params }: { params: { id: string } }) => {
    const session = await getSession()
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({
            message: "خطای دسترسی"
        }, { status: 403 })
    }
    try {
        const { serviceId } = await request.json()
        const airportService = await prisma.airportServeType.delete({
            where: {
                id: serviceId
            }
        })

        return NextResponse.json(airportService, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            message: "خطای سیستمی"
        }, { status: 500 })
    }
}
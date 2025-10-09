import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (request: NextRequest, {params}:{params: {id:string} }) =>  {

    const session = await getSession()

    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            error: 'لطفا وارد حساب کاربری خود شوید'
        }, { status: 401  })
    }

    // try {
        const contract = await prisma.contract.findUnique({
            where: {
                id: params.id
            },
            select: {
                id: true,
                title: true,
                description: true,
                organizationName: true,
                files: true,
                status: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true
            }
        })
        return NextResponse.json({
            contract
        }, { status: 200 })
    // } catch {
    //     return NextResponse.json({
    //         error: 'قرارداد یافت نشد'
    //     }, { status: 404 })
    // }

}


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;
    const body = await request.json();

    const { title, description, organizationName, status, closeReason } = body;

    const contract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(organizationName && { organizationName }),
        ...(status && { status }),
        ...(closeReason !== undefined && { closeReason }),
      },
      include: {
        files: {
          select: {
            id: true,
            filename: true,
            mimetype: true,
            size: true,
            path: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Contract updated successfully',
      contract,
    });
  } catch (error) {
    console.error('Contract update error:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}
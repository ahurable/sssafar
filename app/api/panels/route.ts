// /app/api/prisma-diagnostic/route.ts
import { NextResponse, NextRequest } from "next/server"
import { prisma } from '@/lib/prisma'
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({
            error: 'لطفا وارد شوید'
        }, {status:401})
    }

    if (session && session.role == "ADMIN") {
      const panels = await prisma.panel.findMany({
            include: {
                panelUser : {
                  select: {
                    id: true,
                    userId: true,
                    user: {
                      select: {
                        email: true
                      }
                    }
                  }
                },
                _count: {
                  select: {
                    panelUser: true
                  }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json({ panels })
    }
    
    const userPanels = await prisma.panel.findMany({
        where: {
            panelUser: {
                some: {
                  userId: session.userId
                }
            }
        },
        
        include: {
            panelUser : {
              select: {
                id: true,
                userId: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            },
            _count: {
              select: {
                panelUser: true
              }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        
    })

    const panels = await prisma.panel.findMany({
      where: {
        members: {
          some: {
            userId: session.userId
          }
        }
      }
    })

    return NextResponse.json( { userPanels, panels }, { status: 200 })

    // Test if prisma is available
    if (!prisma) {
      throw new Error("Prisma client is not available")
    }
    
  } catch (error) {
    console.error("[PANELS_GET]", error)
    return NextResponse.json(
      { error: "خطا در دریافت پنل‌ها" },
      { status: 500 }
    )
  }
}


export async function POST(request: NextRequest) {
  
  try {
    const session = await getSession()
    console.log("Session received:", session)

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: "لطفا وارد شوید" }, { status: 401 })
    }

    

    const body = await request.json()
    console.log("Request body:", body)
    
    const { name, description, slug, isActive = true } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: "نام و شناسه پنل الزامی است" },
        { status: 400 }
      )
    }

    console.log("Checking slug uniqueness...")
    // Check if slug is unique
    const existingPanel = await prisma.panel.findUnique({
      where: { slug },
    })

    if (existingPanel) {
      return NextResponse.json(
        { error: "این شناسه قبلا استفاده شده است" },
        { status: 400 }
      )
    }

    console.log("Creating panel...")
    // Create panel
    const panel = await prisma.panel.create({
      data: {
        name,
        description,
        slug,
        isActive,
        adminId: session.userId
      },
      include: {
        _count: {
          select: {
            panelUser: true,
          },
        },
      },
    })

    console.log("Panel created successfully:", panel.id)
    return NextResponse.json({ panel }, { status: 201 })
    
  } catch (error) {
    console.error("[PANELS_POST] Full error:", error)
    
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    return NextResponse.json(
      { error: "خطا در ایجاد پنل" },
      { status: 500 }
    )
  } finally {
    // Always close the connection
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}
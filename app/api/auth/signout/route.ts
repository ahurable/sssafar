import { NextResponse } from "next/server"
import { clearSession } from "@/lib/auth"

export async function POST() {
  try {
    await clearSession()

    return NextResponse.json({
      success: true,
      message: "با موفقیت خارج شدید",
    })
  } catch (error: any) {
    console.error("[v0] Signout error:", error)
    return NextResponse.json({ error: "خطا در خروج" }, { status: 500 })
  }
}

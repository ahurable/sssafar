import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { UserDetailView } from "@/components/admin/user-detail-view"

interface Props {
  params: {
    id: string
  }
}

export default async function AdminUserDetailPage({ params }: Props) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <UserDetailView userId={params.id} />
      </div>
    </div>
  )
}
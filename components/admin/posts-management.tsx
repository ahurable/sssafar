"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { CreatePostDialog } from "./create-post-dialog"
import { EditPostDialog } from "./edit-post-dialog"

interface Post {
  id: string
  title: string
  excerpt: string
  category: string
  published: boolean
  featured: boolean
  views: number
  createdAt: string
  author: {
    firstName: string | null
    lastName: string | null
  }
}

export function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editPost, setEditPost] = useState<Post | null>(null)

  const fetchPosts = () => {
    setLoading(true)
    fetch("/api/posts?published=false")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error fetching posts:", error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این پست اطمینان دارید؟")) return

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("[v0] Error deleting post:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{posts.length} پست</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          پست جدید
        </Button>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    {post.published && <Badge className="bg-green-500">منتشر شده</Badge>}
                    {post.featured && <Badge className="bg-purple-500">ویژه</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>دسته: {post.category}</span>
                    <span>بازدید: {post.views.toLocaleString("fa-IR")}</span>
                    <span>
                      نویسنده:{" "}
                      {post.author.firstName && post.author.lastName
                        ? `${post.author.firstName} ${post.author.lastName}`
                        : "نامشخص"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditPost(post)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={fetchPosts} />
      {editPost && (
        <EditPostDialog
          post={editPost}
          open={!!editPost}
          onOpenChange={() => setEditPost(null)}
          onSuccess={fetchPosts}
        />
      )}
    </div>
  )
}

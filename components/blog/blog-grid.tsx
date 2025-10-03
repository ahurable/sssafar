"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Calendar, User } from "lucide-react"
import { blogPosts } from "@/lib/data/blog-posts"

export function BlogGrid() {
  const [posts] = useState(blogPosts)

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">{posts.length} مقاله یافت شد</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="group h-full overflow-hidden transition-all hover:shadow-xl">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  {post.category}
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="mb-3 text-xl font-bold leading-tight text-balance group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

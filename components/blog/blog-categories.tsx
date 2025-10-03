"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { blogPosts } from "@/lib/data/blog-posts"

export function BlogCategories() {
  const categories = Array.from(new Set(blogPosts.map((post) => post.category)))
  const categoryCounts = categories.map((category) => ({
    name: category,
    count: blogPosts.filter((post) => post.category === category).length,
  }))

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>دسته‌بندی‌ها</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {categoryCounts.map((category) => (
          <button
            key={category.name}
            className="flex w-full items-center justify-between rounded-lg p-3 text-right transition-colors hover:bg-muted"
          >
            <span className="font-medium">{category.name}</span>
            <Badge variant="secondary">{category.count}</Badge>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

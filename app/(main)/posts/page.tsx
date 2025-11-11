import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, User } from "lucide-react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags: string[]
  published: boolean
  featured: boolean
  views: number
  createdAt: string
  author: {
    firstName: string | null
    lastName: string | null
  }
}

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts?published=true`, {
      next: { revalidate: 60 }
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch posts')
    }
    
    const data = await res.json()
    return data.posts || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8" dir="rtl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">مقالات</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            جدیدترین مقالات و مطالب آموزشی در زمینه‌های مختلف
          </p>
        </div>

        {/* Featured Posts */}
        {posts.filter(post => post.featured).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-right">مقالات ویژه</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {posts.filter(post => post.featured).slice(0, 2).map((post) => (
                <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
                  <Link href={`/posts/${post.id}`}>
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-red-500 hover:bg-red-600">ویژه</Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>
                              {post.author.firstName && post.author.lastName
                                ? `${post.author.firstName} ${post.author.lastName}`
                                : "نامشخص"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(post.createdAt).toLocaleDateString('fa-IR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views.toLocaleString('fa-IR')}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="secondary">{post.category}</Badge>
                          <span className="text-blue-600 font-semibold text-sm group-hover:underline">
                            مطالعه بیشتر
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
              <Link href={`/posts/${post.slug}`}>
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {post.featured && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500 hover:bg-red-600">ویژه</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.createdAt).toLocaleDateString('fa-IR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views.toLocaleString('fa-IR')}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <span className="text-blue-600 text-xs font-semibold group-hover:underline">
                        مطالعه بیشتر
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">مقاله‌ای یافت نشد.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
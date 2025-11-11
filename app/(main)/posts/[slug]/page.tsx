import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Eye, User, ArrowLeft, Share2 } from "lucide-react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  images: string[]
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
  tables?: Array<{
    id: string
    title: string
    content: string
    order: number
  }>
  metadata?: {
    readingTime: number
    seoTitle: string
    seoDescription: string
  }
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/slug/${slug}`, {
      next: { revalidate: 60 }
    })
    
    if (!res.ok) {
      return null
    }
    
    const data = await res.json()
    return data.post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post || !post.published) {
    notFound()
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <Link href="/posts">
                <Button variant="secondary" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  بازگشت به مقالات
                </Button>
              </Link>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="secondary" className="bg-white bg-opacity-20 text-white">
                  {post.category}
                </Badge>
                {post.featured && (
                  <Badge className="bg-red-500">ویژه</Badge>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-200">
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
                  {post.metadata?.readingTime && (
                    <div className="flex items-center gap-1">
                      <span>⏱️ {post.metadata.readingTime} دقیقه</span>
                    </div>
                  )}
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <p className="text-xl text-gray-200 max-w-3xl">{post.excerpt}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8">
                  {/* Content */}
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-img:rounded-lg prose-img:shadow-md"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Additional Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-2xl font-bold mb-4">تصاویر مرتبط</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {post.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${post.title} - تصویر ${index + 1}`}
                            className="rounded-lg shadow-md w-full h-64 object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tables */}
                  {post.tables && post.tables.length > 0 && (
                    <div className="mt-8 space-y-6">
                      {post.tables.map((table) => (
                        <div key={table.id} className="border rounded-lg p-6 bg-gray-50">
                          <h4 className="text-xl font-bold mb-4 text-gray-900">{table.title}</h4>
                          <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: table.content }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-xl font-bold mb-4">برچسب‌ها</h3>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Share Buttons */}
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">اشتراک گذاری:</span>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 ml-2" />
                        اشتراک
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">دسته‌بندی‌ها</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      {post.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {post.metadata?.seoDescription && (
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">خلاصه مقاله</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {post.metadata.seoDescription}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
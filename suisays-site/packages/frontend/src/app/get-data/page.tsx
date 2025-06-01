'use client'

import { useEffect, useState } from 'react'
import { getAllSuiSaysData } from '../scripts/get-data'

interface Comment {
  id: string
  content: string
}

interface Post {
  id: string
  title: string
  content: string
  comments: Comment[]
}

interface SuiSaysData {
  message: string
  postCount: number
  posts: Post[]
}

export default function HomePage() {
  const [data, setData] = useState<SuiSaysData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await getAllSuiSaysData()
        setData(fetchedData)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h1>Welcome to Next.js!</h1>
      <p>{data?.message}</p>
      <h2>Posts ({data?.postCount})</h2>
      {data?.posts.map((post: Post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <h4>Comments:</h4>
          {post.comments.length === 0 && <p>No comments</p>}
          {post.comments.map((comment: Comment) => (
            <div key={comment.id}>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

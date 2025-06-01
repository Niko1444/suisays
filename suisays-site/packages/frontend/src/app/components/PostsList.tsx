'use client'

import React from 'react'
import { PostCard } from './PostCard'

interface Post {
  id: string
  content: string
  author: string
  authorName: string
  agreeCount: number
  disagreeCount: number
  totalDonations: number
  createdAt: number
  commentCount: number
  timeToReveal: string
  isRevealed: boolean
  revealDate?: string
}

interface PostsListProps {
  posts: Post[]
  onVote: (postId: string, voteType: 'agree' | 'disagree') => void
  onComment: (postId: string) => void
  onDonate: (postId: string) => void
}

export const PostsList = ({
  posts,
  onVote,
  onComment,
  onDonate,
}: PostsListProps) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onVote={onVote}
          onComment={onComment}
          onDonate={onDonate}
        />
      ))}
    </div>
  )
}

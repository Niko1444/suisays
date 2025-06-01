// components/PostsList.tsx
'use client'

import React from 'react'
import { PostCard } from './PostCard'
import { SuiPost } from '../lib/suiClient'

interface PostsListProps {
  posts: SuiPost[]
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
  // Filter out posts from the zero address
  const filteredPosts = posts.filter((post) => {
    if (
      post?.author ===
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    ) {
      return false
    }
    return true
  })

  if (filteredPosts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No posts available.</p>
          <p className="mt-2 text-sm text-gray-500">
            Be the first to create a post!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredPosts.map((post, index) => (
        <PostCard
          key={`post-${index}-${post?.id || 'unknown'}`}
          post={post}
          onVote={onVote}
          onComment={onComment}
          onDonate={onDonate}
        />
      ))}
    </div>
  )
}

// components/PostCard.tsx
'use client'

import React, { useState } from 'react'
import {
  Clock,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
} from 'lucide-react'

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

interface PostCardProps {
  post: Post
  onVote: (postId: string, voteType: 'agree' | 'disagree') => void
  onComment: (postId: string) => void
  onDonate: (postId: string) => void
}

const formatSUI = (mist: number) => (mist / 1000000000).toFixed(2)

export const PostCard = ({
  post,
  onVote,
  onComment,
  onDonate,
}: PostCardProps) => {
  const [selectedVote, setSelectedVote] = useState(null)
  const [showComments, setShowComments] = useState(false)

  return (
    <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6EE7B7]">
            <MessageCircle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              @{post.authorName}
            </p>
            <p className="text-sm text-gray-500">528d ago</p>
          </div>
        </div>
        {!post.isRevealed && (
          <div className="flex items-center rounded-full bg-[#6EE7B7] px-3 py-1 text-sm font-medium text-white">
            <Clock size={14} className="mr-1" />
            {post.timeToReveal}
          </div>
        )}
      </div>

      {/* Question Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold leading-tight text-gray-900">
          {post.content}
        </h3>
      </div>

      {/* Voting Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Agree */}
          <button
            onClick={() => onVote(post.id, 'agree')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ThumbsUp size={18} />
            <span className="font-medium">{post.agreeCount}</span>
          </button>

          {/* Disagree */}
          <button
            onClick={() => onVote(post.id, 'disagree')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ThumbsDown size={18} />
            <span className="font-medium">{post.disagreeCount}</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <MessageCircle size={18} />
            <span className="font-medium">{post.commentCount}</span>
          </button>

          {/* Donations */}
          <div className="flex items-center space-x-1 text-orange-500">
            <DollarSign size={18} />
            <span className="font-medium">
              {formatSUI(post.totalDonations)}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDonate(post.id)}
          className="rounded-full bg-[#6EE7B7] px-4 py-2 font-semibold text-white hover:bg-[#5DD4AC]"
        >
          Donate
        </button>
      </div>
    </div>
  )
}

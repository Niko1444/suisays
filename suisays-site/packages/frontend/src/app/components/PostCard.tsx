// components/PostCard.tsx
'use client'

import React, { useState } from 'react'
import { MessageCircle, ThumbsUp, ThumbsDown, DollarSign } from 'lucide-react'
import { Post } from '../hooks/useSuiSays' // ← Import the Post interface
import { formatSUI, getRelativeTime } from '../lib/suiClient'

interface PostCardProps {
  post: Post // ← Change from SuiPost to Post
  onVote: (postId: string, voteType: 'agree' | 'disagree') => void
  onComment: (postId: string) => void
  onDonate: (postId: string) => void
}

// Helper function to safely format numbers
const safeNumber = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0'
  }
  return value.toString()
}

// Helper function to shorten address
const shortenAddress = (address: string): string => {
  if (!address || address === '0x0') return 'Unknown'
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Helper function to copy address to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

export const PostCard = ({
  post,
  onVote,
  onComment,
  onDonate,
}: PostCardProps) => {
  const [selectedVote, setSelectedVote] = useState<'agree' | 'disagree' | null>(
    null
  )
  const [showComments, setShowComments] = useState(false)
  const [showFullAddress, setShowFullAddress] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Safe parsing of numeric values
  const agreeCount = isNaN(post.agreeCount) ? 0 : post.agreeCount // ← NEW
  const disagreeCount = isNaN(post.disagreeCount) ? 0 : post.disagreeCount // ← NEW
  const totalDonations = isNaN(post.totalDonations) ? 0 : post.totalDonations // ← NEW
  const createdAt = isNaN(post.createdAt) ? Date.now() : post.createdAt // ← NEW

  const handleVote = (voteType: 'agree' | 'disagree') => {
    setSelectedVote(voteType)
    onVote(post.id, voteType)
  }

  const handleAddressCopy = async () => {
    const success = await copyToClipboard(post.author)
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  return (
    <div className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6EE7B7]">
            <MessageCircle size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFullAddress(!showFullAddress)}
                className="cursor-pointer text-base font-semibold text-gray-900 transition-colors hover:text-blue-600"
                title="Click to toggle full address"
              >
                {showFullAddress ? post.author : shortenAddress(post.author)}
              </button>
              <button
                onClick={handleAddressCopy}
                className="rounded border border-gray-200 px-1 py-0.5 text-xs text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600"
                title="Copy address"
              >
                {copySuccess ? '✓' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {getRelativeTime(createdAt)}
            </p>
          </div>
        </div>
        <div className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-400">
          #{post.id}
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold leading-tight text-black">
          {post.content}
        </h3>
      </div>

      {/* Voting Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Agree */}
          <button
            onClick={() => handleVote('agree')}
            className={`flex items-center space-x-2 transition-colors ${
              selectedVote === 'agree'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <ThumbsUp size={18} />
            <span className="font-medium">{safeNumber(agreeCount)}</span>
          </button>

          {/* Disagree */}
          <button
            onClick={() => handleVote('disagree')}
            className={`flex items-center space-x-2 transition-colors ${
              selectedVote === 'disagree'
                ? 'text-red-600'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <ThumbsDown size={18} />
            <span className="font-medium">{safeNumber(disagreeCount)}</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => {
              setShowComments(!showComments)
              onComment(post.id)
            }}
            className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-blue-600"
          >
            <MessageCircle size={18} />
            <span className="font-medium">Reply</span>
          </button>

          {/* Donations */}
          <div className="flex items-center space-x-1 text-orange-500">
            <DollarSign size={18} />
            <span className="font-medium">{formatSUI(totalDonations)}</span>
          </div>
        </div>

        <button
          onClick={() => onDonate(post.id)}
          className="rounded-full bg-[#6EE7B7] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#5DD4AC]"
        >
          Donate
        </button>
      </div>

      {/* Debug info (remove in production) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-400">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <div className="mt-1 space-y-1">
              <div>
                <strong>ID:</strong> {post.id}
              </div>
              <div>
                <strong>Author:</strong> {post.author}
              </div>
              <div>
                <strong>Content:</strong> "{post.content}"
              </div>
              <div>
                <strong>Agree:</strong> {post.agree_count} (isNaN:{' '}
                {isNaN(post.agree_count) ? 'yes' : 'no'})
              </div>
              <div>
                <strong>Disagree:</strong> {post.disagree_count} (isNaN:{' '}
                {isNaN(post.disagree_count) ? 'yes' : 'no'})
              </div>
              <div>
                <strong>Donations:</strong> {post.total_donations} (isNaN:{' '}
                {isNaN(post.total_donations) ? 'yes' : 'no'})
              </div>
              <div>
                <strong>Created:</strong> {post.created_at} (isNaN:{' '}
                {isNaN(post.created_at) ? 'yes' : 'no'})
              </div>
            </div>
          </details>
        </div>
      )} */}
    </div>
  )
}

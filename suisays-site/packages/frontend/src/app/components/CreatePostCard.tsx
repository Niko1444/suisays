// components/CreatePostCard.tsx (updated)
'use client'

import React, { useState } from 'react'
import { Plus, MessageCircle } from 'lucide-react'

interface CreatePostCardProps {
  onCreatePost: (content: string) => void
  disabled?: boolean
}

export const CreatePostCard = ({
  onCreatePost,
  disabled = false,
}: CreatePostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState('')

  if (!isExpanded) {
    return (
      <div
        onClick={() => !disabled && setIsExpanded(true)}
        className={`cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6EE7B7]">
            <Plus size={20} className="text-white" />
          </div>
          <p className="text-base text-gray-500">
            {disabled
              ? 'Connect wallet to ask a question...'
              : 'Ask a question...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6EE7B7]">
          <MessageCircle size={20} className="text-white" />
        </div>
        <p className="text-base font-semibold">@your.username</p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Question title"
          className="w-full rounded-lg border border-gray-200 p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]"
          disabled={disabled}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your question here..."
          className="h-24 w-full resize-none rounded-lg border border-gray-200 p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]"
          disabled={disabled}
        />
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(false)}
            className="text-base text-gray-500 hover:text-gray-700"
            disabled={disabled}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (content.trim() && !disabled) {
                onCreatePost(content)
                setContent('')
                setIsExpanded(false)
              }
            }}
            disabled={!content.trim() || disabled}
            className="rounded-full bg-[#6EE7B7] px-6 py-2 font-semibold text-white hover:bg-[#5DD4AC] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { StatusBar } from './components/StatusBar'
import { Header } from './components/Header'
import { TabNavigation } from './components/TabNavigation'
import { CreatePostCard } from './components/CreatePostCard'
import { PostsList } from './components/PostsList'
import { BottomNavigation } from './components/BottomNavigation'
import { WalletConnector } from './components/WalletConnector'
import { useSuiSays } from './hooks/useSuiSays'

export default function SuisaysApp() {
  const [activeTab, setActiveTab] = useState('trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeBottomTab, setActiveBottomTab] = useState('home')

  const {
    posts,
    loading,
    error,
    createPost,
    vote,
    donate,
    addComment,
    loadPosts,
    isConnected,
    userAddress,
  } = useSuiSays()

  const handleVote = async (postId: string, voteType: 'agree' | 'disagree') => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    const success = await vote(postId, voteType)
    if (success) {
      console.log(`Successfully voted ${voteType} on post ${postId}`)
    }
  }

  const handleComment = async (postId: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    // For now, just show a simple prompt
    const content = prompt('Enter your comment:')
    const voteSide = confirm('Do you agree with this post?')
      ? 'agree'
      : 'disagree'

    if (content) {
      const success = await addComment(
        postId,
        content,
        voteSide as 'agree' | 'disagree'
      )
      if (success) {
        console.log(`Successfully added comment to post ${postId}`)
      }
    }
  }

  const handleDonate = async (postId: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    const amountStr = prompt('Enter donation amount in SUI:')
    if (amountStr) {
      const amount = parseFloat(amountStr)
      if (amount > 0) {
        const success = await donate(postId, amount)
        if (success) {
          console.log(`Successfully donated ${amount} SUI to post ${postId}`)
        }
      }
    }
  }

  const handleCreatePost = async (content: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    const success = await createPost(content)
    if (success) {
      console.log('Successfully created post')
    }
  }

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab)
    if (tab === 'trending') {
      await loadPosts('trending')
    } else {
      await loadPosts('recent')
    }
  }

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F1FDF5] p-4">
      <div className="flex h-[80vh] max-w-md flex-col overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-xl">
        <StatusBar />

        <div className="bg-white">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isConnected={isConnected}
            userAddress={userAddress}
          />
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
          {!isConnected && (
            <div className="mb-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Connect Wallet
                  </h3>
                  <p className="text-sm text-yellow-600">
                    Connect your Sui wallet to create posts and interact
                  </p>
                </div>
                <WalletConnector />
              </div>
            </div>
          )}

          <CreatePostCard
            onCreatePost={handleCreatePost}
            disabled={!isConnected}
          />

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#6EE7B7]"></div>
            </div>
          ) : (
            <PostsList
              posts={filteredPosts}
              onVote={handleVote}
              onComment={handleComment}
              onDonate={handleDonate}
            />
          )}
        </div>

        <BottomNavigation
          activeTab={activeBottomTab}
          onTabChange={setActiveBottomTab}
        />
      </div>
    </div>
  )
}

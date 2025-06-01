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
    <div className="fixed inset-0 bg-gradient-to-br from-pink-100 via-blue-50 to-purple-100">
      {/* Cute doodle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating hearts */}
        <div className="absolute left-10 top-20 animate-bounce text-6xl text-pink-300">
          💖
        </div>
        <div className="absolute right-20 top-60 animate-pulse text-4xl text-red-300">
          💝
        </div>
        <div className="absolute bottom-32 left-20 animate-ping text-5xl text-pink-400">
          💕
        </div>

        {/* Floating stars */}
        <div className="absolute left-1/3 top-40 animate-spin text-5xl text-yellow-400">
          ⭐
        </div>
        <div className="absolute right-10 top-80 animate-bounce text-3xl text-yellow-300">
          ✨
        </div>
        <div className="absolute bottom-60 right-1/3 animate-pulse text-4xl text-yellow-500">
          🌟
        </div>

        {/* Cute animals and objects */}
        <div className="absolute right-1/4 top-10 animate-bounce text-5xl text-blue-400">
          🦄
        </div>
        <div className="absolute left-5 top-96 animate-pulse text-4xl text-green-400">
          🌈
        </div>
        <div className="absolute bottom-20 right-5 animate-spin text-3xl text-purple-400">
          🎈
        </div>

        {/* Crypto-themed cute elements */}
        <div className="absolute left-1/4 top-72 animate-bounce text-4xl text-orange-400">
          🪙
        </div>
        <div className="absolute bottom-80 left-1/2 animate-pulse text-3xl text-blue-500">
          💎
        </div>
        <div className="absolute right-1/2 top-32 animate-ping text-4xl text-green-500">
          🚀
        </div>

        {/* More playful elements */}
        <div className="absolute bottom-40 left-10 animate-bounce text-3xl text-cyan-400">
          🌙
        </div>
        <div className="absolute left-2/3 top-20 animate-pulse text-2xl text-purple-300">
          ☁️
        </div>
        <div className="absolute bottom-10 right-1/4 animate-spin text-4xl text-pink-500">
          🎀
        </div>

        {/* Subtle geometric doodles */}
        <div className="absolute left-1/2 top-16 h-8 w-8 animate-pulse rounded-full bg-blue-200 opacity-60"></div>
        <div className="absolute right-8 top-52 h-6 w-6 animate-bounce rounded-full bg-pink-200 opacity-50"></div>
        <div className="absolute bottom-28 left-1/3 h-10 w-10 animate-ping rounded-full bg-purple-200 opacity-40"></div>
        <div className="absolute right-12 top-24 h-4 w-4 animate-pulse rounded-full bg-yellow-200 opacity-70"></div>
      </div>

      {/* Main content */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="flex h-[80vh] max-w-md flex-col overflow-hidden rounded-3xl border border-white border-opacity-50 bg-white bg-opacity-80 shadow-2xl backdrop-blur-sm">
          <StatusBar />

          <div className="bg-white bg-opacity-90 backdrop-blur-sm">
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isConnected={isConnected}
              userAddress={userAddress}
            />
            <TabNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
            {!isConnected && (
              <div className="mb-4 rounded-2xl border border-yellow-200 border-opacity-50 bg-yellow-50 bg-opacity-80 p-4 backdrop-blur-sm">
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
              <div className="rounded-2xl border border-red-200 border-opacity-50 bg-red-50 bg-opacity-80 p-4 backdrop-blur-sm">
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

          <div className="bg-white bg-opacity-90 backdrop-blur-sm">
            <BottomNavigation
              activeTab={activeBottomTab}
              onTabChange={setActiveBottomTab}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

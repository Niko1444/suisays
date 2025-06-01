// hooks/useSuiSays.ts
import { useState, useEffect, useCallback } from 'react'
import { SuiSaysContract, SuiPost } from '../lib/suiClient'
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit'

export interface Post {
  id: string
  content: string
  author: string
  authorName: string
  agreeCount: number
  disagreeCount: number
  totalDonations: number
  createdAt: number
  commentCount: number
}

export const useSuiSays = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  // Helper function to convert SuiPost to Post
  const convertSuiPostToPost = (suiPost: SuiPost): Post => {
    // Generate a username from the author address
    const generateUsername = (address: string): string => {
      // Simple username generation logic
      return address.slice(0, 6) + '...' + address.slice(-4)
    }

    const converted = {
      id: suiPost.id,
      content: suiPost.content,
      author: suiPost.author,
      authorName: generateUsername(suiPost.author),
      agreeCount: suiPost.agree_count, // ← Should be 1
      disagreeCount: suiPost.disagree_count, // ← Should be 0
      totalDonations: suiPost.total_donations,
      createdAt: suiPost.created_at,
      commentCount: 0, // TODO: Fetch comment count
    }

    console.log('✅ Converted Post:', converted)
    return converted
  }

  // Load posts from the blockchain
  const loadPosts = useCallback(
    async (type: 'recent' | 'trending' = 'recent') => {
      setLoading(true)
      setError(null)

      try {
        // 1. Get real post IDs (not fake ones)
        const postIds = await SuiSaysContract.getAllPostIds()
        console.log('📋 Real post IDs from contract:', postIds)

        if (postIds.length > 0) {
          // 2. Fetch the raw SuiPost data
          const suiPosts = await SuiSaysContract.getPosts(postIds)
          console.log('📊 Raw SuiPosts from contract:', suiPosts)

          // 3. Convert to your Post interface
          const postsData = suiPosts.map(convertSuiPostToPost)
          console.log('📊 Converted posts data:', postsData)

          // 4. Check final state
          setPosts(postsData)
          console.log('📊 Final posts state:', postsData)
        } else {
          setPosts([])
        }
      } catch (err) {
        console.error('❌ Error loading posts:', err)
        setError('Failed to load posts')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Create a new post
  const createPost = useCallback(
    async (content: string): Promise<boolean> => {
      if (!currentAccount) {
        setError('Wallet not connected')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const transactionBlock =
          await SuiSaysContract.createPostTransaction(content)

        return new Promise((resolve) => {
          signAndExecuteTransaction(
            {
              transaction: transactionBlock,
              chain: 'sui:testnet', // or 'sui:mainnet' for production
            },
            {
              onSuccess: (result) => {
                console.log('Post created successfully:', result)
                loadPosts()
                resolve(true)
              },
              onError: (error) => {
                console.error('Error creating post:', error)
                setError('Failed to create post')
                resolve(false)
              },
            }
          )
        })
      } catch (err) {
        console.error('Error creating post:', err)
        setError('Failed to create post')
        return false
      } finally {
        setLoading(false)
      }
    },
    [currentAccount, signAndExecuteTransaction, loadPosts]
  )

  // Vote on a post
  const vote = useCallback(
    async (
      postId: string,
      voteType: 'agree' | 'disagree'
    ): Promise<boolean> => {
      if (!currentAccount) {
        setError('Wallet not connected')
        return false
      }

      console.log(`🗳️ Voting ${voteType} on post ${postId}`)

      try {
        const transactionBlock = await SuiSaysContract.voteTransaction(
          postId,
          voteType
        )

        return new Promise((resolve) => {
          signAndExecuteTransaction(
            {
              transaction: transactionBlock,
              chain: 'sui:testnet',
            },
            {
              onSuccess: async (result) => {
                console.log('✅ Vote submitted successfully:', result)

                // FIXED: Instead of optimistic update, fetch fresh data from blockchain
                try {
                  console.log('🔄 Refreshing post data after vote...')

                  // Wait a bit for the transaction to be processed
                  await new Promise((resolve) => setTimeout(resolve, 1000))

                  // Reload all posts to get fresh data
                  await loadPosts()

                  console.log('✅ Post data refreshed after vote')
                } catch (refreshError) {
                  console.error(
                    '❌ Error refreshing data after vote:',
                    refreshError
                  )
                }

                resolve(true)
              },
              onError: (error) => {
                console.error('❌ Error voting:', error)
                setError('Failed to submit vote')
                resolve(false)
              },
            }
          )
        })
      } catch (err) {
        console.error('❌ Error voting:', err)
        setError('Failed to submit vote')
        return false
      }
    },
    [currentAccount, signAndExecuteTransaction, loadPosts]
  )

  // Donate to a post
  const donate = useCallback(
    async (postId: string, amount: number): Promise<boolean> => {
      if (!currentAccount) {
        setError('Wallet not connected')
        return false
      }

      try {
        // Convert SUI to MIST (1 SUI = 1_000_000_000 MIST)
        const amountInMist = Math.floor(amount * 1_000_000_000)
        const transactionBlock = await SuiSaysContract.donateTransaction(
          postId,
          amountInMist
        )

        return new Promise((resolve) => {
          signAndExecuteTransaction(
            {
              transaction: transactionBlock,
              chain: 'sui:testnet',
            },
            {
              onSuccess: (result) => {
                console.log('Donation sent successfully:', result)

                // Update local state optimistically
                setPosts((prevPosts) =>
                  prevPosts.map((post) => {
                    if (post.id === postId) {
                      return {
                        ...post,
                        totalDonations: post.totalDonations + amountInMist,
                      }
                    }
                    return post
                  })
                )

                resolve(true)
              },
              onError: (error) => {
                console.error('Error donating:', error)
                setError('Failed to send donation')
                resolve(false)
              },
            }
          )
        })
      } catch (err) {
        console.error('Error donating:', err)
        setError('Failed to send donation')
        return false
      }
    },
    [currentAccount, signAndExecuteTransaction]
  )

  // Add a comment
  const addComment = useCallback(
    async (
      postId: string,
      content: string,
      voteSide: 'agree' | 'disagree'
    ): Promise<boolean> => {
      if (!currentAccount) {
        setError('Wallet not connected')
        return false
      }

      try {
        const transactionBlock = await SuiSaysContract.addCommentTransaction(
          postId,
          content,
          voteSide
        )

        return new Promise((resolve) => {
          signAndExecuteTransaction(
            {
              transaction: transactionBlock,
              chain: 'sui:testnet',
            },
            {
              onSuccess: (result) => {
                console.log('Comment added successfully:', result)

                // Update comment count optimistically
                setPosts((prevPosts) =>
                  prevPosts.map((post) => {
                    if (post.id === postId) {
                      return { ...post, commentCount: post.commentCount + 1 }
                    }
                    return post
                  })
                )

                resolve(true)
              },
              onError: (error) => {
                console.error('Error adding comment:', error)
                setError('Failed to add comment')
                resolve(false)
              },
            }
          )
        })
      } catch (err) {
        console.error('Error adding comment:', err)
        setError('Failed to add comment')
        return false
      }
    },
    [currentAccount, signAndExecuteTransaction]
  )

  // Load posts on mount
  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return {
    posts,
    loading,
    error,
    createPost,
    vote,
    donate,
    addComment,
    loadPosts,
    isConnected: !!currentAccount,
    userAddress: currentAccount?.address,
  }
}

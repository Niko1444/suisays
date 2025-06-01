// lib/suiClient.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'

// Contract constants
export const PACKAGE_ID =
  '0x739560bd473f92a22353c4bbb1a5e2b0112c80e30cc8bdc25f26f363688c0278'
export const REGISTRY_ID =
  '0x764bca54e9ba4716d9e37240c1c9752049f495b467a8aed735dc804660cf7110'

// Initialize Sui client
export const suiClient = new SuiClient({
  url: 'https://fullnode.testnet.sui.io:443',
})

// Types
export interface SuiPost {
  id: string
  content: string
  author: string
  created_at: number
  agree_count: number
  disagree_count: number
  total_donations: number
}

export interface SuiComment {
  id: string
  content: string
  author: string
  created_at: number
  vote_side: number
  back_count: number
}

// Helper function to format SUI amount
export const formatSUI = (mist: number): string => {
  return (mist / 1_000_000_000).toFixed(3)
}

// Helper function to format timestamp
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}

// Helper function to get relative time
export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(timestamp).toLocaleDateString()
}

// Smart contract interaction functions
export class SuiSaysContract {
  // Create a new post - returns transaction
  static createPostTransaction(content: string): Transaction {
    const tx = new Transaction()

    tx.moveCall({
      target: `${PACKAGE_ID}::suisays::create_post`,
      arguments: [tx.object(REGISTRY_ID), tx.pure.string(content)],
    })

    return tx
  }

  // Vote on a post - returns transaction
  static voteTransaction(
    postId: string,
    voteType: 'agree' | 'disagree'
  ): Transaction {
    const tx = new Transaction()
    const voteValue = voteType === 'agree' ? 1 : 2

    tx.moveCall({
      target: `${PACKAGE_ID}::suisays::vote`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(postId),
        tx.pure.u8(voteValue),
      ],
    })

    return tx
  }

  // Add a comment to a post - returns transaction
  static addCommentTransaction(
    postId: string,
    content: string,
    voteSide: 'agree' | 'disagree'
  ): Transaction {
    const tx = new Transaction()
    const voteValue = voteSide === 'agree' ? 1 : 2

    tx.moveCall({
      target: `${PACKAGE_ID}::suisays::add_comment`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(postId),
        tx.pure.string(content),
        tx.pure.u8(voteValue),
      ],
    })

    return tx
  }

  // Donate to a post - returns transaction
  static donateTransaction(
    postId: string,
    amount: number // Amount in MIST (1 SUI = 1_000_000_000 MIST)
  ): Transaction {
    const tx = new Transaction()

    // Split coin for donation
    const [coin] = tx.splitCoins(tx.gas, [amount])

    tx.moveCall({
      target: `${PACKAGE_ID}::suisays::donate`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(postId),
        tx.makeMoveVec({
          elements: [coin],
        }),
      ],
    })

    return tx
  }

  // Get all post IDs
  static async getAllPostIds(): Promise<string[]> {
    try {
      const tx = new Transaction()
      tx.moveCall({
        target: `${PACKAGE_ID}::suisays::get_post_ids`,
        arguments: [tx.object(REGISTRY_ID)],
      })

      const result = await suiClient.devInspectTransactionBlock({
        sender:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionBlock: tx,
      })

      if (result.results?.[0]?.returnValues?.[0]) {
        const returnValue = result.results[0].returnValues[0]
        // The return value should be a vector of strings
        // Parse the BCS encoded data
        const [data] = returnValue
        if (Array.isArray(data)) {
          return data.map((item: any) => {
            if (typeof item === 'string') return item
            if (Array.isArray(item)) {
              // Handle byte array to string conversion
              return new TextDecoder().decode(new Uint8Array(item))
            }
            return String(item)
          })
        }
      }
      return []
    } catch (error) {
      console.error('Error fetching post IDs:', error)
      return []
    }
  }

  // Get a single post using the smart contract function
  static async getPost(postId: string): Promise<SuiPost | null> {
    const parseU64 = (data: any): number => {
      if (!data || !data[0]) return 0

      if (typeof data[0] === 'number') return data[0]
      if (typeof data[0] === 'string') return parseInt(data[0], 10)

      // Handle BCS byte array for u64
      if (Array.isArray(data[0])) {
        const bytes = new Uint8Array(data[0])
        let result = 0
        for (let i = 0; i < Math.min(8, bytes.length); i++) {
          result += bytes[i] * Math.pow(256, i)
        }
        return result
      }

      return 0
    }

    try {
      const tx = new Transaction()
      tx.moveCall({
        target: `${PACKAGE_ID}::suisays::get_post`,
        arguments: [tx.object(REGISTRY_ID), tx.pure.string(postId)],
      })

      const result = await suiClient.devInspectTransactionBlock({
        sender:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionBlock: tx,
      })

      // In your getPost method, add this right after you get the returnValues:

      if (result.results?.[0]?.returnValues) {
        const returnValues = result.results[0].returnValues

        // ADD THESE DEBUG LOGS HERE:
        console.log('🔍 Raw return values for post', postId, ':', returnValues)
        console.log('📊 Return values length:', returnValues.length)

        if (returnValues.length >= 6) {
          const [
            contentData,
            authorData,
            agreeCountData,
            disagreeCountData,
            donationsData,
            createdAtData,
          ] = returnValues

          // ADD MORE DEBUG LOGS HERE:
          console.log('📊 Raw agree count data:', agreeCountData)
          console.log('📊 Raw disagree count data:', disagreeCountData)
          console.log('📊 Parsed agree_count:', parseU64(agreeCountData))
          console.log('📊 Parsed disagree_count:', parseU64(disagreeCountData))

          // Parse content (String)
          let content = ''
          if (contentData && contentData[0]) {
            if (typeof contentData[0] === 'string') {
              content = contentData[0]
            } else if (Array.isArray(contentData[0])) {
              content = new TextDecoder().decode(new Uint8Array(contentData[0]))
            }
          }

          // Parse author (address)
          let author = '0x0'
          if (authorData && authorData[0]) {
            if (typeof authorData[0] === 'string') {
              author = authorData[0]
            } else if (Array.isArray(authorData[0])) {
              // Convert byte array to hex string
              const bytes = new Uint8Array(authorData[0])
              author =
                '0x' +
                Array.from(bytes)
                  .map((b) => b.toString(16).padStart(2, '0'))
                  .join('')
            }
          }

          // Check if post exists (empty content means post doesn't exist)
          if (!content || content === '') {
            return null
          }

          // Parse timestamp
          const createdAt = createdAtData?.[0]
            ? Number(createdAtData[0])
            : Date.now()

          return {
            id: postId,
            content,
            author,
            created_at: createdAt,
            agree_count: parseU64(agreeCountData),
            disagree_count: parseU64(disagreeCountData),
            total_donations: parseU64(donationsData),
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching post:', error)
      return null
    }
  }

  // Get multiple posts efficiently
  static async getPosts(postIds: string[]): Promise<SuiPost[]> {
    const posts: SuiPost[] = []

    // Process posts in batches to avoid overwhelming the network
    const batchSize = 5
    for (let i = 0; i < postIds.length; i += batchSize) {
      const batch = postIds.slice(i, i + batchSize)
      const batchPromises = batch.map((id) => this.getPost(id))
      const batchResults = await Promise.all(batchPromises)

      batchResults.forEach((post) => {
        if (post) posts.push(post)
      })
    }

    return posts
  }

  // Get recent posts by calling the public view function
  static async getRecentPosts(limit: number = 10): Promise<string[]> {
    try {
      const tx = new Transaction()

      tx.moveCall({
        target: `${PACKAGE_ID}::suisays::get_recent_posts`,
        arguments: [tx.object(REGISTRY_ID), tx.pure.u64(limit)],
      })

      const result = await suiClient.devInspectTransactionBlock({
        sender:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionBlock: tx,
      })

      if (result.results?.[0]?.returnValues?.[0]) {
        const [data] = result.results[0].returnValues[0]
        if (Array.isArray(data)) {
          return data.map((item: any) => {
            if (typeof item === 'string') return item
            if (Array.isArray(item)) {
              return new TextDecoder().decode(new Uint8Array(item))
            }
            return String(item)
          })
        }
      }

      return []
    } catch (error) {
      console.error('Error fetching recent posts:', error)
      return []
    }
  }

  // Get most voted posts
  static async getMostVotedPosts(limit: number = 10): Promise<string[]> {
    try {
      const tx = new Transaction()

      tx.moveCall({
        target: `${PACKAGE_ID}::suisays::get_most_voted_posts`,
        arguments: [tx.object(REGISTRY_ID), tx.pure.u64(limit)],
      })

      const result = await suiClient.devInspectTransactionBlock({
        sender:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionBlock: tx,
      })

      if (result.results?.[0]?.returnValues?.[0]) {
        const [data] = result.results[0].returnValues[0]
        if (Array.isArray(data)) {
          return data.map((item: any) => {
            if (typeof item === 'string') return item
            if (Array.isArray(item)) {
              return new TextDecoder().decode(new Uint8Array(item))
            }
            return String(item)
          })
        }
      }

      return []
    } catch (error) {
      console.error('Error fetching most voted posts:', error)
      return []
    }
  }

  // Get post count
  static async getPostCount(): Promise<number> {
    try {
      const tx = new Transaction()

      tx.moveCall({
        target: `${PACKAGE_ID}::suisays::get_post_count`,
        arguments: [tx.object(REGISTRY_ID)],
      })

      const result = await suiClient.devInspectTransactionBlock({
        sender:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionBlock: tx,
      })

      if (result.results?.[0]?.returnValues?.[0]) {
        return Number(result.results[0].returnValues[0][0])
      }

      return 0
    } catch (error) {
      console.error('Error fetching post count:', error)
      return 0
    }
  }

  // Get comments for a post
  static async getRecentComments(
    postId: string,
    limit: number = 10
  ): Promise<string[]> {
    try {
      const tx = new Transaction()

      tx.moveCall({
        target: `${PACKAGE_ID}::suisays::get_recent_comments`,
        arguments: [
          tx.object(REGISTRY_ID),
          tx.pure.string(postId),
          tx.pure.u64(limit),
        ],
      })

      const result = await suiClient.devInspectTransactionBlock({
        sender:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionBlock: tx,
      })

      if (result.results?.[0]?.returnValues?.[0]) {
        const [data] = result.results[0].returnValues[0]
        if (Array.isArray(data)) {
          return data.map((item: any) => {
            if (typeof item === 'string') return item
            if (Array.isArray(item)) {
              return new TextDecoder().decode(new Uint8Array(item))
            }
            return String(item)
          })
        }
      }

      return []
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  }

  // Get a single comment
  static async getComment(
    postId: string,
    commentId: string
  ): Promise<SuiComment | null> {
    try {
      const tx = new Transaction()

      tx.moveCall({
        target: `${PACKAGE_ID}::suisays::get_comment`,
        arguments: [
          tx.object(REGISTRY_ID),
          tx.pure.string(postId),
          tx.pure.string(commentId),
        ],
      })

      const result = await suiClient.devInspectTransactionBlock({
        sender:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionBlock: tx,
      })

      if (result.results?.[0]?.returnValues) {
        const returnValues = result.results[0].returnValues

        if (returnValues.length >= 5) {
          const [
            contentData,
            authorData,
            createdAtData,
            voteSideData,
            backCountData,
          ] = returnValues

          // Parse content
          let content = ''
          if (contentData?.[0]) {
            if (typeof contentData[0] === 'string') {
              content = contentData[0]
            } else if (Array.isArray(contentData[0])) {
              content = new TextDecoder().decode(new Uint8Array(contentData[0]))
            }
          }

          // Parse author
          let author = '0x0'
          if (authorData?.[0]) {
            if (typeof authorData[0] === 'string') {
              author = authorData[0]
            } else if (Array.isArray(authorData[0])) {
              const bytes = new Uint8Array(authorData[0])
              author =
                '0x' +
                Array.from(bytes)
                  .map((b) => b.toString(16).padStart(2, '0'))
                  .join('')
            }
          }

          if (!content || content === '') {
            return null
          }

          // Parse timestamp
          const createdAt = createdAtData?.[0]
            ? Number(createdAtData[0])
            : Date.now()

          return {
            id: commentId,
            content,
            author,
            created_at: createdAt,
            vote_side: voteSideData?.[0] ? Number(voteSideData[0]) : 0,
            back_count: backCountData?.[0] ? Number(backCountData[0]) : 0,
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching comment:', error)
      return null
    }
  }
}

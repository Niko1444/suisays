// lib/suiClient.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'

// Contract constants
export const PACKAGE_ID =
  '0x3584d58810a7ff6d699f879a064fdd8711effe012907a990aa2a5491596df4e7'
export const REGISTRY_ID =
  '0x4106347a849e122f04a06325f402aaed073be4c7661560da15ebd9384f7998a6'

// Initialize Sui client
export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'), // Change to 'mainnet' for production
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

  // Get a single post by calling the public view function
  static async getPost(postId: string): Promise<SuiPost | null> {
    try {
      // Try using devInspectTransactionBlock directly
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

      if (result.results?.[0]?.returnValues) {
        const [
          content,
          author,
          agreeCount,
          disagreeCount,
          totalDonations,
          createdAt,
        ] = result.results[0].returnValues

        return {
          id: postId,
          content: new TextDecoder().decode(new Uint8Array(content[0])),
          author: `0x${author[0]}`,
          agree_count: agreeCount[0][0],
          disagree_count: disagreeCount[0][0],
          total_donations: totalDonations[0][0],
          created_at: createdAt[0][0],
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching post:', error)
      return null
    }
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

      if (result.results?.[0]?.returnValues) {
        const returnValue = result.results[0].returnValues[0]
        if (Array.isArray(returnValue)) {
          return returnValue.map((item) => String(item))
        }
        return []
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

      if (result.results?.[0]?.returnValues) {
        const returnValue = result.results[0].returnValues[0]
        if (Array.isArray(returnValue)) {
          return returnValue.map((item) => String(item))
        }
        return []
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

      if (result.results?.[0]?.returnValues) {
        return result.results[0].returnValues[0][0][0]
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

      if (result.results?.[0]?.returnValues) {
        const returnValue = result.results[0].returnValues[0]
        if (Array.isArray(returnValue) && Array.isArray(returnValue[0])) {
          return returnValue[0].map((item: any) => String(item))
        }
        return []
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
        const [content, author, createdAt, voteSide, backCount] =
          result.results[0].returnValues

        return {
          id: commentId,
          content: new TextDecoder().decode(new Uint8Array(content[0])),
          author: `0x${author[0]}`,
          created_at: createdAt[0][0],
          vote_side: voteSide[0][0],
          back_count: backCount[0][0],
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching comment:', error)
      return null
    }
  }
}

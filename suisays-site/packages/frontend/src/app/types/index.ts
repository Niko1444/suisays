// types/index.ts
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
  timeToReveal: string
  isRevealed: boolean
  revealDate?: string
}

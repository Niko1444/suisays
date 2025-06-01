import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'

const provider = new SuiClient({ url: getFullnodeUrl('testnet') })
const registryId =
  '0x4106347a849e122f04a06325f402aaed073be4c7661560da15ebd9384f7998a6'

export async function getAllSuiSaysData() {
  try {
    const registryObj = await provider.getObject({
      id: registryId,
      options: { showContent: true },
    })

    const registryFields = (registryObj.data?.content as any).fields
    const postsTableId = registryFields.posts.fields.id.id
    const postCount = Number(registryFields.post_count)

    // Get all posts with details
    const posts = await getAllPosts(postsTableId)

    return {
      message: 'Successfully fetched data.',
      postCount,
      posts,
    }
  } catch (err) {
    console.error('getAllSuiSaysData error:', err)
    throw err
  }
}

async function getAllPosts(postsTableId: string) {
  const postKeys = await provider.getDynamicFields({ parentId: postsTableId })

  return Promise.all(
    postKeys.data.map(async (postKey) => {
      const postObject = await provider.getDynamicFieldObject({
        parentId: postsTableId,
        name: {
          type: '0x1::string::String',
          value: postKey.name,
        },
      })

      const postFields = (postObject.data?.content as any).fields
      const postId = postKey.name
      const commentsTableId = postFields.comments.fields.id.id

      // Get comments
      const comments = await getPostComments(commentsTableId)

      return {
        id: postId,
        content: postFields.content,
        author: postFields.author,
        created_at: postFields.created_at,
        agree_count: postFields.agree_count,
        disagree_count: postFields.disagree_count,
        total_donations: postFields.total_donations,
        comment_count: postFields.comment_count,
        comments,
      }
    })
  )
}

async function getPostComments(commentsTableId: string) {
  const commentKeys = await provider.getDynamicFields({
    parentId: commentsTableId,
  })

  return Promise.all(
    commentKeys.data.map(async (commentKey) => {
      const commentObject = await provider.getDynamicFieldObject({
        parentId: commentsTableId,
        name: {
          type: '0x1::string::String',
          value: commentKey.name,
        },
      })

      const commentFields = (commentObject.data?.content as any).fields

      return {
        id: commentKey.name,
        content: commentFields.content,
        author: commentFields.author,
        created_at: commentFields.created_at,
        vote_side: commentFields.vote_side,
        back_count: commentFields.back_count,
      }
    })
  )
}

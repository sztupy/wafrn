import { getAtProtoSession } from '../../atproto/utils/getAtProtoSession.js'
import { promiseRace } from '../../atproto/utils/promiseRace.js'
import { Post } from '../../models/index.js'
import { getAllLocalUserIds } from '../cacheGetters/getAllLocalUserIds.js'
import { getAdminUser } from '../getAdminAndDeletedUser.js'
import { logger } from '../logger.js'

async function checkBskyLabelersNSFW(posts: Post[]): Promise<void> {
  try {
    const localUsers = await getAllLocalUserIds()
    const dids: string[] = posts
      .filter((elem) => elem.bskyUri && !localUsers.includes(elem.userId))
      .map((elem) => elem.bskyUri as string)
    const agent = await getAtProtoSession(await getAdminUser())
    const getLabelsPetition = agent.com.atproto.label.queryLabels({
      uriPatterns: dids,
      // hardcoded: bsky moderation service
      sources: ['did:plc:ar7c4by46qjdydhdevvrndac']
    })
    let petitionResult = (await promiseRace([getLabelsPetition], 2500))[0]
    if (petitionResult?.data?.labels && petitionResult.data.labels.length > 0) {
      for await (const element of petitionResult.data.labels) {
        let postToLabel = posts.find((elem) => elem.bskyUri === element.uri)
        if (postToLabel) {
          postToLabel.content_warning = `Post labeled as ${element.val}`
          await postToLabel.save()
        }
      }
    }
  } catch (error) {
    logger.info(error)
  }
}

export { checkBskyLabelersNSFW }

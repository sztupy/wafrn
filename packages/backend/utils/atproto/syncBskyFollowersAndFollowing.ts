import { Op } from 'sequelize'
import { getAtProtoSession } from '../../atproto/utils/getAtProtoSession.js'
import { forcePopulateUsers } from '../../atproto/utils/getAtprotoUser.js'
import { Follows, User } from '../../models/index.js'
import { getAdminUser } from '../getAdminAndDeletedUser.js'

async function syncBskyFollowersAndFollowing(userId: string) {
  const user = await User.findByPk(userId)
  if (user && user.bskyDid) {
    const agent = await getAtProtoSession(await getAdminUser())

    const followersResponse = await agent.getFollowers({ actor: user.bskyDid })

    const followersDids = followersResponse.data.followers.map((elem) => elem.did)

    await forcePopulateUsers(followersDids, await getAdminUser())

    const followers = await User.findAll({
      where: {
        bskyDid: {
          [Op.in]: followersDids
        }
      }
    })

    for await (const follower of followers) {
      await Follows.findOrCreate({
        where: {
          followedId: userId,
          followerId: follower.id
        },
        defaults: {
          followerId: follower.id,
          followedId: userId,
          muteQuotes: false,
          muteRewoots: false,
          accepted: true
        }
      })
    }

    const followingResponse = await agent.getFollows({ actor: user.bskyDid })
    const followingdids = followingResponse.data.follows.map((elem) => elem.did)
    await forcePopulateUsers(followingdids, await getAdminUser())
    const newFollowsToCreate = await User.findAll({
      where: {
        bskyDid: {
          [Op.in]: followingdids
        }
      }
    })

    for await (const newFollow of newFollowsToCreate) {
      await Follows.findOrCreate({
        where: {
          followedId: newFollow.id,
          followerId: userId
        },
        defaults: {
          followedId: newFollow.id,
          followerId: userId,
          muteQuotes: false,
          muteRewoots: false,
          accepted: true
        }
      })
    }
  }
}

export { syncBskyFollowersAndFollowing }

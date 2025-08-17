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

    const userFollowersExisting = (
      await Follows.findAll({
        include: [
          {
            model: User,
            as: 'follower',
            where: {
              bskyDid: {
                [Op.in]: followersDids
              }
            },
            required: true
          }
        ],
        where: {
          followedId: userId
        }
      })
    ).map((elem) => elem.followerId)

    const newFollowers = (
      await User.findAll({
        where: {
          bskyDid: {
            [Op.in]: followersDids
          },
          id: {
            [Op.notIn]: userFollowersExisting
          }
        }
      })
    ).map((elem) => elem.id)

    const newFollowersCreated = await Follows.bulkCreate(
      newFollowers.map((elem) => {
        return {
          followerId: elem,
          followedId: userId,
          muteQuotes: false,
          muteRewoots: false,
          accepted: true
        }
      })
    )

    const followingResponse = await agent.getFollows({ actor: user.bskyDid })
    const followingdids = followingResponse.data.follows.map((elem) => elem.did)
    await forcePopulateUsers(followingdids, await getAdminUser())
    const followingExisting = (
      await Follows.findAll({
        include: [
          {
            model: User,
            as: 'followed',
            where: {
              bskyDid: {
                [Op.in]: followersDids
              }
            },
            required: true
          }
        ],
        where: {
          followerId: userId
        }
      })
    ).map((elem) => elem.followerId)

    const newFollowing = (
      await User.findAll({
        where: {
          bskyDid: {
            [Op.in]: followingdids
          },
          id: {
            [Op.notIn]: followingExisting
          }
        }
      })
    ).map((elem) => elem.id)

    const newFollowingCreated = await Follows.bulkCreate(
      newFollowers.map((elem) => {
        return {
          followedId: elem,
          followerId: userId,
          muteQuotes: false,
          muteRewoots: false,
          accepted: true
        }
      })
    )
  }
}

export { syncBskyFollowersAndFollowing }

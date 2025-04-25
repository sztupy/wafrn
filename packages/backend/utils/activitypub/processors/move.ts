import { Op } from 'sequelize'
import { Follows, sequelize, User } from '../../../models/index.js'
import { activityPubObject } from '../../../interfaces/fediverse/activityPubObject.js'
import { getAllLocalUserIds } from '../../cacheGetters/getAllLocalUserIds.js'
import { follow } from '../../follow.js'
import { logger } from '../../logger.js'
import { getRemoteActor } from '../getRemoteActor.js'

async function MoveActivity(body: activityPubObject, remoteUser: User, user: User) {
  // WIP move
  // TODO get list of users who where following old account
  // then make them follow the new one, sending petition
  const apObject: activityPubObject = body
  if (!apObject.target) return

  const newUser = await getRemoteActor(apObject.target, user)
  const oldUser = await User.findByPk(remoteUser.id) // a bit paranoid, innit?
  if (newUser && oldUser) {
    logger.debug({ message: `Moving ${oldUser.url} to ${newUser.url}` })
    const followsToMove = await Follows.findAll({
      where: {
        [Op.and]: [
          {
            followedId: oldUser.id,
            accepted: true,
            followerId: { [Op.in]: await getAllLocalUserIds() }
          },
          sequelize.literal(
            `"followerId" NOT IN (select "followerId" from "follows" where "followedId"='${newUser.id}')`
          )
        ]
      }
    })
    if (followsToMove) {
      for await (const followToMove of followsToMove) {
        await follow(followToMove.followerId, newUser.id)
      }
    }
  }
}

export { MoveActivity }

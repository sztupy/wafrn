import { Follows, User } from '../../../models/index.js'
import { activityPubObject } from '../../../interfaces/fediverse/activityPubObject.js'
import { redisCache } from '../../redis.js'
import { getRemoteActor } from '../getRemoteActor.js'
import { signAndAccept } from '../signAndAccept.js'

async function RejectActivity(body: activityPubObject, remoteUser: User, user: User) {
  const apObject: activityPubObject = body
  // someone rejected your follow request :(
  const userWichFollowWasRejected = await getRemoteActor(apObject.object.actor, user)
  await Follows.destroy({
    where: {
      followedId: remoteUser.id,
      followerId: userWichFollowWasRejected.id
    }
  })
  redisCache.del('follows:full:' + userWichFollowWasRejected.id)
  redisCache.del('follows:notYetAcceptedFollows:' + userWichFollowWasRejected.id)
  // await signAndAccept({ body: body }, remoteUser, user)
}

export { RejectActivity }

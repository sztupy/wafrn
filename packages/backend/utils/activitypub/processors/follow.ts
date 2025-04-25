import { Follows, Notification, User } from '../../../models/index.js'
import { activityPubObject } from '../../../interfaces/fediverse/activityPubObject.js'
import { createNotification } from '../../pushNotifications.js'
import { acceptRemoteFollow } from '../acceptRemoteFollow.js'
import { getRemoteActor } from '../getRemoteActor.js'
import { signAndAccept } from '../signAndAccept.js'

async function FollowActivity(body: activityPubObject, remoteUser: User, user: User) {
  const apObject: activityPubObject = body
  // Follow user
  const userToBeFollowed = await getRemoteActor(apObject.object, user)
  let remoteFollow = await Follows.findOne({
    where: {
      followerId: remoteUser.id,
      followedId: userToBeFollowed.id
    }
  })
  if (!remoteFollow) {
    remoteFollow = await Follows.create({
      followerId: remoteUser.id,
      followedId: userToBeFollowed.id,
      remoteFollowId: apObject.id,
      accepted: userToBeFollowed.url.startsWith('@') ? true : !userToBeFollowed.manuallyAcceptsFollows
    })
  }
  await remoteFollow.save()
  // we accept it if user accepts follows automaticaly
  if (remoteFollow.accepted) {
    createNotification(
      {
        notificationType: 'FOLLOW',
        userId: remoteUser.id,
        notifiedUserId: userToBeFollowed.id
      },
      {
        userUrl: remoteUser.url
      }
    )
    await acceptRemoteFollow(userToBeFollowed.id, remoteUser.id)
  }
}

export { FollowActivity }

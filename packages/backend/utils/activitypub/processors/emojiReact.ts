import { Emoji, EmojiReaction, Notification, User } from '../../../models/index.js'
import { activityPubObject } from '../../../interfaces/fediverse/activityPubObject.js'
import { createNotification } from '../../pushNotifications.js'
import { getPostThreadRecursive } from '../getPostThreadRecursive.js'
import { signAndAccept } from '../signAndAccept.js'

async function EmojiReactActivity(body: activityPubObject, remoteUser: User, user: User) {
  const apObject: activityPubObject = body
  const postToReact = await getPostThreadRecursive(user, apObject.object)
  let emojiToAdd: any
  if (apObject.tag && apObject.tag.length === 1 && apObject.tag[0]?.icon) {
    const emojiRemote = apObject.tag[0]
    const existingEmoji = await Emoji.findByPk(emojiRemote.id)
    emojiToAdd = existingEmoji
      ? existingEmoji
      : (
          await Emoji.findOrCreate({
            where: {
              id: emojiRemote.id,
              name: emojiRemote.name,
              url: emojiRemote.icon?.url,
              external: true
            }
          })
        )[0]
  }
  if (postToReact && apObject.content) {
    const [reaction, created] = await EmojiReaction.findOrCreate({
      where: {
        remoteId: apObject.id
      },
      defaults: {
        remoteId: apObject.id,
        userId: remoteUser.id,
        content: apObject.content,
        postId: postToReact.id,
        emojiId: emojiToAdd?.id
      }
    })
    if (created) {
      await createNotification(
        {
          notificationType: 'EMOJIREACT',
          userId: remoteUser.id,
          postId: postToReact.id,
          notifiedUserId: postToReact.userId,
          emojiReactionId: reaction.id,
          createdAt: new Date(reaction.createdAt)
        },
        {
          postContent: postToReact.content,
          userUrl: remoteUser.url,
          emoji: reaction.content
        }
      )
    }
  }
}

export { EmojiReactActivity }

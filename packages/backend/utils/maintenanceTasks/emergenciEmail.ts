import { Op } from 'sequelize'
import { Notification, User } from '../../models/index.js'
import { wait } from '../wait.js'
import sendActivationEmail from '../sendActivationEmail.js'
import getBlockedIds from '../cacheGetters/getBlockedIds.js'
import { getMutedPosts } from '../cacheGetters/getMutedPosts.js'
import { getNotificationOptions } from '../../routes/notifications.js'
import { completeEnvironment } from '../backendOptions.js'

async function sendMail() {
  const users = await User.scope('full').findAll({
    where: {
      banned: { [Op.ne]: true },
      activated: true,
      email: {
        [Op.ne]: null
      }
    },
    order: [['createdAt', 'ASC']]
  })

  for await (const user of users) {
    if (!user.email) {
      continue
    }

    const sorryForMailing = user.disableEmailNotifications
      ? '<p>We are also sorry for emailing you even you have disabled mail notifications. This is a security incident (even tho most probably nothing has actualy happened) and as such we consider it important enough to inform you about it</p>'
      : ''

    const subject = `Sorry for this email, but there has been a POSSIBLE security issue on our side. We dont think it has happened tho.`
    const body = `
    <h1>There has been a possible security incident</h1>
    <p>We do not think anything has happened. But for transparency, we are emailing all wafrn users</p>
    <p>We would write a long email, but I rather send you a thread with the discussion and possible questions you may have regarding on the incident: <a href="https://app.wafrn.net/fediverse/post/59afc694-8136-4059-a68f-a1e602d41085">https://app.wafrn.net/fediverse/post/59afc694-8136-4059-a68f-a1e602d41085</a>
    <p>The short version is this</p>
    <p>We've discovered that an API endpoint had insufficient access control which may have lead to sensitive user information leaking, as a result we've published updates for wafrn. We don't have sufficient evidence to determine if this was accessed in the wild, but we believe access was unlikely.</p>
    <p>Feel free to reply to the thread or this email with any question you have</p>
    ${sorryForMailing}

<p>If you no longer desire to get these emails, please <a href="${completeEnvironment.frontendUrl}/api/disableEmailNotifications/${user.id}/${user.activationCode}">click here</a>.</p>
    `
    console.log(`mailing ${user.url}`)
    try {
      await sendActivationEmail(user.email, '', subject, body)
    } catch (error) {
      console.error(error)
    }
    await wait(1500)
  }
}

sendMail()

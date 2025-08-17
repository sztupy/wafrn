import { Op } from 'sequelize'
import { User } from '../../models/index.js'
import { syncBskyFollowersAndFollowing } from '../atproto/syncBskyFollowersAndFollowing.js'
import { wait } from '../wait.js'

console.log(`---Initiating full sync of follows with bluesky---`)
const users = await User.findAll({
  where: {
    email: {
      [Op.ne]: null
    },
    enableBsky: true
  }
})

for await (const user of users) {
  console.log(`Syncing ${user.url}`)
  await syncBskyFollowersAndFollowing(user.id)
  // await wait(500)
}

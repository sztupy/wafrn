import { User } from '../../models/index.js'
import { getLocalUsernameFromRemoteId } from '../../models/user.js'
import { redisCache } from '../redis.js'

async function getUserIdFromRemoteId(remoteId: string): Promise<string> {
  let res = ''
  const cacheResult = await redisCache.get('userRemoteId:' + remoteId.toLocaleLowerCase())
  if (cacheResult) {
    res = cacheResult
  } else {
    const user = await User.findOne({
      attributes: ['id'],
      where: {
        url: getLocalUsernameFromRemoteId(remoteId)
      }
    })
    if (user) {
      res = user.id
      await redisCache.set('userRemoteId:' + remoteId.toLocaleLowerCase(), res, 'EX', 1000)
    }
  }
  return res
}

export { getUserIdFromRemoteId }

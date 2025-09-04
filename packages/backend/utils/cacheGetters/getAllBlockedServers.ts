import { FederatedHost } from '../../models/index.js'
import { redisCache } from '../redis.js'

async function getallBlockedServers(): Promise<string[]> {
  let res: string[] = []
  const cacheResult = await redisCache.get('allBlockedServers')
  if (cacheResult) {
    res = JSON.parse(cacheResult)
  } else {
    const blockedServers = await FederatedHost.findAll({
      attributes: ['id'],
      where: {
        blocked: true
      }
    })
    if (blockedServers && blockedServers.length > 0) {
      res = blockedServers.map((elem: any) => elem.id)
    } else {
      res = ['00000000-0000-0000-0000-000000000000']
    }
    await redisCache.set('allBlockedServers', JSON.stringify(res), 'EX', 300)
  }
  return res
}

export { getallBlockedServers }

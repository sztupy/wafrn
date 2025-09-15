import { AtpAgent } from '@atproto/api'
import { getAtProtoSession } from '../../atproto/utils/getAtProtoSession.js'
import { getAdminUser } from '../getAdminAndDeletedUser.js'

let adminSession: AtpAgent | undefined

async function getAdminAtprotoSession(): Promise<AtpAgent> {
  if (!adminSession) {
    adminSession = await getAtProtoSession(await getAdminUser(), true)
  }
  return adminSession
}

export { getAdminAtprotoSession }

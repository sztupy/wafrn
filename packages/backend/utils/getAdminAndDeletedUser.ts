import { User } from '../models/user.js'
import { completeEnvironment } from './backendOptions.js'

async function getAdminUser(): Promise<User> {
  return (await User.findOne({
    where: {
      url: completeEnvironment.adminUser
    }
  })) as User
}

async function getDeletedUser(): Promise<User> {
  return (await User.findOne({
    where: {
      url: completeEnvironment.deletedUser
    }
  })) as User
}

export { getAdminUser, getDeletedUser }

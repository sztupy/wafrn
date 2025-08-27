import { Application, Response } from 'express'
import AuthorizedRequest from '../interfaces/authorizedRequest.js'
import { authenticateToken } from '../utils/authenticateToken.js'
import uploadHandler from '../utils/uploads.js'
import fs from 'fs/promises'
import { Follows, User, sequelize } from '../models/index.js'
import { Op } from 'sequelize'
import { searchRemoteUser } from '../utils/activitypub/searchRemoteUser.js'
import { follow } from '../utils/follow.js'
import { completeEnvironment } from '../utils/backendOptions.js'
import { wait } from '../utils/wait.js'
export default function listRoutes(app: Application) {
  // Recomended users to follow
  app.post(
    '/api/loadFollowList',
    authenticateToken,
    uploadHandler(/\.(csv)$/).single('follows'),
    async (req: AuthorizedRequest, res: Response) => {
      if (req.file) {
        try {
          const petitionBy = await User.findByPk(req.jwtData?.userId)
          const lines: string[] = (await fs.readFile(req.file.path, 'utf8'))
            .split('\n')
            .map((elem) => elem.split(',')[0])
            .slice(1)
            .filter((elem) => elem)
          const okUsers: string[] = []
          const localUsersUrls = lines
            .filter((elem) => elem.endsWith('@' + completeEnvironment.instanceUrl))
            .map((elem) => elem.split('@')[0].toLowerCase())
          const remoteUsersUrls = lines
            .filter((elem) => !elem.endsWith('@' + completeEnvironment.instanceUrl))
            .map((url) => '@' + url)
          const allUsers = localUsersUrls.concat(remoteUsersUrls)
          let foundUsers = await User.findAll({
            where: {
              url: {
                [Op.in]: allUsers
              }
            }
          })
          let foundUsersUrls = foundUsers.map((elem: any) => elem.url)
          let notFoundUsersUrls = allUsers.filter((elem) => !foundUsersUrls.includes(elem))
          const notFoundUsersToFetch = notFoundUsersUrls.filter((elem) => !localUsersUrls.includes(elem))
          // try to get all users
          const userFetchPromise = await promiseRace(
            notFoundUsersToFetch.map((usr) => searchRemoteUser(usr, petitionBy)),
            5000
          )
          foundUsers = await User.findAll({
            where: {
              url: {
                [Op.in]: allUsers
              }
            }
          })
          foundUsersUrls = foundUsers.map((elem: any) => elem.url)
          notFoundUsersUrls = allUsers.filter((elem) => !foundUsersUrls.includes(elem))
          res.send({
            foundUsers: foundUsers.map((elem: any) => {
              return {
                url: elem.url,
                avatar: elem.avatar,
                name: elem.name,
                id: elem.id
              }
            }),
            notFoundUsers: notFoundUsersUrls
          })
        } catch (error: any) {
          res.send({
            success: false,
            message: error.message
          })
          await fs.unlink(req.file.path)
        }
      } else {
        res.sendStatus(500)
      }
    }
  )

  async function promiseRace(promises: Promise<any>[], timeoutTime: number) {
    return Promise.allSettled(
      promises.map((p) => {
        return Promise.race([p, wait(5000)])
      })
    )
  }
}

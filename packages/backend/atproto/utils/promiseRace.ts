import { wait } from '../../utils/wait.js'

async function promiseRace(promises: Promise<any>[], timeoutTime: number): Promise<(any | undefined)[]> {
  return (
    await Promise.allSettled(
      promises.map((p) => {
        return Promise.race([p, wait(timeoutTime)])
      })
    )
  ).map((elem) => (elem.status === 'fulfilled' ? elem.value : undefined))
}

export { promiseRace }

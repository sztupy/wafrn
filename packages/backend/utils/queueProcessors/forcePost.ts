import { Queue } from 'bullmq'
import { completeEnvironment } from '../backendOptions.js'

const sendPostBskyQueue = new Queue('sendPostBsky', {
  connection: completeEnvironment.bullmqConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: {
      type: 'fixed',
      delay: 25000
    },
    removeOnFail: true
  }
})

await sendPostBskyQueue.add('sendPostBsky', { postId: '7757193e-aba9-4cc7-abb8-91d818e6baef' })

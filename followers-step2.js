const { production } = require('./knexfile')

const knex = require('knex')(production);

// dotenv was already run inside knexfile but we launch it again for consistency
require('dotenv').config()

const fetch = require('node-fetch')

const igutils = require('./utils')


let JOB_ID = process.env.JOB_ID
if (!JOB_ID) {
    throw new Error('Specify JOB_ID')
}
let LIMIT = process.env.LIMIT || 200
console.log('Step2, JOB ID:', JOB_ID)

let rapidGetAccountInfoByUsername = async (account) => {
    let defaultIgHeaders = { 'x-rapidapi-key': process.env.RAPIDAPI_KEY }
    let res = await fetch('https://instagram40.p.rapidapi.com/account-info?username=' + encodeURIComponent(account), { headers: defaultIgHeaders })

    let json = await res.json()

    //await fs.writeFile('account.json', JSON.stringify(data))
    //let data = JSON.parse(await fs.readFile('account.json'))

    return { res, json }
}

;(async () => {

    job = await igutils.getJobByID(JOB_ID)

    igutils.updateJob({ id: JOB_ID, ep2_status: igutils.JOB_STATUSES.RUNNING, ep2_pausedAt: null })


    let cleanUpServer = (job, eventType) => {
      console.log('updating job status before exit.. job id:', job.id, eventType)
  
      //if (process.stderr)
      igutils.updateJob({ id: job.id, ep2_status: igutils.JOB_STATUSES.PAUSED, ep2_pausedAt: (new Date) }).then(() => {
          process.exit(0)
      }).catch((e) => {
          console.error(e)
          process.exit(1)
      })
    
    }  


    process.on('unhandledRejection', (up) => { 
        console.error(up)
        throw up;
    });
    
    [`SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
        process.on(eventType, cleanUpServer.bind(null, job, eventType))
    })


    let followers
    let processed = 0
    do {
        console.log('requesting new chunk...')
    
        followers = await knex('ig_profiles').select('*').where({
            jobId: JOB_ID,
            isPrivate: false,
            ep2_isDone: false
        }).orderBy('createdAt', 'asc').limit(5)

        console.log('followers to process (non-private)', followers.length)

        for (let follower of followers) {
            let accRes = await rapidGetAccountInfoByUsername(follower.username)

            console.log('checking account:', follower.username, 'business:', accRes.json.is_business_account)

            let u = accRes.json

            await knex('ig_profiles').where({id: follower.id}).update({
                ep2_isDone: true,
                ep2_doneAt: (new Date), 
                isBusiness: accRes.json.is_business_account,
                anonData: JSON.stringify(accRes.json),
                followingCount: u.edge_follow ? u.edge_follow.count : 0,
                followerCount: u.edge_followed_by ? u.edge_followed_by.count : 0
            })


            await igutils.updateJob({ id: JOB_ID, ep2_reqNum: ++job.ep2_reqNum, ep2_updatedAt: (new Date) })
            
            processed++
            
        }

    } while (followers.length && processed <= LIMIT)

    await igutils.updateJob({ id: JOB_ID, ep2_status: igutils.JOB_STATUSES.FINISHED, ep2_updatedAt: (new Date) })
    process.exit(0)
})()
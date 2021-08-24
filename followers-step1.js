const { production } = require('./knexfile')

const knex = require('knex')(production);

// dotenv was already run inside knexfile but we launch it again for consistency
require('dotenv').config()

const fetch = require('node-fetch')

const igutils = require('./utils')


let JOB_ID = process.env.JOB_ID
console.log('Step1, JOB ID:', JOB_ID)
let ACCOUNT = process.env.ACCOUNT
if (!ACCOUNT && !JOB_ID) throw new Error('Specify either ACCOUNT or JOB_ID env')
console.log('Step1, ACCOUNT to scrape:', ACCOUNT)
let LIMIT = process.env.LIMIT || 300




;(async () => {

let cleanUpServer = (job, eventType) => {
  console.log('updating job status before exit.. job id:', job.id, eventType)

  //if (process.stderr)
  igutils.updateJob({ id: job.id, status: igutils.JOB_STATUSES.PAUSED, pausedAt: (new Date) }).then(() => {
    process.exit(0)
  }).catch((e) => {
    console.error(e)
    process.exit(1)
  })
  
}


let rapidGetAccountInfoByUsername = async (account) => {
  let defaultIgHeaders = { 'x-rapidapi-key': process.env.RAPIDAPI_KEY }
  let res = await fetch('https://instagram40.p.rapidapi.com/account-info?wrap=1&username=' + encodeURIComponent(account), { headers: defaultIgHeaders })

  let json = await res.json()


  return { res, json }
}

let rapidGetFollowersByUserId = async (account, max_id) => {
  let defaultIgHeaders = { 'x-rapidapi-key': process.env.RAPIDAPI_KEY }

  let max_id_q = max_id ? '&max_id=' + encodeURIComponent(max_id) : ''
  let res = await fetch('https://instagram40.p.rapidapi.com/followers?userid=' + encodeURIComponent(account) + max_id_q, { headers: defaultIgHeaders })

  let json = await res.json()


  return { res, json }
}



  

  let job, accRes, ACCOUNT_ID
  let justCreated = false
  if (!JOB_ID) {
    
    
    accRes = await rapidGetAccountInfoByUsername(ACCOUNT)

    if (!accRes.res || accRes.res.status != 200 || !accRes.json) {
      let redirectLocation = null  
      if (accRes.res && accRes.res.status == 302) {
          redirectLocation = accRes.res.headers.get('location')
      }
      throw new Error('failed getAccountInfo, response status: ', accRes.res ? accRes.res.status : 0, 'loc:', redirectLocation)
    }
    ACCOUNT_ID = accRes.json.graphql.user.id
    console.log('creating job..', { ACCOUNT, LIMIT, ACCOUNT_ID  })
    job = await igutils.createJob({ type: 'followers', status: igutils.JOB_STATUSES.RUNNING, input: JSON.stringify({ ACCOUNT, LIMIT, ACCOUNT_ID  }) })
    JOB_ID = job[0]

    job = await igutils.getJobByID(JOB_ID)
    console.log('new job id: ', JOB_ID)
    justCreated = true
  } else {
    console.log('proceeding job..', { JOB_ID  })
    job = await igutils.getJobByID(JOB_ID)
    if (job.finishedAt) {
      console.log('this job was finished at:', job.finishedAt, process.env.IGNORE_FINISHED ? 'proceeding' : ' exiting... pass IGNORE_FINISHED=1 to ignore')
     
      if (!process.env.IGNORE_FINISHED) {
        process.exit(0)
      }
    }
    ACCOUNT_ID = job.input.ACCOUNT_ID

    igutils.updateJob({ id: job.id, status: igutils.JOB_STATUSES.RUNNING })
  }
  process.on('unhandledRejection', (up) => { 
    console.error(up)
    throw up;
  });

  [`SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, cleanUpServer.bind(null, job, eventType))
  })
  
  console.log(`account id: ${ACCOUNT_ID}`)
  //let res = await fetch(`https://www.instagram.com/${username}/?__a=1`)

  console.log('starting...')
  //res = await res.json()
  let userId = ACCOUNT_ID

  let after = null, has_next = true, followersCollected = 0

  if (!justCreated) {
    after = job.cursor
    has_next = job.cursor
  }

  while (has_next) {
      
      let start = Date.now()
      let res, json, errMsg
      
      try {
        
        let maxAttempts = 3
        do {
          if (maxAttempts < 3) {
            await igutils.sleep(10000)
          }
          maxAttempts--
          //try {
            ({ res, json } = await rapidGetFollowersByUserId(userId, after))
            console.log('res timing:', Date.now() - start, 'ms')
            if (res.status != 200) {
              console.log('res status: ', res.status, 'location:', res.headers.get('location'))
            }
          //} catch (e) {
            //console.error('catched exception on followers req:')
            //console.error(e)
          //}
          
        } while (res.status != 200 && maxAttempts != 0 )

        if (res.status != 200) {
            //text = await res.text()
            console.error('invalid response status during followers request:', res.status, 'text:', json)
            throw new Error('invalid response status during followers request:' + res.status)
        }

      } catch (e) {
        console.error(e)
        //errMsg = e.message
      }
     
      has_next = json.next_max_id
      after = json.next_max_id
      let createdAt = new Date
      await knex('ig_profiles').insert(json.users.map((u) => {
        return {
          jobId: JOB_ID,
          pk: u.pk,
          username: u.username,
          isPrivate: u.is_private,
          fullName: u.full_name,
          isVerified: u.is_verified,
          createdAt
        }
      }))

      await igutils.updateJob({ id: JOB_ID, cursor: has_next ? has_next : '', reqNum: ++job.reqNum })
    
    followersCollected += json.users.length

    console.log(`collected ${followersCollected} followers`)
    if (followersCollected > LIMIT) {
      console.log('exiting due to hitting limit.')
      has_next = false
    } else {
      let additionalDelay = Math.min(followersCollected*30, 20000)
      let delay = 2000 + Math.random()*8000 + additionalDelay
      console.log(`sleeping ${Math.ceil(delay/1000)} seconds, added delay: ${(additionalDelay/1000).toFixed(2)}s`)
      await igutils.sleep(delay)
    }
    
  }

  await igutils.updateJob({ id: JOB_ID, status: igutils.JOB_STATUSES.FINISHED,  finishedAt: (new Date) })
  console.log('Followers collected:', followersCollected)


  

  
  process.exit(0)

})()




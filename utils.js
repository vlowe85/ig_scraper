
const { production } = require('./knexfile')
const knex = require('knex')(production);


const JOB_STATUSES = {
    CREATED: 'created',
    RUNNING: 'running',
    PAUSED: 'paused',
    FINISHED: 'finished',
    FAILED: 'failed'
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const createJob = async ( { type, userId, input, status} ) => {
    let createdAt = new Date();
    return await knex('jobs').insert({
        type,
        userId,
        status,
        reqNum: 0,
        input,
        createdAt,
        updatedAt: createdAt
    })
}

const updateJob = async ( { id, cursor, status,reqNum, lastError, lastErrorAt, finishedAt, pausedAt, 
    ep2_status, ep2_pausedAt, ep2_updatedAt, ep2_reqNum, 
    ep3_status, ep3_pausedAt, ep3_updatedAt, ep3_reqNum } ) => {
    let updatedAt = new Date();
    await knex('jobs').update( { cursor, status, reqNum, lastError, lastErrorAt, updatedAt, finishedAt, pausedAt, 
        ep2_status, ep2_pausedAt, ep2_updatedAt, ep2_reqNum, 
        ep3_status, ep3_pausedAt, ep3_updatedAt, ep3_reqNum
      } ).where({ id })
}

let getJobByID = async ( id ) => {
    return await knex('jobs').select('*').where({id}).first()
}

module.exports = {

    JOB_STATUSES,
    sleep,
    createJob, 
    updateJob,
    getJobByID,

}
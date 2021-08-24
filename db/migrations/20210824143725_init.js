const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
    
    // ugly zero-dependency way to import sql dump with knex
    // warning: this will fail miserably if semicolon is put to some place in dump other than sql statements separator!
    return fs.readFileSync(path.join(__dirname, "dump.sql"), "utf8").split(';').map((q) =>  { 
        if (!q.trim().length) return;
        return knex.raw(q).then(x => x)
    })
};

exports.down = function(knex) {
  
};

const { MongoClient } = require('mongodb')

const mongoClient = require('mongodb').MongoClient
const state =
{
    db:null
}

module.exports.connect = function(done){  
    
    const dbname = "clinic"
    // const url = 'mongodb://joadmin:jocms1986@localhost:27017/clinic' 
    const url = 'mongodb://localhost:27017/clinic' 

    mongoClient.connect(url,(err,data)=>{
        if (err) {
            return done(err)
        }
        state.db = data.db(dbname)    
        done()
    })

}

module.exports.get = function(){
    return state.db
}
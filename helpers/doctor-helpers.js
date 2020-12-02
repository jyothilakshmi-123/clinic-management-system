var db = require('../config/connection')
var collection = require('../config/collections')


module.exports = {
    addDoctor:(doctor)=>{
        console.log(doctor)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.DOCTOR_COLLECTIION).insertOne(doctor).then((data)=>{
                console.log(data)
                resolve(data.ops[0]._id)
            })
        })


    },
    getDoctorsList:()=>{
        return new Promise(async (resolve,reject)=>{
            let doctorsList =await db.get().collection(collection.DOCTOR_COLLECTIION).find().toArray()
            resolve(doctorsList)
        })

    }
}
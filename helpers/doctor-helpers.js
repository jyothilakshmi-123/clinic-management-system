var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID


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

    },
    getActiveDoctorsList:()=>{
        return new Promise(async (resolve,reject)=>{
            var activeDoctors = {Status : "Active" }
            let doctorsList =await db.get().collection(collection.DOCTOR_COLLECTIION).find(activeDoctors).toArray()
            resolve(doctorsList)
        })

    },
    deleteDoctor:(drId)=>{
        console.log(drId)
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collection.DOCTOR_COLLECTIION).updateOne({_id:objectId(drId.dr)},{
                $set:{
                    Status:"Deleted"
                }
            }).then((response)=>{
                resolve()
            })
        })

    }
}
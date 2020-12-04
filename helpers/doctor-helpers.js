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
    getDoctorsList:(drId)=>{
        return new Promise( (resolve,reject)=>{
             db.get().collection(collection.DOCTOR_COLLECTIION).findOne({_id:objectId(drId)}).then((doctorList )=>{
                resolve(doctorList)
            })
            
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

    },
    updateDoctor:(drId,drDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.DOCTOR_COLLECTIION)
            .updateOne({_id:objectId(drId)},{
                $set:{
                    drName: drDetails.drName,
                    drSpecialised:drDetails.drSpecialised,
                    drSpeciality : drDetails.drSpeciality,
                    drPassword:drDetails.drPassword
                }

            }).then((response)=>{
                console.log(response)
                resolve()
            })
        })
    }
}
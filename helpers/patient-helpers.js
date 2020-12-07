var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')

module.exports ={
    addPatient:(patient)=>{
        console.log(patient)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PATIENT_COLLECTION).insertOne(patient).then((data)=>{
                console.log(data)
                resolve(data.ops[0]._id)
            })
        })


    },
    getActivePatientsList:()=>{
        return new Promise(async (resolve,reject)=>{
            var activePatients = {Status : "Active" }
            let patientsList =await db.get().collection(collection.PATIENT_COLLECTION).find(activePatients).toArray()
            resolve(patientsList)
        })

    },
    deletePatient:(ptId)=>{
        console.log(ptId)
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collection.PATIENT_COLLECTION).updateOne({_id:objectId(ptId.pt)},{
                $set:{
                    Status:"Deleted"
                }
            }).then((response)=>{
                resolve()
            })
        })

    },
    getPatientsList:(ptId)=>{
        return new Promise( (resolve,reject)=>{
             db.get().collection(collection.PATIENT_COLLECTION).findOne({_id:objectId(ptId)}).then((patientsList )=>{
                resolve(patientsList)
            })
            
        })

    },
    updatePatient:(ptId,ptDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PATIENT_COLLECTION)
            .updateOne({_id:objectId(ptId)},{
                $set:{
                    ptName: ptDetails.ptName,
                    ptAge:ptDetails.ptAge,
                    ptMobile : ptDetails.ptMobile,
                    ptPassword:ptDetails.ptPassword
                }

            }).then((response)=>{
                console.log(response)
                resolve()  
            })
        })
    },
    doSignup:(ptData)=>{
        return new Promise(async(resolve,reject)=>{
            ptData.ptPassword = await bcrypt.hash(ptData.ptPassword,10)
            db.get().collection(collection.PATIENT_COLLECTION).insertOne(ptData).then((data)=>{
                resolve(data.ops[0])
            })

        })
        
        
    },
    doLogin: (ptData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false
            let response = {}
            console.log(ptData)
            let patient =await db.get().collection(collection.PATIENT_COLLECTION).findOne({ptEmail:ptData.ptEmail})
            if(patient){
                bcrypt.compare(ptData.ptPassword,patient.ptPassword).then((status)=>{
                    if(status){
                        console.log("login success")
                        response.patient = patient
                        response.status = true
                        resolve(response)
                    }
                    else{
                        console.log("login failed")
                        resolve({status:false})
                    }

                })
            }else{
                console.log("login failed")
                resolve({status:false})
            }
        })
    },
}
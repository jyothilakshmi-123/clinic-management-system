var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
var dateFormat = require("dateformat");

module.exports ={
    addUser:(user)=>{
        console.log(user)
        return new Promise(async(resolve,reject)=>{
            user.userPassword = await bcrypt.hash(user.userPassword,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data)=>{
                console.log(data)
                resolve(data.ops[0])
            })
        })


    },
    getActiveUsersList:()=>{
        return new Promise(async (resolve,reject)=>{
            var activeUsers = {Status : "Active" }
            var blockedUsers = {Status: 'Blocked'}
            let usersList =await db.get().collection(collection.USER_COLLECTION).find({$or:[activeUsers,blockedUsers]}).toArray()
            resolve(usersList)
        })

    },
    deleteUser:(userId)=>{
        console.log(userId)
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId.user)},{
                $set:{
                    Status:"Deleted"
                }
            }).then((response)=>{
                resolve()
            })
        })

    },
    blockUser:(userId)=>{
        console.log(userId)

       
        
            return new Promise(async (resolve,reject)=>{

                let userfromDB = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId.user)})
                console.log(userfromDB)

                if(userfromDB.Status === "Active"){
            
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId.user)},{
                    
                    $set:{
                        Status:"Blocked"
                    }
                
                })
            }else{
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId.user)},{
                    
                    $set:{
                        Status:"Active"
                    }
                
                })

            }
        }).then((response)=>{
                    resolve()
                })
            
   
    },
    getUsersList:(userId)=>{
        return new Promise( (resolve,reject)=>{
             db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((usersList )=>{
                 console.log("list1 is..."+usersList)
                resolve(usersList)
            })
            
        })

    },
    updateUser:(userId,userDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    userName: userDetails.userName,
                    userAge:userDetails.userAge,
                    userMobile : userDetails.userMobile,
                    userPassword:userDetails.userPassword
                }

            }).then((response)=>{
                console.log(response)
                resolve()  
            })
        })
    },
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userData)
            // console.log(userData.userImage)
            userData.userPassword = await bcrypt.hash(userData.userPassword,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                console.log(data)
                resolve(data.ops[0])
            })

        })
        
        
    },
    // doLogin: (userData)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let loginStatus = false
    //         let response = {}
    //         console.log(userData)
    //         var activeUser = {Status : "Active" }
    //         let user =await db.get().collection(collection.USER_COLLECTION).findOne({$and:[activeUser,{userEmail:userData.userEmail}]})
    //         if(user){
    //             if(user.userPassword){
    //                 bcrypt.compare(userData.userPassword,user.userPassword).then((status)=>{
    //                     if(status){
    //                         console.log("login success")
    //                         response.user = user
    //                         response.status = true
    //                         resolve(response)
    //                     }
    //                     else{
    //                         console.log("login failed")
    //                         resolve({status:false})
    //                     }

    //                 })
    //             }else{
    //                 console.log("login failed")
    //                 resolve({status:false})
    //             }
    //         }else{
    //             console.log("login failed")
    //             resolve({status:false})
    //         }
    //     })
    // },
    makeAppointment:(book)=>{
       
        return new Promise(async(resolve,reject)=>{
            console.log(book)
            
            
            db.get().collection(collection.APPOINTMENT_COLLECTION).insertOne(book).then((data)=>{
                console.log(data.ops[0])
                resolve(data)

            })

        })

    },
    collectCurrentBookedAppointments:(userId)=>{
        console.log("Name is ...."+userId)
        return new Promise(async (resolve,reject)=>{
         var useridd =    {user_id : userId }
         var canceledAppointments = {Status : "Pending" }

         let appointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({$and:[useridd,canceledAppointments]}).toArray()
         {
                console.log(appointmentList)
                resolve(appointmentList)  
            }
        })
    },
    
    collectCancelledAppointments:(userId)=>{
        console.log("Name is ...."+userId)
        return new Promise(async (resolve,reject)=>{
         var useridd =    {user_id : userId }
         var canceledAppointments = {Status : "Cancelled" }

         let appointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({$and:[useridd,canceledAppointments]}).toArray()
         {
                console.log(appointmentList)
                resolve(appointmentList)  
            }
        })
    },
    collectPendingAppointments:(userId)=>{
        console.log("Name is ...."+userId)
        return new Promise(async (resolve,reject)=>{
         var useridd =    {user_id : userId }
         var pendingAppointments = {Status : "Pending" }

         let pendingAppointmentsList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({$and:[useridd,pendingAppointments]}).toArray()
         {
                console.log(pendingAppointmentsList)
                resolve(pendingAppointmentsList)  
            }
        })
    },
    collectConfirmedAppointments:(userId)=>{
        console.log("Name is ...."+userId)
        return new Promise(async (resolve,reject)=>{
         var useridd =    {user_id : userId }
         var confirmedAppointments = {Status : "Confirmed" }

         let confirmedAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({$and:[useridd,confirmedAppointments]}).toArray()
         {
                console.log(confirmedAppointmentList)
                resolve(confirmedAppointmentList)  
            }
        })
    },
    cancelledAppointments:(appointmentId)=>{
        console.log(appointmentId)
        return new Promise(async (resolve,reject)=>{
            await db.get().collection(collection.APPOINTMENT_COLLECTION).updateOne({_id:objectId(appointmentId.appointment)},{
                $set:{
                    Status:"Cancelled"
                }
            }).then((response)=>{
                resolve()
            })
        })

    },
    collectPrescription:(userId)=>{
        console.log("Userid is ...."+userId)
        return new Promise(async (resolve,reject)=>{
        //  var useridd =    {userId : userId }
         

         let prescription = await db.get().collection(collection.PRESCRIPTION_COLLECTION).find({userId : userId }).toArray()
         {
                console.log(prescription)
                resolve(prescription)  
            }
        })
    },
    // compareDate:(appointmentDetails)=>{
    //     console.log(appointmentDetails)
    //     let date1 = appointmentDetails.dateOfBooking
    //     let date2 = new Date();
    //     today = dateFormat(date2, "isoDate");
    //     console.log(date1)
    //     console.log(today)
    //     if ((date1.getTime() < today.getTime())) {

    //         appointmentDetails.Day = "Expaired"

    //     }else if((date1.getTime() > today.getTime())){
    //         appointmentDetails.Day = "Upcoming"
    //     }else{
    //         appointmentDetails.Day = "Today"

    //     }

    // }
}
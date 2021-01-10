var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID

module.exports = {

    doAdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
            //let newPassword =await bcrypt.hash(admin.Password,10)
            //let adminDetails = await db.get().collection(collection.ADMIN_COLLECTION).updateOne({Password:"pune3"},{$set:{Password:newPassword}})
            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {

                        console.log("Login Success")
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    }
                    else {
                        resolve({ status: false })
                    }
                })
            }
            else {
                resolve({ status: false })
            }

        })
    },
    getAppointmentList: () => {
        return new Promise(async (resolve, reject) => {
            appointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find().toArray()
            resolve(appointmentList)
        })
    },
    collectDoctorAppointmentlist: (drId) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let Confirmed=0
            let Cancelled=0
            let Pending=0
            let Consulted=0
            doctorAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ dr_id: drId.doctor }).toArray()
            doctorAppointmentList.forEach(element => {
               if(element.Status === 'Confirmed'){
                Confirmed++;
               }
               if(element.Status === 'Cancelled'){
                Cancelled++;
               }
               if(element.Status === 'Pending'){
                Pending++;
               }
               if(element.Status === 'Consulted'){
                Consulted++;
               }
            });
            response = {
                "Confirmed" : Confirmed,
                "Cancelled" : Cancelled,
                "Pending" : Pending,
                "Consulted" : Consulted,
            }
            console.log("Sending the response==============>");
            resolve(response)
        })
    
    },
}
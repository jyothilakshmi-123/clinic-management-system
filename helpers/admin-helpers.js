var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID

module.exports = {

    doAdminLogin: (adminData) => {
        console.log(adminData)
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })


            // console.log("db pw-----------" + admin.Password)
            // console.log("web pw-----------" + adminData.Password)
            // let newPassword =await bcrypt.hash(admin.Password,10)
            // console.log("bcrypted..." +newPassword)
            // let adminDetails = await db.get().collection(collection.ADMIN_COLLECTION).updateOne({Password:"abcd"},{$set:{Password:newPassword}})

            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {

                        console.log("Login Success")
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log("login failed")
                        resolve({ status: false })
                    }
                })
            }
            else {
                console.log("login failed")
                resolve({ status: false })
            }

        })
    },
    getAppointmentList: () => {
        return new Promise(async (resolve, reject) => {
            // var confirmedAppointments = {Status : "Confirmed" }
            appointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ Status: "Confirmed" }).toArray()
            console.log("list....")
            console.log(appointmentList)
            resolve(appointmentList)

        })
    },
    collectDoctorAppointmentlist: (drId) => {
        // return new Promise(async(resolve,reject)=>{

        //     doctorAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({dr_id:drId.doctor}).toArray()
        //     console.log("list....")
        //     // console.log(doctorAppointmentList)
        //     resolve(doctorAppointmentList)

        return new Promise(async (resolve, reject) => {
            let response = {};
            let Confirmed=0
            let Cancelled=0
            let Pending=0
            let Consulted=0
            doctorAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ dr_id: drId.doctor }).toArray()
            console.log("list123....")
            // console.log(doctorAppointmentList)
            doctorAppointmentList.forEach(element => {
                console.log("indexof ");
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
            console.log("Confirmed is " + Confirmed);
            console.log("Cancelled is " + Cancelled);
            console.log("Pending is " + Pending);
            console.log("Consulted is " + Consulted);

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
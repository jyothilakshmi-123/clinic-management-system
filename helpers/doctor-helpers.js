var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
var dateFormat = require("dateformat");
const excel = require('exceljs');
const fs = require('fs');
var download = require('download-file');
const { response } = require('express');


module.exports = {
    addDoctor: (doctor) => {
        console.log(doctor)

        return new Promise(async (resolve, reject) => {
            doctor.Doctor_Password = await bcrypt.hash(doctor.Doctor_Password, 10)
            db.get().collection(collection.DOCTOR_COLLECTIION).insertOne(doctor).then((data) => {
                console.log(data)
                resolve(data.ops[0]._id)
            })
        })


    },
    getDoctorsList: (drId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.DOCTOR_COLLECTIION).findOne({ _id: objectId(drId) }).then((doctorList) => {
                resolve(doctorList)
            })

        })

    },
    getActiveDoctorsList: () => {
        return new Promise(async (resolve, reject) => {
            var activeDoctors = { Status: "Active" }
            var blockedDoctors = { Status: 'Blocked' }

            let doctorsList = await db.get().collection(collection.DOCTOR_COLLECTIION).find({ $or: [activeDoctors, blockedDoctors] }).toArray()
            let drCount = doctorsList.length
            console.log(drCount)

            resolve(doctorsList)
        })

    },
    deleteDoctor: (drId) => {
        console.log(drId)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.DOCTOR_COLLECTIION).updateOne({ _id: objectId(drId.dr) }, {
                $set: {
                    Status: "Deleted"
                }
            }).then((response) => {
                resolve()
            })
        })

    },
    blockDoctor: (drId) => {
        console.log(drId)
        return new Promise(async (resolve, reject) => {
            let DrfromDB = await db.get().collection(collection.DOCTOR_COLLECTIION).findOne({ _id: objectId(drId.dr) })
            console.log(DrfromDB)

            if (DrfromDB.Status === "Active") {
                await db.get().collection(collection.DOCTOR_COLLECTIION).updateOne({ _id: objectId(drId.dr) }, {
                    $set: {
                        Status: "Blocked"
                    }
                }).then((response) => {
                    resolve()
                })
            } else {
                await db.get().collection(collection.DOCTOR_COLLECTIION).updateOne({ _id: objectId(drId.dr) }, {
                    $set: {
                        Status: "Active"
                    }
                }).then((response) => {
                    resolve()
                })
            }
        })
    },
    exportToExcel: (drId) => {
        console.log("docr id is.......")
        console.log(drId)
        return new Promise(async (resolve, reject) => {
            let Drprescription = await db.get().collection(collection.PRESCRIPTION_COLLECTION).find({ drId: drId.dr }).toArray()
            console.log("Drprescription is.......")
            console.log(Drprescription)
            console.log(Drprescription)
            resolve(Drprescription)
        })
    },
    showHistory: (details) => {
        console.log("in show history......")
        console.log(details)
        console.log(details.doctor)
        
        // var drId1 = {drId:details.doctor}
        // var userId1 = {userId:details.user}
        return new Promise(async (resolve, reject) => {
            let userHistory = await db.get().collection(collection.PRESCRIPTION_COLLECTION).find({$and:[{drId:details.doctor},{userId:details.user}]}).toArray()
            console.log("History  is after db.......")
            console.log(userHistory)
            
            resolve(userHistory)
        })
    },
    updateDoctor: (drId, drDetails) => {

        return new Promise(async (resolve, reject) => {
            drDetails.Doctor_Password = await bcrypt.hash(drDetails.Doctor_Password, 10)
            db.get().collection(collection.DOCTOR_COLLECTIION)
                .updateOne({ _id: objectId(drId) }, {
                    $set: {
                        Doctor_Name: drDetails.Doctor_Name,
                        Doctor_Specialised: drDetails.Doctor_Specialised,
                        Doctor_Speciality: drDetails.Doctor_Speciality,
                        Doctor_Password: drDetails.Doctor_Password,
                        Doctor_Email: drDetails.Doctor_Email,
                        Image:drDetails.Image,
                    }

                }).then((response) => {
                    console.log(response)
                    resolve()
                })
        })
    },
    doDoctorLogin: (doctorData) => {
        console.log(doctorData)
        return new Promise(async (resolve, reject) => {
            // let loginStatus = false
            let response = {}
            var activeDoctor = { Status: "Active" }
            var blockedDoctor = { Status: "Blocked" }
            let doctor = await db.get().collection(collection.DOCTOR_COLLECTIION).findOne({ $or: [{ activeDoctor }, { blockedDoctor }, { Doctor_Email: doctorData.Doctor_Email }] })
            if (doctor) {
                bcrypt.compare(doctorData.Doctor_Password, doctor.Doctor_Password).then((authenticatedDoctor) => {
                    if (authenticatedDoctor) {
                        response.doctor = doctor
                        response.authenticatedDoctor = true
                        if (doctor.Status === 'Active') {
                            response.active = true
                            resolve(response)
                        } else {
                            response.active = false
                            resolve(response)
                        }

                    }
                    else {
                        resolve({ authenticatedDoctor: false })
                    }
                })
            }
            else {
                resolve({ authenticatedDoctor: false })

            }

        })
    },
    collectTodaysConfirmedAppointments: (doctorId) => {
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            let date1 = new Date();
            var date2 = dateFormat(date1, "isoDate");

            var today = { dateOfBooking: date2 }
            var confirmedAppointments = { Status: "Confirmed" }


            let todaysConfirmedAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, confirmedAppointments, today] }).toArray()
            {
                resolve(todaysConfirmedAppointmentList)
            }
        })
    },
    collectExpiredAppointments: (doctorId) => {
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            let date1 = new Date();
            var date2 = dateFormat(date1, "isoDate");
            var expired = { dateOfBooking: { $lt: date2 } }

            //  var confirmedAppointments = {Status : "Confirmed" }


            let expiredAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, expired] }).toArray()
            {
                resolve(expiredAppointmentList)
            }
        })
    },
    collectUpcomingConfirmedAppointments: (doctorId) => {
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            let date1 = new Date();
            var date2 = dateFormat(date1, "isoDate");
            var today = { dateOfBooking: { $gt: date2 } }
            var confirmedAppointments = { Status: "Confirmed" }


            let upcomingConfirmedAppointmentsList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, confirmedAppointments, today] }).toArray()
            {
                resolve(upcomingConfirmedAppointmentsList)
            }
        })
    },


    consultedAppointments: (prescription) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRESCRIPTION_COLLECTION).insertOne(prescription)
                .then((response) => {
                    db.get().collection(collection.APPOINTMENT_COLLECTION).updateOne({ _id: objectId(prescription.appointmentId) }, {
                        $set: {
                            Status: "Consulted"
                        }

                    })

                    resolve()

                })
        })

    },
    collectConsultedAppointments: (doctorId) => {
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            var consultedAppointments = { Status: "Consulted" }

            let consultedAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, consultedAppointments] }).toArray()
            {
                resolve(consultedAppointmentList)
            }
        })
    },
    collectPendingAppointments: (doctorId) => {
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            var pendingAppointments = { Status: "Pending" }

            let pendingAppointmentsList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, pendingAppointments] }).toArray()
            {
                resolve(pendingAppointmentsList)
            }
        })
    },
    doConfirmAppointments: (appointmentId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.APPOINTMENT_COLLECTION).updateOne({ _id: objectId(appointmentId.appointment) }, {
                $set: {
                    Status: "Confirmed"
                }
            }).then((response) => {
                resolve()
            })
        })

    },
    doCancelAppointments: (appointmentId) => {
        console.log(appointmentId)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.APPOINTMENT_COLLECTION).updateOne({ _id: objectId(appointmentId.appointment) }, {
                $set: {
                    Status: "Cancelled"
                }
            }).then((response) => {
                resolve()
            })
        })

    },
    collectCancelledAppointments: (doctorId) => {
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            var canceledAppointments = { Status: "Cancelled" }

            let appointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, canceledAppointments] }).toArray()
            {
                resolve(appointmentList)
            }
        })
    },
    collectMyPatients: (doctorId) => {
        return new Promise(async (resolve, reject) => {
            let result = [];
            let resp = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ dr_id: doctorId }).toArray()
            result.push(resp[0])

            if (resp.length > 1) {
                let i;
                for (i = 1; i < resp.length; i++) {
                    let j;
                    let flag = true;
                    innerLoop: for (j = 0; j < result.length; j++) {
                        if (resp[i].user_id === result[j].user_id) {
                            flag = false;
                            break innerLoop;
                        }
                    }
                    if(flag){
                        result.push(resp[i]);
                    }
                    
                };
            }

            resolve(result)

        })
    },
    collectPrescription: (drId) => {
        return new Promise(async (resolve, reject) => {
            let result = []
            let resp= await db.get().collection(collection.PRESCRIPTION_COLLECTION).find({ drId: drId }).toArray()
            {
                result.push(resp[0])
                let i;
                for(i=1;i<resp.length;i++){
                    flag = true
                    let j;
                    innerLoop:for(j=0;j<result.length;j++){
                        if(resp[i].userId === result[j].userId){
                            flag = false
                            break innerLoop
                        }
                        
                    }
                    if(flag){
                        result.push(resp[i])
                    }
                }
                
                resolve(result)

            }
        })
    },

}
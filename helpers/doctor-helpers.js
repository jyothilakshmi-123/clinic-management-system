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
            doctor.drPassword = await bcrypt.hash(doctor.drPassword, 10)
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
        console.log(drId)
        return new Promise(async (resolve, reject) => {
            let Drprescription = await db.get().collection(collection.PRESCRIPTION_COLLECTION).find({ drId: drId.dr }).toArray()
            console.log(Drprescription)
            let workbook = new excel.Workbook(); //creating workbook
            let worksheet = workbook.addWorksheet('Drprescription'); //creating worksheet
            worksheet.columns = [
                { header: 'Id', key: '_id', width: 30 },
                { header: 'DrName', key: 'drName', width: 30 },
                { header: 'UserName', key: 'userName', width: 30 },
                { header: 'dateOfBooking', key: 'dateOfBooking', width: 30 },
                { header: 'Prescriptions:', key: 'userPrescription', width: 40 },
                { header: 'UserAge:', key: 'userAge', width: 10, outlineLevel: 1 },

            ];
            //   var excelOutput = Date.now()+ ""
            worksheet.addRows(Drprescription);
            workbook.xlsx.writeFile("Drprescription.xlsx")
                .then(function () {
                    console.log("file saved!");
                });
                resolve(response)
        })
    },
    updateDoctor: (drId, drDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.DOCTOR_COLLECTIION)
                .updateOne({ _id: objectId(drId) }, {
                    $set: {
                        drName: drDetails.drName,
                        drSpecialised: drDetails.drSpecialised,
                        drSpeciality: drDetails.drSpeciality,
                        drPassword: drDetails.drPassword,
                        drEmail: drDetails.drEmail
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
            let loginStatus = false
            let response = {}
            var activeDoctor = { Status: "Active" }
            let doctor = await db.get().collection(collection.DOCTOR_COLLECTIION).findOne({ $and: [activeDoctor, { drEmail: doctorData.drEmail }] })



            if (doctor) {
                bcrypt.compare(doctorData.drPassword, doctor.drPassword).then((status) => {
                    if (status) {

                        console.log("Login Success")
                        response.doctor = doctor
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
    collectTodaysConfirmedAppointments: (doctorId) => {
        console.log("Name is ...." + doctorId)
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            let date1 = new Date();
            var date2 = dateFormat(date1, "isoDate");

            var today = { dateOfBooking: date2 }
            var confirmedAppointments = { Status: "Confirmed" }


            let todaysConfirmedAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, confirmedAppointments, today] }).toArray()
            {
                console.log(todaysConfirmedAppointmentList)
                resolve(todaysConfirmedAppointmentList)
            }
        })
    },
    collectExpiredAppointments: (doctorId) => {
        console.log("Name is ...." + doctorId)
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            let date1 = new Date();
            var date2 = dateFormat(date1, "isoDate");
            var expired = { dateOfBooking: { $lt: date2 } }

            //  var confirmedAppointments = {Status : "Confirmed" }


            let expiredAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, expired] }).toArray()
            {
                console.log(expiredAppointmentList)
                resolve(expiredAppointmentList)
            }
        })
    },
    collectUpcomingConfirmedAppointments: (doctorId) => {
        console.log("Name is ...." + doctorId)
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            let date1 = new Date();
            var date2 = dateFormat(date1, "isoDate");
            var today = { dateOfBooking: { $gt: date2 } }
            // var today = {dateOfBooking:date2}
            var confirmedAppointments = { Status: "Confirmed" }


            let upcomingConfirmedAppointmentsList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, confirmedAppointments, today] }).toArray()
            {
                console.log(upcomingConfirmedAppointmentsList)
                resolve(upcomingConfirmedAppointmentsList)
            }
        })
    },


    consultedAppointments: (prescription) => {
        console.log(prescription)
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
        console.log("Id is ...." + doctorId)
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            var consultedAppointments = { Status: "Consulted" }

            let consultedAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, consultedAppointments] }).toArray()
            {
                console.log(consultedAppointmentList)
                resolve(consultedAppointmentList)
            }
        })
    },
    collectPendingAppointments: (doctorId) => {
        console.log("Id is ...." + doctorId)
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            var pendingAppointments = { Status: "Pending" }

            let pendingAppointmentsList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, pendingAppointments] }).toArray()
            {
                console.log(pendingAppointmentsList)
                resolve(pendingAppointmentsList)
            }
        })
    },
    doConfirmAppointments: (appointmentId) => {
        console.log(appointmentId)
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
        console.log("Name is ...." + doctorId)
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            var canceledAppointments = { Status: "Cancelled" }

            let appointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, canceledAppointments] }).toArray()
            {
                console.log(appointmentList)
                resolve(appointmentList)
            }
        })
    },
    collectMyPatients: (doctorId) => {
        console.log("Id is ...." + doctorId)
        return new Promise(async (resolve, reject) => {
            var doctorridd = { dr_id: doctorId }
            var myPatients = { Status: "Consulted" }

            let myPatientslist = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [doctorridd, myPatients] }).toArray()
            {
                console.log(myPatientslist)
                resolve(myPatientslist)
            }
        })
    },
    collectPrescription: (drId) => {
        console.log("Userid is ...." + drId)
        return new Promise(async (resolve, reject) => {
            //  var useridd =    {userId : userId }

            let prescription = await db.get().collection(collection.PRESCRIPTION_COLLECTION).find({ drId: drId }).toArray()
            {
                console.log(prescription)
                resolve(prescription)

            }
        })
    },

}
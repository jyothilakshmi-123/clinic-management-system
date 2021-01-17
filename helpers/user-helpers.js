var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
var dateFormat = require("dateformat");
const { response } = require('express')

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.userPassword = await bcrypt.hash(userData.userPassword, 10)
            let userEmail = await db.get().collection(collection.USER_COLLECTION).findOne({ userEmail: userData.userEmail })
            let userPhone = await db.get().collection(collection.USER_COLLECTION).findOne({ userMobile: userData.userMobile })
            if (!userEmail && !userPhone) {
                userData.user = true
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((response) => {
                    resolve(response.ops[0])
                })
                // Validations

            } else {
                response.error = true
                // re.flash('error', 'Your account is exists. Please log in.');
                resolve(response, { message: 'Your account is exists. Please log in.' })
            }
        })


    },
    getActiveUsersList: () => {
        return new Promise(async (resolve, reject) => {
            var activeUsers = { Status: "Active" }
            var blockedUsers = { Status: 'Blocked' }
            let usersList = await db.get().collection(collection.USER_COLLECTION).find({ $or: [activeUsers, blockedUsers] }).toArray()
            resolve(usersList)
        })

    },
    deleteUser: (userId) => {
        console.log(userId)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId.user) }, {
                $set: {
                    Status: "Deleted"
                }
            }).then((response) => {
                resolve()
            })
        })

    },
    blockUser: (userId) => {
        console.log(userId)
        return new Promise(async (resolve, reject) => {
            let userfromDB = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId.user) })
            if (userfromDB.Status === "Active") {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId.user) }, {
                    $set: {
                        Status: "Blocked"
                    }
                })
            } else {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId.user) }, {
                    $set: {
                        Status: "Active"
                    }
                })
            }
        }).then((response) => {
            resolve()
        })
    },
    getUsersList: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((usersList) => {
                resolve(usersList)
            })

        })

    },
    updateUser: (userId, userDetails) => {
        return new Promise(async (resolve, reject) => {
            userDetails.userPassword = await bcrypt.hash(userDetails.userPassword, 10)
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(userId) }, {
                    $set: {
                        displayName: userDetails.displayName,
                        userAge: userDetails.userAge,
                        userEmail: userDetails.userEmail,
                        userMobile: userDetails.userMobile,
                        userPassword: userDetails.userPassword,
                        Image:userDetails.Image,
                        imagePresent:true   
                    }

                }).then((response) => {
                    resolve(response)
                })
        })
    },
    exportToExcel: (userId) => {
        console.log(userId)
        return new Promise(async (resolve, reject) => {
            let Userprescription = await db.get().collection(collection.PRESCRIPTION_COLLECTION).find({ userId: userId.user }).toArray()
            resolve(Userprescription)
        })
    },
    addUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.userPassword = await bcrypt.hash(userData.userPassword, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.ops[0])
            })

        })


    },
    makeAppointment: (book) => {
        console.log(book)
        return new Promise(async (resolve, reject) => {

            var sameDr = { dr_id : book.dr_id }
            var sameDate = { dateOfBooking: book.dateOfBooking }
            var sameTime = { timeOfBooking: book.timeOfBooking }
            let appointment = await db.get().collection(collection.APPOINTMENT_COLLECTION).findOne({ $and: [sameDr, sameDate, sameTime] })
            if (!appointment) {
                db.get().collection(collection.APPOINTMENT_COLLECTION).insertOne(book).then((data) => {
                    console.log("data s......")
                    console.log(data.ops[0])
                    resolve(data.ops[0])
                })
            } else {
                response.error = true
                // re.flash('error', 'Your account is exists. Please log in.');
                resolve(response, { message: 'This time slot is not available now, You can select another time' })

            }
        })
    },
    collectCurrentBookedAppointments: (userId) => {
        return new Promise(async (resolve, reject) => {
            var useridd = { user_id: userId }
            var pendingAppointments = { Status: "Pending" }

            let appointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [useridd, pendingAppointments] }).toArray()
            {
                resolve(appointmentList)
            }
        })
    },
    collectPresentAppointment: (appId) => {
        return new Promise(async (resolve, reject) => {
            // var appid = { _id: appId }
            console.log("id ......")
            console.log(appId)
            
            let appointmentDetails = await db.get().collection(collection.APPOINTMENT_COLLECTION).findOne({ _id: objectId(appId) })
            {
                console.log(appointmentDetails)
                resolve(appointmentDetails)
            }
        })
    },

    collectCancelledAppointments: (userId) => {
        return new Promise(async (resolve, reject) => {
            var useridd = { user_id: userId }
            var canceledAppointments = { Status: "Cancelled" }

            let appointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [useridd, canceledAppointments] }).toArray()
            {
                resolve(appointmentList)
            }
        })
    },
    collectPendingAppointments: (userId) => {
        return new Promise(async (resolve, reject) => {
            var useridd = { user_id: userId }
            var pendingAppointments = { Status: "Pending" }

            let pendingAppointmentsList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [useridd, pendingAppointments] }).toArray()

            {
                console.log(pendingAppointmentsList)
                resolve(pendingAppointmentsList)
            }
        })
    },
    collectConfirmedAppointments: (userId) => {
        return new Promise(async (resolve, reject) => {
            var useridd = { user_id: userId }
            var confirmedAppointments = { Status: "Confirmed" }

            let confirmedAppointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [useridd, confirmedAppointments] }).toArray()
            {
                resolve(confirmedAppointmentList)
            }
        })
    },
    cancelledAppointments: (appointmentId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.APPOINTMENT_COLLECTION).updateOne({ _id: objectId(appointmentId.appointment) }, {
                $set: {
                    Status: "Cancelled"
                }
            }).then((response) => {
                resolve(response)
            })
        })

    },
    collectPrescription: (userId) => {
        return new Promise(async (resolve, reject) => {
            let prescription = await db.get().collection(collection.PRESCRIPTION_COLLECTION).find({ userId: userId }).toArray()
            {
                resolve(prescription)
            }
        })
    },

}
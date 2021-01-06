var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
var dateFormat = require("dateformat");

module.exports = {
    addUser: (user) => {
        console.log(user)
        return new Promise(async (resolve, reject) => {
            user.userPassword = await bcrypt.hash(user.userPassword, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data) => {
                console.log(data)
                resolve(data.ops[0])
            })
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
        return new Promise(async(resolve, reject) => {
            userDetails.userPassword = await bcrypt.hash(userDetails.userPassword, 10)
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(userId) }, {
                    $set: {
                        displayName: userDetails.displayName,
                        userAge: userDetails.userAge,
                        userMobile: userDetails.userMobile,
                        userPassword: userDetails.userPassword
                    }

                }).then((response) => {
                    resolve()
                })
        })
    },
    exportToExcel: (userId) => {
        console.log(userId)
        return new Promise(async (resolve, reject) => {
            let Userprescription = await db.get().collection(collection.PRESCRIPTION_COLLECTION).find({ userId: userId.user }).toArray()
            console.log("Userprescription is.......")
            console.log(Userprescription)
            console.log(Userprescription)
            resolve(Userprescription)
        })
    },
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.userPassword = await bcrypt.hash(userData.userPassword, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.ops[0])
            })

        })


    },
    makeAppointment: (book) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.APPOINTMENT_COLLECTION).insertOne(book).then((data) => {
                resolve(data)
            })
        })
    },
    collectCurrentBookedAppointments: (userId) => {
        return new Promise(async (resolve, reject) => {
            var useridd = { user_id: userId }
            var canceledAppointments = { Status: "Pending" }

            let appointmentList = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ $and: [useridd, canceledAppointments] }).toArray()
            {
                resolve(appointmentList)
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
                resolve()
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
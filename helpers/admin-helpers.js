var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports={ 
    

    
    doAdminLogin:(adminData)=>{
        console.log(adminData)
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            
            
            // console.log("db pw-----------" + admin.Password)
            // console.log("web pw-----------" + adminData.Password)
            // let newPassword =await bcrypt.hash(admin.Password,10)
            // console.log("bcrypted..." +newPassword)
            // let adminDetails = await db.get().collection(collection.ADMIN_COLLECTION).updateOne({Password:"abcd"},{$set:{Password:newPassword}})

            if(admin){
                bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                    if(status){

                        console.log("Login Success")
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    }
                    else{
                        console.log("login failed")
                resolve({status:false})
                    }
                })
            }
            else{
                    console.log("login failed")
                    resolve({status:false})
                }
                
        })
    },
    
    
}
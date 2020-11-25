var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports={
    doAdminLogin:(adminData)=>{
        console.log(adminData)
        return new Promise(async(resolve,reject)=>{
            // let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email,Password:adminData.Password})
            
            // let passwordHash = bcrypt.hash(admin.Password,10)
            // console.log("db pw-----------" + admin.Password)
            // console.log("web pw-----------" + adminData.Password)
            if(admin){
                
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
    },
    
    
}
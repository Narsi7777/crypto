const mongoose=require("mongoose")
const dotenv=require("dotenv")
dotenv.config()

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Cloud Data base  MongoDB connected");
    }catch(error){
        console.log("Connection Failed",error)
        process.exit(1)
    }
}
module.exports=connectDB
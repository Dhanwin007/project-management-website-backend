import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AvalaibleUserRole, UserRolesEnum } from "../utils/constants.js";

const userSchema=new mongoose.Schema({
   avatar: {
  url: {
    type: String,
    default: "https://placehold.co/200x200"
  },
  localPath: {
    type: String,
    default: ""
  }
},
role: {
    type: String,
    enum: AvalaibleUserRole, 
    default: UserRolesEnum.MEMBER//by default it will be member
  },
refreshToken: {
        type: String // <--- ADD THIS to store the Refresh Token
    },
username:
{
    type:String,
    required:true,
    unique:true,
    trim:true,
    index:true,/* remember indexeing should not be done to every field be very carefull like what is going to be your search parameter 
it is username or something else */
},
email:{
    type:String,
    unique:true,
    required:true,
    lowercase:true,
    uppercase:false,
    trim:true
},
fullName:
{
    type:String,
    trim:true
},
password:{
    type: String,
    required:[true,"please enter your password"]
},
isEmailVerified:{
    type:Boolean,
    default:false
},
forgotPasswordToken:{// stores the crypto token
    type:String
},
forgotPasswordExpiry : {
    type: Date
},
emailVerificationToken:{// stores the crypto token
    type:String
},
emailVerificationExpiry:{
    type:Date
}
},
{
    timestamps:true,
}
);
userSchema.pre("save",async function(){
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password,10)
    
    
});
userSchema.methods.isPasswordCorrect = async function(password)//password just passsed by the user(from the client side)
{
      return await bcrypt.compare(password,this.password)
};
userSchema.methods.isAvatarEmpty = function() {
    // 'this' refers to the specific user document
    return this.avatar.url === "https://placehold.co/200x200";
};
userSchema.methods.generateAccessToken = function(){
     return jwt.sign({
        _id : this._id,
        email: this.email,
        username: this.username// this is the payload
    },
  process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
})
}
userSchema.methods.generateRefreshToken= function()
{
    return jwt.sign({
        _id:this._id,
        
    }
,process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
}
);
};
userSchema.methods.generateTemporaryToken = function()
{
    const unHashedToken = crypto.randomBytes(32).toString("hex");// 1. Generate the random string to send to the user's email
    //2.hash it before storing in db
    const hashedToken = crypto
      .createHash("sha256")
      .update(unHashedToken)
      .digest("hex")

    const tokenExpiry = Date.now() + (20*60*1000)//20 mins from current time
    return {unHashedToken,hashedToken,tokenExpiry}  

};
const User = mongoose.model("User",userSchema);
export {User};

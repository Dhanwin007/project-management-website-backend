import jwt from "jsonwebtoken";
import {ApiError} from "../utils/api-error.js"
import {User} from "../models/user.models.js"
import { asyncHandler } from "../utils/async-handler.js"



 const verifyJWT = asyncHandler(async(req,res,next)=>
{
    const token =req.cookies?.accessToken || req.header("Authorization")?.repalce("Bearer ","");/*"?" represents optional chaining i.e, if req.cookies are present then th
    access token is accessed if the req.cookies does not exist then it does not throw any error and simply stops chaining
    (not accesing the access token that does not exist) */
    if(!token){
        throw new ApiError(401,"Unauthorized request")
    }
    try{
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        );
        if(!user){
            throw new ApiError(401,"Invalid token");
        }
        req.user=user;
        next()
    }catch(error)
    {
        throw new ApiError(401,"Invalid access token")
    }

})
export {verifyJWT};
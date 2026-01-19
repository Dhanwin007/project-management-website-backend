import {User} from "../models/user.models.js"
import {ApiResponse} from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerificationMailgenContent, sendEmail,forgotPasswordMailgenContent } from "../utils/mail.js";
import crypto from"crypto";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken =async (userId)=>{

try{    const user = await User.findById(userId)
const accessToken=user.generateAccessToken();
const refreshToken=user.generateRefreshToken();
user.refreshToken=refreshToken;
await user.save({validateBeforeSave:false});
return {accessToken,refreshToken}
}
catch(error){
    throw new ApiError(500,"something went wrong while generating access token")
}
} 

const registerUser = asyncHandler(async(req,res)=>{
    const {email, username, password, role} = req.body
    const existingUser=await User.findOne({
        $or: [{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    const user= await User.create({ // User: static mongoose methods like find update create user: instance methods(applied for only person after fetching) 
        email,//email:email here we use shortcut as the variable name and db field name is name
        password,
        username,
        isEmailVerified: false 
    })

    const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry= tokenExpiry;
    await user.save({validateBeforeSave: false});
    try{await sendEmail(
        {
            email:user?.email,
            subject:"please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            )
        }
    );}
    catch(error)
    {
        console.log("email not connected",error);
    }
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"//these fields wil be removed while fetching data
    );

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {user:createdUser},
                "user registered successfully and verification email has been sent on your email",
            )
        )
});
const login = asyncHandler(async (req,res)=>{
    const { email,password,username}=req.body;
    if(!email)
    {
        throw new ApiError(400,"Username or email is required");
    }
    const user = await User.findOne({email:email})//we have the access to the user from here
    if(!user){
        throw new ApiError(400,"User not registered");
    }
    const isPasswordValid= await user.isPasswordCorrect(password);
    if(!isPasswordValid)
    {
        throw new ApiError(400,"Invalid password");
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
     const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"//these fields wil be removed while fetching data
    );

    const options={
        httpOnly: true,
        secure:true

    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )
});
const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:""
            }
        },
    {new:true});

const options={
    httpOnly:true,
    secure:true
}
return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200,{},"User Logged out")
    )
}); 
const verifyEmail = asyncHandler(async(req,res)=>{
    const {verificationToken}=req.params
    if(!verificationToken){
        throw new ApiError(400,"Email verification Token is Missing")
    }
    let hashedToken=crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")
    const user = await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}
    })
    if(!user){
        throw new ApiError(400,
            "Token is invalid or expired"
        );
    }
    
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    
    user.isEmailVerified=true;
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(
        new ApiResponse(200,{
            isEmailVerified:true
        },"email is verified")
    )
});
const resendEmailVerification = asyncHandler(async(req,res)=>{
    //can be send by the only user who is logged in
    const user = await User.findById(req.user?._id)
    if(!user)
    {
        throw new ApiError(404,"User does not exist")
    }
    if(user.isEmailVerified)
    {
        throw new ApiError(409,"Email is already verified")
    }
    const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry= tokenExpiry;
    await user.save({validateBeforeSave: false});
    try{await sendEmail(
        {
            email:user?.email,
            subject:"please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            )
        }
    );}
    catch(error)
    {
        console.log("email not connected",error);
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Mail has been sent to your email id")
    )

});
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"Unauthorised access")
    }
    try{
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
        if(incomingRefreshToken!==user?.refreshToken)
        {
            throw new ApiError(401," refresh Token has Expired");
        }
        const {accessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshToken(user._id)
        user.refreshToken=newRefreshToken;
        await user.save();
        const options = {
            httpOnly:true,
            secure:true
        }
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token Refreshed")
        )

    }
    catch(err)
    {
        throw new ApiError(401,"Invalid refresh Token");
    }
});
const forgotPasswordRequest = asyncHandler(async(req,res)=>{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(404,"User not found")
    }
     const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry= tokenExpiry;
    await user.save({validateBeforeSave: false});
    try{await sendEmail(
        {
            email:user?.email,
            subject:"Password reset email",
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
            )
        }
    );}
    catch(error)
    {
        console.log("email not connected",error);
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "password reset mail has been sent"
        )
    )

});
const resetForgotPassword = asyncHandler(async(req,res)=>{
    const {resetToken} = req.params;
    const {newPassword}=req.body;
    let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    const user = await User.findOne({forgotPasswordToken:hashedToken,
        forgotPasswordExpiry:{$gt:Date.now()}

    });

    if(!user){
        throw new ApiError(489,"Token is Invalid or expired")
    }
    user.forgotPasswordExpiry=undefined
    user.forgotPasswordToken=undefined

    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"password reset successfully")
    )
    
});
//change password allowed only for logged in users while resetting is done for forgot password
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(400,"Invalid old password")
    }
    
        user.password=newPassword;
        await user.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"password changed successfully")
    )
})
export {registerUser,login,logoutUser,verifyEmail,resendEmailVerification,refreshAccessToken,forgotPasswordRequest,resetForgotPassword
    ,changeCurrentPassword
};
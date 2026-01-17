import { Router } from "express";
import { registerUser,login,logoutUser,verifyEmail,refreshAccessToken,forgotPasswordRequest,resetForgotPassword,changeCurrentPassword,resendEmailVerification } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {userLoginValidator, userRegisterValidator,userChangeCurrentPasswordValidator,userForgotPasswordValidator,userResetForgotPasswordValidator} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCurrentUser } from "../controllers/user.controller.js";

//unsecure routes
 const router=Router();//object is returned here
 router.route("/register").post(userRegisterValidator()/*This is a function from where we are collecting errors*/,validate,registerUser)
 router.route("/login").post(userLoginValidator(),validate,login);
  router.route("/verify-email/:verificationToken").get(verifyEmail);
 router.route("/refresh-token").post(refreshAccessToken);
 router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPasswordRequest);
 router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(),validate,resetForgotPassword);

 //secure routes
 router.route("/logout").post(verifyJWT,logoutUser);//middlewares we just pass the reference so that next take cares of it
 router.route("/change-password").post(verifyJWT,userChangeCurrentPasswordValidator(),validate,changeCurrentPassword);
 router.route("/resend-email-verification").post(verifyJWT,resendEmailVerification);
 router.route("/current-user").get(verifyJWT,getCurrentUser);

 export default router; 
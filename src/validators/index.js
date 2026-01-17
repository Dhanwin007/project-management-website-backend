import { body,query } from "express-validator";

const userRegisterValidator = ()=>{
    return [
         body("email")
         .trim()
         .notEmpty()
         .withMessage("Email is Reequired")
         .isEmail()
         .withMessage("Email is Invalid"),
         body("username")
         .trim()
         .notEmpty()
         .withMessage("username is required")
         .isLowercase()
         .withMessage("username must be in lowercase")
         .isLength({min:3})
         .withMessage("username  must be atleast 3 characters long"),
         body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required")
        ,
        body("fullname")
        .optional()
        .trim()
        
         
    ];

};
const userLoginValidator=()=>
{
    return [
        body("email")
        .optional()
        .isEmail()
        .withMessage("Email is invalid"),
        body("password")
        .trim()
        .notEmpty()
        .withMessage("please enter the password")

    ];
};

const userChangeCurrentPasswordValidator = ()=>{
    return [
        body("oldPassword")
        .trim()
        .notEmpty()
        .withMessage("please Enter the old Password"),
        body("newPassword")
        .trim()
        .notEmpty()
        .withMessage("new Password is required")
    ]
}
const userForgotPasswordValidator = ()=>{
    return[
        //The user sends an email for which he wants to recieve the reset password link
        body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email address"),

    ]
};
const userResetForgotPasswordValidator = ()=>{
    return [
        body("newPassword")
        .notEmpty()
        .withMessage("Password is required")
    ]
}

export {userRegisterValidator,userLoginValidator,userChangeCurrentPasswordValidator,userForgotPasswordValidator,userResetForgotPasswordValidator}

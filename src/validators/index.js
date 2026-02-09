import { body, query } from 'express-validator';
import {
  AvalaibleUserRole,
  AvailableTaskStatuses,
 
} from '../utils/constants.js';

const userRegisterValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is Reequired')
      .isEmail()
      .withMessage('Email is Invalid'),
    body('username')
      .trim()
      .notEmpty()
      .withMessage('username is required')
      .isLowercase()
      .withMessage('username must be in lowercase')
      .isLength({ min: 3 })
      .withMessage('username  must be atleast 3 characters long'),
    body('password').trim().notEmpty().withMessage('password is required'),
    body('fullname').optional().trim(),
    body('role')
    .optional()
    .isIn(AvalaibleUserRole)
    .withMessage('Role not defined')
  ];
};
const userLoginValidator = () => {
  return [
    body('email').optional().isEmail().withMessage('Email is invalid'),
    body('password').trim().notEmpty().withMessage('please enter the password'),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body('oldPassword')
      .trim()
      .notEmpty()
      .withMessage('please Enter the old Password'),
    body('newPassword')
      .trim()
      .notEmpty()
      .withMessage('new Password is required'),
  ];
};
const userForgotPasswordValidator = () => {
  return [
    //The user sends an email for which he wants to recieve the reset password link
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email address'),
  ];
};
const userResetForgotPasswordValidator = () => {
  return [body('newPassword').notEmpty().withMessage('Password is required')];
};

const createProjectValidator = () => {
  return [
    body('name').notEmpty().withMessage('Name is Required'),
    body('description').optional(),
  ];
};
const addMemberToProjectValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('The email must be valid'),
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(AvalaibleUserRole) //important
      .withMessage('Role is Invalid'),
  ];
};
const createTaskValidator = () => {
  return [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('assignedToID')
      .optional()
      .isMongoId()
      .withMessage('Invalid assignedToID'),
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(AvailableTaskStatuses)
      .withMessage('Invalid status'),
  ];
};
const createSubTaskValidator = () => {
  return [body('title').trim().notEmpty().withMessage('Title is required')];
};

export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  createProjectValidator,
  addMemberToProjectValidator,
  createTaskValidator,
  createSubTaskValidator,
};

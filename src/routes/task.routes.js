import { Router } from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from '../controllers/task.controllers.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
  createTaskValidator,
  createSubTaskValidator,
} from '../validators/index.js';
import {
  verifyJWT,
  validateProjectPermission,
} from '../middlewares/auth.middleware.js';
import { UserRolesEnum } from '../utils/constants.js';
import { upload } from "../middlewares/multer.middleware.js"; // 1. IMPORT MULTER

const router = Router();

router.use(verifyJWT);

router
  .route('/:projectId')
  .get(validateProjectPermission(), getTasks)
  .post(
    upload.array("attachments", 5), // 2. ADD MULTER HERE (before validator)
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    createTaskValidator(),
    validate,
    createTask,
  );

router
  .route('/:projectId/t/:taskId')
  .get(validateProjectPermission(), getTaskById)
  .put(
    upload.array("attachments", 5), // 3. ADD MULTER HERE TOO for updates
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    createTaskValidator(),
    validate,
    updateTask,
  )
  .delete(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    deleteTask,
  );

router
  .route('/:projectId/t/:taskId/subtasks')
  .post(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    createSubTaskValidator(),
    validate,
    createSubTask,
  );

router
  .route('/:projectId/st/:subTaskId')
  .put(
    validateProjectPermission([ // 4. ADDED ROLES (Standard users shouldn't edit subtasks usually)
      UserRolesEnum.ADMIN, 
      UserRolesEnum.PROJECT_ADMIN 
    ]), 
    updateSubTask
  )
  .delete(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    deleteSubTask,
  );

export default router;

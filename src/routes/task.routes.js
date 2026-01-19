import { Router } from "express";
import {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask
} from "../controllers/task.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createTaskValidator, createSubTaskValidator } from "../validators/index.js";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/:projectId")
    .get(validateProjectPermission(), getTasks)
    .post(validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), createTaskValidator(), validate, createTask);

router
    .route("/:projectId/t/:taskId")
    .get(validateProjectPermission(), getTaskById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), createTaskValidator(), validate, updateTask)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteTask);

router
    .route("/:projectId/t/:taskId/subtasks")
    .post(validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), createSubTaskValidator(), validate, createSubTask);

router
    .route("/:projectId/st/:subTaskId")
    .put(validateProjectPermission(), updateSubTask)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteSubTask);

export default router;

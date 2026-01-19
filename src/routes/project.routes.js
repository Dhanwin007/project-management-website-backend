import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  getProjectMembers,
  deleteProject,
  deleteMember,
  updateMemberRole,
  updateProject,
  addMembersToProject,
} from '../controllers/project.controllers.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
  createProjectValidator,
  addMemberToProjectValidator,
} from '../validators/index.js';
import {
  verifyJWT,
  validateProjectPermission,
} from '../middlewares/auth.middleware.js';
import { AvalaibleUserRole, UserRolesEnum } from '../utils/constants.js';
const router = Router();
router.use(verifyJWT);
router
  .route('/')
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);
router
  .route('/:projectId')
  .get(validateProjectPermission(AvalaibleUserRole), getProjectById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProject,
  )
  .delete(
    validateProjectPermission([
      UserRolesEnum.PROJECT_ADMIN,
      UserRolesEnum.ADMIN,
    ]),
    createProjectValidator(),
    validate,
    deleteProject,
  );
router
  .route('/:projectId/members')
  .get(getProjectMembers)
  .post(
    validateProjectPermission(UserRolesEnum),
    addMemberToProjectValidator(),
    validate,
    addMembersToProject,
  );
router
  .route('/:projectId/members/:userId')
  .put(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    updateMemberRole,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMember);

export default router;

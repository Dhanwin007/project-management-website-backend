import { User } from '../models/user.models.js';
import { Project } from '../models/project.models.js';
import { ProjectMember } from '../models/projectmember.models.js';
import { Task } from '../models/task.models.js';
import { Subtask } from '../models/subtask.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import mongoose from 'mongoose';
import {
  AvalaibleUserRole,
  UserRolesEnum,
  TaskStatusEnum,
  AvailableTaskStatuses,
} from '../utils/constants.js';

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(400, 'Project not found');
  }
  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  })
    .populate('assignedTo', 'avatar username fullName')
    .populate('project', 'name description'); //find returns an array of tasks that belong to that project
  return res.status(200).json(
    new ApiResponse(200, tasks, 'task of a project fetched  successfully'), //200-fetched successfully
  );
});
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedToID, status } = req.body;
  const { projectId } = req.params;
  if (!AvailableTaskStatuses.includes(status)) {
    throw new ApiError(400, 'Status not defined');
  }

  const project = await Project.findById(projectId); //finding the project details to which we need to create tasks
  if (!project) {
    throw new ApiError(404, 'project not found');
  }
  const files = req.files || [];
  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });
  const task = await Task.create({
    title,
    description: description,
    status,
    assignedTo: assignedToID
      ? new mongoose.Types.ObjectId(assignedToID)
      : undefined,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(projectId),
    attachments,
  });
  return res.status(201).json(
    new ApiResponse(201, task, 'task created successfully'), //201-creted successfully
  );
});
const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'assignedTo',
        foreignField: '_id',
        as: 'assignedTo',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'subtasks',
        localField: '_id',
        foreignField: 'task',
        as: 'subtasks',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'createdBy',
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
                {
                  $addFields: {
                    createdBy: {
                      $arrayElemAt: ['$createdBy', 0],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ['$assignedTo', 0],
        },
      },
    },
  ]);
  if (!task || task.length === 0) {
    throw new ApiError(404, 'Task not found');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task[0], 'Task Fetched Successfully'));
});
const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, status, assignedTo, attachments } = req.body;
  if (!AvailableTaskStatuses.includes(status)) {
    throw new ApiError(404, 'status in Invalid');
  }

  const project = await Project.findById(
    new mongoose.Types.ObjectId(projectId),
  );
  if (!project) {
    throw new ApiError(404, 'project not found');
  }
  const task = await Task.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(taskId),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      title,
      status,
      assignedTo,
      attachments,
    },
    { new: true },
  );
  if (!task) {
    throw new ApiError(404, 'task specified is not found');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task, 'task updated successfully'));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'project not found');
  }
  const task = await Task.findOneAndDelete({
    _id: taskId,
    project: projectId, // This prevents deleting tasks from other projects
  });
  if (!task) {
    throw new ApiError(404, 'task not found');
  }
  return res.status(200).json(new ApiResponse(200, 'deleted successfully'));
});
const createSubTask = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { projectId, taskId } = req.params;

  if (!title) {
    throw new ApiError(400, 'Title is required');
  }

  const task = await Task.findOne({ _id: taskId, project: projectId });
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const subtask = await Subtask.create({
    title,
    task: new mongoose.Types.ObjectId(taskId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subtask, 'Subtask created successfully'));
});
const updateSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  const { projectId, subTaskId } = req.params;

  const subtask = await Subtask.findById(subTaskId).populate('task');
  if (!subtask) {
    throw new ApiError(404, 'Subtask not found');
  }

  const task = subtask.task;
  if (task.project.toString() !== projectId) {
    throw new ApiError(404, 'Subtask not found in this project');
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

  const updatedSubtask = await Subtask.findByIdAndUpdate(
    subTaskId,
    updateData,
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSubtask, 'Subtask updated successfully'));
});
const deleteSubTask = asyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;

  const subtask = await Subtask.findById(subTaskId).populate('task');
  if (!subtask) {
    throw new ApiError(404, 'Subtask not found');
  }

  const task = subtask.task;
  if (task.project.toString() !== projectId) {
    throw new ApiError(404, 'Subtask not found in this project');
  }

  await Subtask.findByIdAndDelete(subTaskId);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Subtask deleted successfully'));
});

export {
  getTasks,
  getTaskById,
  deleteSubTask,
  deleteTask,
  updateSubTask,
  updateTask,
  createSubTask,
  createTask,
};

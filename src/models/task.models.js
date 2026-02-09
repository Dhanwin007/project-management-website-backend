import mongoose from 'mongoose';
import { TaskStatusEnum, AvailableTaskStatuses } from '../utils/constants.js';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    status: {
      enum: AvailableTaskStatuses,
      default: TaskStatusEnum.TODO,
      type: String,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
   attachments: [
    {
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true // Essential for deleting from Cloudinary
        },
        mimetype: {
            type: String
        },
        size: {
            type: Number
        },
    },
],
      default: [],
      /*In a task management or project model, an attachments field is used to store references to files related to a specific 
        task—such as images, PDFs, or spreadsheets.

Since you are building web applications, it's important to know that you 
never store the actual file (the binary data) directly in MongoDB. Instead, 
you store a "reference" (a URL or path) to where the file lives (like AWS S3 or Cloudinary)*/
},
  { timestamps: true },
);
export const Task = mongoose.model('Task', taskSchema);

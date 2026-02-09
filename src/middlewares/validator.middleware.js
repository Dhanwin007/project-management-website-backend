import { validationResult } from 'express-validator';
import { ApiError } from '../utils/api-error.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req); //collects all the errors from validator and keeps it here

  if (errors.isEmpty()) {
    return next();
  }
  // GHOST PROBLEM FIX: Delete files if validation fails
    const files = req.files; // For upload.array()
    const file = req.file;   // For upload.single()

    if (files && files.length > 0) {
        files.forEach(f => {
            if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
    }

    if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
  throw new ApiError(422, 'Recieved data not valid', extractedErrors);
};

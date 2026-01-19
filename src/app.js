import express from 'express';
import cors from 'cors';
import { ApiError } from './utils/api-error.js'; // Make sure the path is correct
import cookieParser from 'cookie-parser';
const app = express(); //this returns an object so app now holds an object
//basic configuration
app.use(express.json({ limit: '16kb' })); //sets a limit on data a server can accept from user(it is a middleware acs as entry check)
app.use(express.urlencoded({ extended: true, limit: '16kb' })); //used to handle information sent through query strings and properly parse them into json object(again a middleware)
app.use(express.static('public')); //makes public folder publicly(instantly) available(used to serve static docs like images,text)
//No Routes Needed: You don't have to write an app.get("/logo.png", ...) for every single image. Express handles the "delivery" automatically.
//cors configuration
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
    methods: ['PUT', 'GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  }),
);

//import the routes
import healthCheckRouter from './routes/healthcheck.routes.js';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import taskRouter from './routes/task.routes.js';
app.use('/api/v1/healthcheck', healthCheckRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/projects/tasks', taskRouter);

app.get('/', (req, res) => {
  res.send('you are on the home page');
});

app.use((err, req, res, next) => {
  // If the error is an instance of our ApiError class
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // Fallback for unexpected errors (like DB disconnection)
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});

export default app; // exports the app object along with all the changes made to that object

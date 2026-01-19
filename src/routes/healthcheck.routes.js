import { Router } from 'express';
import { healthCheck } from '../controllers/healthcheck.controller.js';

const router = Router(); //object is returned here
router.route('/').get(healthCheck); //healthCheck is the method that is serving the get request on /
export default router;

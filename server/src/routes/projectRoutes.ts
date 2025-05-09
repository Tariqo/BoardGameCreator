import express, { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createProject,
  listProjects,
  getProject,
} from '../controllers/projectController';

const router: Router = express.Router();

// Apply authentication middleware to all project routes
router.use(authenticateToken);

// Create a new project
router.post('/', createProject);

// List all projects for the authenticated user
router.get('/', listProjects);

// Get a specific project
router.get('/:projectId', getProject);

export default router; 
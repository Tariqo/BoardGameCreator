import express, { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createProject,
  listProjects,
  getProject,
} from '../controllers/projectController';
import {
  likeProject,
  unlikeProject,
  getLikedProjects,
} from '../controllers/likeController';

const router: Router = express.Router();

// Make sure user is logged in for all project routes
router.use(authenticateToken);

// Project management
router.post('/', createProject);         // Create new project
router.get('/', listProjects);          // Get all your projects

// Likes and favorites
router.post('/like', likeProject);       // Add to liked projects
router.get('/liked', getLikedProjects);  // View your liked projects
router.delete('/like/:projectId', unlikeProject);  // Remove from liked projects

// Individual project access
router.get('/:projectId', getProject);   // View specific project

export default router; 
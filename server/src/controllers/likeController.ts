import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Project } from '../models/Project';
import mongoose from 'mongoose';

// Add userId to Express Request type
interface AuthRequest extends Request {
  userId?: string;
}

// Add a project to user's liked list
export const likeProject = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const userId = req.userId;
  
  if (!userId) {
    res.status(401).json({ message: 'You need to be logged in', likedProjects: [] });
    return;
  }

  const { projectId } = req.body;

  // Make sure we got a valid project ID
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: 'Please provide a valid project ID', likedProjects: [] });
    return;
  }

  // First check if the project exists
  Project.findById(projectId)
    .then(project => {
      if (!project) {
        res.status(404).json({ message: 'Could not find this project', likedProjects: [] });
        return;
      }

      // Add to user's liked list (MongoDB will handle duplicates)
      return User.findByIdAndUpdate(
        userId,
        { $addToSet: { likedProjects: projectId } },
        { new: true }
      );
    })
    .then(user => {
      if (!user) {
        res.status(404).json({ message: 'Could not find your user account', likedProjects: [] });
        return;
      }

      res.status(200).json({ message: 'Added to your liked projects!', likedProjects: user.likedProjects });
    })
    .catch(next);
};

// Remove a project from user's liked list
export const unlikeProject = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const userId = req.userId;
  
  if (!userId) {
    res.status(401).json({ message: 'You need to be logged in', likedProjects: [] });
    return;
  }

  const { projectId } = req.params;

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: 'Please provide a valid project ID', likedProjects: [] });
    return;
  }

  User.findByIdAndUpdate(
    userId,
    { $pull: { likedProjects: projectId } },
    { new: true }
  )
    .then(user => {
      if (!user) {
        res.status(404).json({ message: 'Could not find your user account', likedProjects: [] });
        return;
      }

      res.status(200).json({ message: 'Removed from your liked projects!', likedProjects: user.likedProjects });
    })
    .catch(next);
};

// Get all projects that the user has liked
export const getLikedProjects = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const userId = req.userId;
  
  if (!userId) {
    res.status(401).json({ message: 'You need to be logged in', likedProjects: [] });
    return;
  }

  User.findById(userId)
    .populate('likedProjects', 'title gameState createdAt updatedAt')
    .select('likedProjects')
    .then(user => {
      if (!user) {
        res.status(404).json({ message: 'Could not find your user account', likedProjects: [] });
        return;
      }

      res.status(200).json({ likedProjects: user.likedProjects });
    })
    .catch(next);
}; 
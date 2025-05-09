import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import mongoose from 'mongoose';

// Create a new project
export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, gameState } = req.body;

    if (!title || !gameState) {
      res.status(400).json({
        success: false,
        message: 'Title and game state are required',
      });
      return;
    }

    const project = new Project({
      title,
      gameState,
      owner: req.userId,
    });

    await project.save();

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    next(error);
  }
};

// List all projects for the authenticated user
export const listProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projects = await Project.find({ owner: req.userId })
      .select('_id title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    next(error);
  }
};

// Get a specific project
export const getProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
      return;
    }

    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId,
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    next(error);
  }
}; 
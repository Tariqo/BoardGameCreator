import { Request, Response } from 'express';
import { Project } from '../models/Project';

export const nextTurn = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId; // ✅ this works because Request was extended globally
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    const playerCount = project.gameState.players.length;
    project.gameState.turn = (project.gameState.turn + 1) % playerCount;

    await project.save();
    return res.status(200).json({ msg: 'Turn advanced', gameState: project.gameState });
  } catch (err) {
    return res.status(500).json({ msg: 'Error advancing turn', error: err });
  }
};

export const rollDice = (_req: Request, res: Response) => {
  const result = Math.ceil(Math.random() * 6);
  res.status(200).json({ dice: result });
};

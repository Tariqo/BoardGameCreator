import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  gameState: any; // This will store the game state data
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    gameState: {
      type: Schema.Types.Mixed,
      required: [true, 'Game state is required'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
projectSchema.index({ owner: 1 });
projectSchema.index({ title: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema); 
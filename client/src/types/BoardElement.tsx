export type BoardElementType = 'card' | 'text' | 'token' | 'drawZone' | 'discardZone' | 'placementZone';

export type BoardElement = {
  id: string;
  name: string;
  type: BoardElementType;
  x: number;
  y: number;
  imageUrl?: string;
  width?: number;
  height?: number;
};
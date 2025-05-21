import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

type CanvasElement = {
  id: string;
  name: string;
  type: 'card' | 'text' | 'token';
  x: number;
  y: number;
};

interface GameCanvasProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onElementMove: (id: string, x: number, y: number) => void;
  onElementDrop?: (
    element: Omit<CanvasElement, 'id'>,
    position: { x: number; y: number }
  ) => void;
  panelVisible: boolean;
}

const BASE_WIDTH = 1600;
const BASE_HEIGHT = 800;

const GameCanvas: React.FC<GameCanvasProps> = ({
  elements,
  selectedId,
  onSelect,
  onElementMove,
  onElementDrop,
  panelVisible,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(1);

useEffect(() => {
  const resize = () => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      // update scale or canvas size
    }
  };
  resize();
  window.addEventListener('resize', resize);
  return () => window.removeEventListener('resize', resize);
}, [panelVisible]);


  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;

    try {
      const raw = e.dataTransfer.getData('application/json');
      const dropped = JSON.parse(raw);

      const newEl: CanvasElement = {
        ...dropped,
        id: Date.now().toString(),
        x: pointer.x / scale,
        y: pointer.y / scale,
      };

      onElementDrop?.(dropped, { x: newEl.x, y: newEl.y });
    } catch {
      console.error('Invalid drop');
    }
  };

  return (
    <div
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full h-full relative bg-gray-100"
    >
      <Stage
        ref={stageRef}
        width={BASE_WIDTH}
        height={BASE_HEIGHT}
        scaleX={scale}
        scaleY={scale}
        style={{ transformOrigin: 'top left' }}
      >
      <Layer>
        {/* Highlight canvas area */}
        <Rect
          x={0}
          y={0}
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          fill="#fafafa"
          stroke="#aaa"
          strokeWidth={2}
          cornerRadius={8}
          listening={false} // prevents blocking clicks
        />

        {/* Background click to deselect */}
        <Rect
          x={0}
          y={0}
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          fill="transparent"
          onClick={() => onSelect(null)}
          onTap={() => onSelect(null)}
        />

        {elements.map((el) => (
          <Group
            key={el.id}
            x={el.x}
            y={el.y}
            draggable
            onClick={() => onSelect(el.id)}
            onTap={() => onSelect(el.id)}
            onDragEnd={(e) => {
              const newX = Math.max(0, Math.min(e.target.x(), BASE_WIDTH - 100));
              const newY = Math.max(0, Math.min(e.target.y(), BASE_HEIGHT - 60));
              e.target.position({ x: newX, y: newY });
              onElementMove(el.id, newX, newY);
            }}
          >
            <Rect
              width={100}
              height={60}
              fill={selectedId === el.id ? 'skyblue' : 'lightgray'}
              stroke={selectedId === el.id ? 'blue' : 'black'}
              strokeWidth={2}
              cornerRadius={8}
            />
            <Text
              text={el.name}
              x={10}
              y={20}
              fontSize={16}
              fill="black"
            />
          </Group>
        ))}
      </Layer>

      </Stage>
    </div>
  );
};

export default GameCanvas;

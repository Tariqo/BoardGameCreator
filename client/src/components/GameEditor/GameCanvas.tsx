import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

interface CanvasElement {
  id: string;
  name: string;
  type: 'card' | 'text' | 'token'; 
  x: number;
  y: number;
}


interface GameCanvasProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onElementMove: (id: string, x: number, y: number) => void;
  onElementDrop?: (el: Omit<CanvasElement, 'id'>, position: { x: number; y: number }) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  elements,
  selectedId,
  onSelect,
  onElementMove,
  onElementDrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!pointer || !onElementDrop) return;

    try {
      const raw = e.dataTransfer.getData('application/json');
      const dropped = JSON.parse(raw); // { name: ..., type: ... }

      onElementDrop(dropped, pointer);
    } catch {
      console.error('Invalid drop data');
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ backgroundColor: '#f4f4f4' }}
      >
        <Layer>
          {elements.map((el) => (
            <React.Fragment key={el.id}>
              <Rect
                x={el.x}
                y={el.y}
                width={100}
                height={60}
                fill={selectedId === el.id ? 'skyblue' : 'lightgray'}
                stroke={selectedId === el.id ? 'blue' : 'black'}
                strokeWidth={2}
                cornerRadius={8}
                draggable
                onClick={() => onSelect(el.id)}
                onTap={() => onSelect(el.id)}
                onDragEnd={(e) => {
                  onElementMove(el.id, e.target.x(), e.target.y());
                }}
              />
              <Text
                text={el.name}
                x={el.x + 10}
                y={el.y + 20}
                fontSize={16}
                fill="black"
              />
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default GameCanvas;

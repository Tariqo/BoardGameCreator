import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';

interface CanvasCard {
  id: number;
  name: string;
  x: number;
  y: number;
}

const spriteUrl = 'https://konvajs.org/assets/lion.png';

const GameCanvas: React.FC = () => {
  const stageRef = useRef<any>(null);
  const [cardsOnCanvas, setCardsOnCanvas] = useState<CanvasCard[]>([]);
  const [spriteImage, setSpriteImage] = useState<HTMLImageElement | null>(null);
  const [lionPos, setLionPos] = useState({ x: 600, y: 100 });

  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const img = new window.Image();
    img.src = spriteUrl;
    img.onload = () => setSpriteImage(img);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log('Drop triggered');
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;

    try {
      const raw = e.dataTransfer.getData('application/json');
      const droppedCard = JSON.parse(raw);

      const newCard: CanvasCard = {
        ...droppedCard,
        id: Date.now(),
        x: pointer.x,
        y: pointer.y,
      };

      setCardsOnCanvas((prev) => [...prev, newCard]);
    } catch {
      console.error('Invalid card drop');
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ border: '1px solid #ccc', padding: '1rem' }}
    >
      <h2>Game Canvas</h2>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        style={{
          border: '2px dashed red',
          backgroundColor: '#f4f4f4',
        }}
        ref={stageRef}
      >
        <Layer>
          {cardsOnCanvas.map((card) => (
            <React.Fragment key={card.id}>
              <Rect
                x={card.x}
                y={card.y}
                width={100}
                height={60}
                fill="lightblue"
                stroke="black"
                cornerRadius={8}
                draggable
              />
              <Text
                text={card.name}
                x={card.x + 10}
                y={card.y + 20}
                fontSize={16}
                fill="black"
              />
            </React.Fragment>
          ))}

          {spriteImage && (
            <KonvaImage
              image={spriteImage}
              x={lionPos.x}
              y={lionPos.y}
              width={100}
              height={100}
              draggable
              onDragEnd={(e) => {
                setLionPos({
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
              dragBoundFunc={(pos) => {
                return {
                  x: Math.max(0, Math.min(stageSize.width - 100, pos.x)),
                  y: Math.max(0, Math.min(stageSize.height - 100, pos.y)),
                };
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default GameCanvas;

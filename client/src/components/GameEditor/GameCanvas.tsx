import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';

interface CanvasCard {
  id: number;
  name: string;
  x: number;
  y: number;
}

const spriteUrl = 'https://konvajs.org/assets/lion.png';

const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const [cardsOnCanvas, setCardsOnCanvas] = useState<CanvasCard[]>([]);
  const [spriteImage, setSpriteImage] = useState<HTMLImageElement | null>(null);
  const [lionPos, setLionPos] = useState({ x: 600, y: 100 });

  // Resize logic
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

  // Load sprite
  useEffect(() => {
    const img = new window.Image();
    img.src = spriteUrl;
    img.onload = () => setSpriteImage(img);
  }, []);

  // Drop handler
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full h-[500px] md:h-[600px] bg-gray-100 border"
    >
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ backgroundColor: '#f4f4f4' }}
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
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default GameCanvas;

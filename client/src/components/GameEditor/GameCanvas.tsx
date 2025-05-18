import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

interface CanvasCard {
  id: number;
  name: string;
  x: number;
  y: number;
}

const GameCanvas: React.FC = () => {
  const stageRef = useRef<any>(null); // to get pointer position
  const [cardsOnCanvas, setCardsOnCanvas] = useState<CanvasCard[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    console.log('Drop triggered');
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;

    try {
      const raw = e.dataTransfer.getData('application/json');
      const droppedCard = JSON.parse(raw);

      const newCard: CanvasCard = {
        ...droppedCard,
        id: Date.now(), // new ID for canvas instance
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
      style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '2rem' }}
    >
      <h2>Game Canvas</h2>
      <Stage
        ref={stageRef}
        width={800}
        height={500}
        style={{ border: '1px solid black', backgroundColor: '#f4f4f4' }}
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
        </Layer>
      </Stage>
    </div>
  );
};

export default GameCanvas;

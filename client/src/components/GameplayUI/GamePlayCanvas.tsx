import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { BoardElement } from '../../types/BoardElement';
import { Card } from '../../types/Card';

interface GamePlayCanvasProps {
  canvasZones?: BoardElement[]; // made optional to avoid crash on undefined
  playedCards: Card[];
  discardPile: Card[];
  draggedCard: Card | null;
  onPlayCard: (card: Card, pos: { x: number; y: number }) => void;
}


const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;
const ZONE_WIDTH = 160;
const ZONE_HEIGHT = 100;

const DiscardImage: React.FC<{ topCard?: Card; discardZone?: BoardElement }> = ({ topCard, discardZone }) => {
  const [img] = useImage(topCard?.imageUrl || '');
  if (!discardZone || !topCard || !img) return null;
  return (
    <KonvaImage
      image={img}
      x={discardZone.x}
      y={discardZone.y}
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
    />
  );
};

const CardImage: React.FC<{ card: Card; x: number; y: number }> = ({ card, x, y }) => {
  const [img] = useImage(card.imageUrl ?? '');
  if (!img) return null;
  return <KonvaImage image={img} x={x} y={y} width={CARD_WIDTH} height={CARD_HEIGHT} />;
};

const GamePlayCanvas: React.FC<GamePlayCanvasProps> = ({
  canvasZones = [],
  playedCards,
  discardPile,
  draggedCard,
  onPlayCard,
}) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setContainerSize({ width: offsetWidth, height: offsetHeight });
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const playArea = canvasZones.find((z) => z.type === 'placementZone');
  const drawZone = canvasZones.find((z) => z.type === 'drawZone');
  const discardZone = canvasZones.find((z) => z.type === 'discardZone');
  const topDiscardCard = discardPile[discardPile.length - 1];

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!stageRef.current || !draggedCard) return;
    const stageBox = stageRef.current.container().getBoundingClientRect();
    const x = e.clientX - stageBox.left;
    const y = e.clientY - stageBox.top;

    if (playArea) {
      const withinX = x >= playArea.x && x <= playArea.x + (playArea.width || ZONE_WIDTH);
      const withinY = y >= playArea.y && y <= playArea.y + (playArea.height || ZONE_HEIGHT);
      if (withinX && withinY) {
        onPlayCard(draggedCard, { x, y });
      }
    }
  };
    // console.log('Canvas Zones:', canvasZones);
    // console.log('Played Cards:', playedCards);
    // console.log('Discard Pile:', discardPile);
  return (
    
    <div
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="w-full h-full"
    >
      <Stage width={containerSize.width} height={containerSize.height} ref={stageRef}>
        <Layer>
          {/* Draw Zone */}
          {drawZone && (
            <Group x={drawZone.x} y={drawZone.y}>
              <Rect
                width={ZONE_WIDTH}
                height={ZONE_HEIGHT}
                fill="#4b5563"
                stroke="#fff"
                strokeWidth={2}
                cornerRadius={6}
              />
              <Text
                text="Draw Pile"
                fill="white"
                fontSize={14}
                width={ZONE_WIDTH}
                align="center"
              />
            </Group>
          )}

          {/* Discard Zone */}
          {discardZone && (
            <>
              <Group x={discardZone.x} y={discardZone.y}>
                <Rect
                  width={ZONE_WIDTH}
                  height={ZONE_HEIGHT}
                  fill="#78350f"
                  stroke="#facc15"
                  strokeWidth={2}
                  cornerRadius={6}
                />
                <Text
                  text="Discard Pile"
                  fill="white"
                  fontSize={14}
                  width={ZONE_WIDTH}
                  align="center"
                />
              </Group>
              <DiscardImage topCard={topDiscardCard} discardZone={discardZone} />
            </>
          )}

          {/* Play Area */}
          {playArea && (
            <Group x={playArea.x} y={playArea.y}>
              <Rect
                width={playArea.width || 240}
                height={playArea.height || 160}
                fill="#22c55e"
                stroke="#16a34a"
                strokeWidth={3}
                cornerRadius={8}
              />
              <Text
                text="Play Area"
                fill="black"
                fontSize={16}
                width={playArea.width || 240}
                align="center"
              />
            </Group>
          )}

          {/* Played Cards */}
          {playedCards.map((card, i) => (
            <CardImage
              key={card.id}
              card={card}
              x={card.x ?? (playArea?.x ?? 100) + 20 + i * 30}
              y={card.y ?? (playArea?.y ?? 100)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default GamePlayCanvas;

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Group, Image as KonvaImage, Transformer } from 'react-konva';

type ZoneMode = 'draw' | 'discard' | null;
type PileCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type CanvasElement = {
  id: string;
  name: string;
  type: 'card' | 'text' | 'token';
  x: number;
  y: number;
  imageUrl?: string;
  width?: number;
  height?: number;
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
  updateElement: (id: string, changes: Partial<CanvasElement>) => void;
  panelVisible: boolean;
  zoneMode?: ZoneMode;
  setZoneMode?: (mode: ZoneMode) => void;
}

const BASE_WIDTH = 1600;
const BASE_HEIGHT = 800;
const ZONE_SIZE = 120;

const GameCanvas: React.FC<GameCanvasProps> = ({
  elements,
  selectedId,
  onSelect,
  onElementMove,
  onElementDrop,
  updateElement,
  panelVisible,
  zoneMode,
  setZoneMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [scale, setScale] = useState(1);
  const [imageCache, setImageCache] = useState<Record<string, HTMLImageElement>>({});
  const [drawPileCorner, setDrawPileCorner] = useState<PileCorner | null>(null);
  const [discardPileCorner, setDiscardPileCorner] = useState<PileCorner | null>(null);

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        const { offsetWidth } = containerRef.current;
        const newScale = offsetWidth / BASE_WIDTH;
        setScale(newScale);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [panelVisible]);

  useEffect(() => {
    elements.forEach((el) => {
      if (el.imageUrl && !imageCache[el.id]) {
        const img = new Image();
        img.src = el.imageUrl;
        img.onload = () => {
          setImageCache((prev) => ({ ...prev, [el.id]: img }));
          if (!el.width || !el.height) {
            updateElement(el.id, { width: img.width, height: img.height });
          }
        };
      }
    });
  }, [elements]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (trRef.current && selectedId && layerRef.current) {
        const node = layerRef.current.findOne(`#${selectedId}`);
        if (node && node.getAbsoluteTransform) {
          trRef.current.nodes([node]);
          trRef.current.getLayer().batchDraw();
        }
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [selectedId, elements]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const stageBox = stage.container().getBoundingClientRect();
    const x = (e.clientX - stageBox.left) / scale;
    const y = (e.clientY - stageBox.top) / scale;
    try {
      const raw = e.dataTransfer.getData('application/json');
      const dropped = JSON.parse(raw);
      const newEl: CanvasElement = {
        ...dropped,
        id: Date.now().toString(),
        x,
        y,
      };
      onElementDrop?.(dropped, { x, y });
    } catch {
      console.error('Invalid drop');
    }
  };

  const renderZoneHighlight = () => {
    if (!zoneMode) return null;

    const zones: { x: number; y: number; label: PileCorner }[] = [
      { x: 0, y: 0, label: 'top-left' },
      { x: BASE_WIDTH - ZONE_SIZE, y: 0, label: 'top-right' },
      { x: 0, y: BASE_HEIGHT - ZONE_SIZE, label: 'bottom-left' },
      { x: BASE_WIDTH - ZONE_SIZE, y: BASE_HEIGHT - ZONE_SIZE, label: 'bottom-right' },
    ];

    return zones.map((zone, idx) => {
      const isActive =
        (zoneMode === 'draw' && drawPileCorner === zone.label) ||
        (zoneMode === 'discard' && discardPileCorner === zone.label);

      const isDisabled =
        (zoneMode === 'draw' && discardPileCorner === zone.label) ||
        (zoneMode === 'discard' && drawPileCorner === zone.label);

      return (
        <Group
          key={idx}
          onClick={() => {
            if (isDisabled) return;
            if (zoneMode === 'draw') setDrawPileCorner(zone.label);
            if (zoneMode === 'discard') setDiscardPileCorner(zone.label);
            setZoneMode?.(null);
          }}
        >
          <Rect
            x={zone.x}
            y={zone.y}
            width={ZONE_SIZE}
            height={ZONE_SIZE}
            stroke={
              isDisabled
                ? 'gray'
                : zoneMode === 'draw'
                ? 'green'
                : 'orange'
            }
            strokeWidth={isActive ? 6 : 4}
            dash={[10, 6]}
          />
          <Text
            text={
              zoneMode === 'draw'
                ? isActive
                  ? 'Draw Pile (✓)'
                  : 'Draw Pile'
                : isActive
                ? 'Discard Pile (✓)'
                : 'Discard Pile'
            }
            x={zone.x + 6}
            y={zone.y + 6}
            fontSize={12}
            fill={isDisabled ? 'gray' : zoneMode === 'draw' ? 'green' : 'orange'}
          />
        </Group>
      );
    });
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
        <Layer ref={layerRef}>
          <Rect
            x={0}
            y={0}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            fill="#fafafa"
            stroke="#aaa"
            strokeWidth={2}
            cornerRadius={8}
            listening={false}
          />
          <Rect
            x={0}
            y={0}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            fill="transparent"
            onClick={() => onSelect(null)}
            onTap={() => onSelect(null)}
          />

          {renderZoneHighlight()}

          {elements.map((el) => {
            const isSelected = el.id === selectedId;
            if (el.imageUrl && imageCache[el.id]) {
              const img = imageCache[el.id];
              const width = el.width || img.width || 100;
              const height = el.height || img.height || 100;
              return (
                <KonvaImage
                  key={el.id}
                  id={el.id}
                  image={img}
                  x={el.x}
                  y={el.y}
                  width={width}
                  height={height}
                  draggable
                  onClick={() => onSelect(el.id)}
                  onTap={() => onSelect(el.id)}
                  onDragEnd={(e) => {
                    const node = e.target;
                    const newX = Math.max(0, Math.min(node.x(), BASE_WIDTH - width));
                    const newY = Math.max(0, Math.min(node.y(), BASE_HEIGHT - height));
                    node.position({ x: newX, y: newY });
                    onElementMove(el.id, newX, newY);
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    const newWidth = Math.max(20, node.width() * scaleX);
                    const newHeight = Math.max(20, node.height() * scaleY);
                    updateElement(el.id, { width: newWidth, height: newHeight });
                    if (trRef.current) {
                      trRef.current.nodes([node]);
                      trRef.current.getLayer().batchDraw();
                    }
                  }}
                />
              );
            }

            return (
              <Group
                key={el.id}
                id={el.id}
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
                  fill={isSelected ? 'skyblue' : 'lightgray'}
                  stroke={isSelected ? 'blue' : 'black'}
                  strokeWidth={2}
                  cornerRadius={8}
                />
                <Text text={el.name} x={10} y={20} fontSize={16} fill="black" />
              </Group>
            );
          })}

          {selectedId && <Transformer ref={trRef} rotateEnabled={false} />}
        </Layer>
      </Stage>
    </div>
  );
};

export default GameCanvas;

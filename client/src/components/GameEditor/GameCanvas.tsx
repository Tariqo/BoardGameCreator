import React, { useRef, useEffect, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Text,
  Group,
  Image as KonvaImage,
  Transformer,
} from 'react-konva';
import { BoardElement as CanvasElement } from '../../types/BoardElement';

type ZoneMode = 'draw' | 'discard' | null;

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
  showGrid?: boolean;
}

const GRID_SIZE = 40;

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
  showGrid,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageCache, setImageCache] = useState<Record<string, HTMLImageElement>>({});

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
    const x = e.clientX - stageBox.left;
    const y = e.clientY - stageBox.top;
    try {
      const raw = e.dataTransfer.getData('application/json');
      const dropped = JSON.parse(raw);

      if (['drawZone', 'discardZone', 'placementZone'].includes(dropped.type)) {
        const existing = elements.find((el) => el.type === dropped.type);
        if (existing) {
          onSelect(null);
          updateElement(existing.id, { x: -9999, y: -9999 });
        }
      }

      onElementDrop?.(dropped, { x, y });
    } catch {
      console.error('Invalid drop');
    }
  };

  const renderGridLines = () => {
    if (!showGrid) return null;
    const lines = [];
    for (let i = GRID_SIZE; i < containerSize.width; i += GRID_SIZE) {
      lines.push(<Rect key={`v-${i}`} x={i} y={0} width={1} height={containerSize.height} fill="#eee" />);
    }
    for (let j = GRID_SIZE; j < containerSize.height; j += GRID_SIZE) {
      lines.push(<Rect key={`h-${j}`} x={0} y={j} width={containerSize.width} height={1} fill="#eee" />);
    }
    return lines;
  };

  return (
    <div
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full h-full bg-gray-100"
      style={{ overflow: 'hidden' }}
    >
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        style={{ transformOrigin: 'top left' }}
      >
        <Layer ref={layerRef}>
          <Rect
            x={0}
            y={0}
            width={containerSize.width}
            height={containerSize.height}
            fill="#fafafa"
            stroke="#aaa"
            strokeWidth={2}
            cornerRadius={8}
            listening={false}
          />

          <Rect
            x={0}
            y={0}
            width={containerSize.width}
            height={containerSize.height}
            fill="transparent"
            onClick={() => onSelect(null)}
            onTap={() => onSelect(null)}
          />

          {renderGridLines()}

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
                    const newX = Math.max(0, Math.min(node.x(), containerSize.width - width));
                    const newY = Math.max(0, Math.min(node.y(), containerSize.height - height));
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
                  }}
                />
              );
            }

            const colorMap: Record<string, { fill: string; stroke: string }> = {
              drawZone: { fill: '#bbf7d0', stroke: '#15803d' },
              discardZone: { fill: '#fef9c3', stroke: '#ca8a04' },
              placementZone: { fill: '#e9d5ff', stroke: '#7e22ce' },
            };

            const zone = colorMap[el.type] || {
              fill: isSelected ? 'skyblue' : 'lightgray',
              stroke: isSelected ? 'blue' : 'black',
            };

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
                  const newX = Math.max(0, Math.min(e.target.x(), containerSize.width - 100));
                  const newY = Math.max(0, Math.min(e.target.y(), containerSize.height - 60));
                  e.target.position({ x: newX, y: newY });
                  onElementMove(el.id, newX, newY);
                }}
              >
                <Rect
                  width={el.width || 100}
                  height={el.height || 60}
                  fill={zone.fill}
                  stroke={zone.stroke}
                  strokeWidth={2}
                  cornerRadius={8}
                />
                <Text
                  text={el.name}
                  fontSize={Math.min((el.width || 100) / 10, 22)}
                  align="center"
                  verticalAlign="middle"
                  width={el.width || 100}
                  height={el.height || 60}
                  padding={10}
                  fill="black"
                />
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

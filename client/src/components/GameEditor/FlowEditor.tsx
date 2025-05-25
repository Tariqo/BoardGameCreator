import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

export type FlowStep = {
  id: string;
  label: string;
  next?: string | null;
  x: number;
  y: number;
  locked?: boolean;
};

interface FlowEditorProps {
  flow: FlowStep[];
  setFlow: React.Dispatch<React.SetStateAction<FlowStep[]>>;
  onClose: () => void;
}

const FlowEditor: React.FC<FlowEditorProps> = ({ flow, setFlow, onClose }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [draggingLine, setDraggingLine] = useState<{ x: number; y: number } | null>(null);
  const offset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const AVAILABLE_STEPS = ['draw card', 'play card', 'check win/loss'];

  useEffect(() => {
    if (flow.length === 0) {
      const startNode: FlowStep = {
        id: 'start-turn',
        label: 'start turn',
        x: 50,
        y: 180,
        locked: true,
      };
      const endNode: FlowStep = {
        id: 'end-turn',
        label: 'end turn',
        x: 1000,
        y: 180,
        locked: true,
      };
      setFlow([startNode, endNode]);
    }
  }, []);


  const addStep = (label: string) => {
    const newStep: FlowStep = {
      id: uuid(),
      label,
      next: null,
      x: Math.random() * 600 + 200,
      y: Math.random() * 150 + 50,
    };
    setFlow((prev) => [...prev, newStep]);
  };

  const startDrag = (e: React.MouseEvent, id: string) => {
    const step = flow.find((s) => s.id === id);
    if (step?.locked) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDraggingId(id);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (draggingId) {
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds) return;
      setFlow((prevFlow) =>
        prevFlow.map((step) =>
          step.id === draggingId
            ? {
                ...step,
                x: e.clientX - offset.current.x - bounds.left,
                y: e.clientY - offset.current.y - bounds.top,
              }
            : step
        )
      );
    }
    if (linkSource) {
      setDraggingLine({ x: e.clientX, y: e.clientY });
    }
  };

  const stopDrag = () => {
    setDraggingId(null);
    setDraggingLine(null);
  };

  const tryConnectSteps = (fromId: string, toId: string) => {
    if (fromId === toId || fromId === 'end-turn' || toId === 'start-turn') return;
    const visited = new Set<string>();
    let current: string | undefined = toId;
    while (current) {
      if (current === fromId) return;
      const step = flow.find((s) => s.id === current);
      current = step?.next || undefined;
    }
    setFlow((prevFlow) => {
      return prevFlow.map((s) => {
        if (s.id === fromId) {
          return { ...s, next: toId };
        }
        if (s.next === toId || (s.id !== fromId && s.next === prevFlow.find((f) => f.id === fromId)?.next)) {
          return { ...s, next: null };
        }
        return s;
      });
    });
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopDrag);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [draggingId, linkSource]);

  const renderArrows = () => {
    const arrows = new Set<string>();
    const paths = flow
      .filter((step) => step.next)
      .map((step) => {
        const from = step;
        const to = flow.find((s) => s.id === step.next);
        if (!to) return null;
        const key = `${from.id}->${to.id}`;
        if (arrows.has(key)) return null;
        arrows.add(key);
        const x1 = from.x + 136;
        const y1 = from.y + 20;
        const x2 = to.x - 8;
        const y2 = to.y + 20;
        const dx = x2 - x1;
        const curvature = 0.3;
        const cx1 = x1 + dx * curvature;
        const cy1 = y1;
        const cx2 = x2 - dx * curvature;
        const cy2 = y2;
        return (
          <path
            key={key}
            d={`M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`}
            fill="none"
            stroke="black"
            strokeWidth={1.5}
            markerEnd="url(#arrowhead)"
          />
        );
      });

    if (linkSource && draggingLine) {
      const from = flow.find((s) => s.id === linkSource);
      if (from) {
        const x1 = from.x + 136;
        const y1 = from.y + 20;
        const x2 = draggingLine.x - canvasRef.current!.getBoundingClientRect().left;
        const y2 = draggingLine.y - canvasRef.current!.getBoundingClientRect().top;
        paths.push(
          <line
            key="temp-line"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="gray"
            strokeDasharray="4"
            strokeWidth={1.5}
          />
        );
      }
    }

    return paths;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Game Flow Editor</h2>
        <button onClick={onClose} className="text-red-500 text-sm">
          Close
        </button>
      </div>
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Available Actions:</p>
        <div className="flex gap-2 flex-wrap">
          {AVAILABLE_STEPS.map((label) => (
            <button
              key={label}
              onClick={() => addStep(label)}
              className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={canvasRef}
        className="relative w-full h-96 border rounded bg-gray-50 overflow-hidden"
      >
        <svg className="absolute w-full h-full z-0">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="black" />
            </marker>
          </defs>
          {renderArrows()}
        </svg>
        {flow.map((step) => (
          <div
            key={step.id}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startDrag(e, step.id);
            }}
            onClick={(e) => {
              if (linkSource && linkSource !== step.id) {
                tryConnectSteps(linkSource, step.id);
                setLinkSource(null);
                setDraggingLine(null);
              }
            }}
            className="absolute border px-4 py-2 rounded shadow text-sm select-none z-10 bg-white"
            style={{ left: step.x, top: step.y }}
          >
            <div className="relative w-max flex items-center gap-2">
              {step.label}
              {!step.locked && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFlow(prev => prev.filter(s => s.id !== step.id));
                  }}
                  className="text-red-500 text-xs hover:underline"
                  title="Delete step"
                >
                  ✕
                </button>
              )}
              {step.id !== 'end-turn' && (
                <div
                  className="absolute right-[-12px] top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-pointer z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLinkSource(step.id);
                  }}
                />
              )}
              {step.id !== 'start-turn' && (
                <div
                  className="absolute left-[-12px] top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full cursor-pointer z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (linkSource && step.id !== linkSource) {
                      tryConnectSteps(linkSource, step.id);
                      setLinkSource(null);
                      setDraggingLine(null);
                    }
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowEditor;

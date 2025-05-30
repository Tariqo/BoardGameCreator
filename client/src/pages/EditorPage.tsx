import React, { useEffect, useRef, useState } from 'react';
import GameCanvas from '../components/GameEditor/GameCanvas';
import RightPanel from '../components/Layout/RightPanel';
import EditorTopbar from '../components/Layout/EditorTopbar';
import EditorSidebar from '../components/Layout/EditorSidebar';
import { v4 as uuid } from 'uuid';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useLayout } from '../store/layoutStore';
import { RuleSet } from '../components/GameEditor/RuleSetEditor';
import DeckBuilder from '../components/GameEditor/DeckBuilder';
import { Card } from '../types/Card';
import FlowEditor, { FlowStep } from '../components/GameEditor/FlowEditor';
import download from 'downloadjs';
import { BoardElement } from '../types/BoardElement';
import config from '../config/config';

type ZoneMode = 'draw' | 'discard' | null;

const EditorPage = () => {
  const { state: elements, set: setElements, undo, redo } = useUndoRedo<BoardElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [zoneMode, setZoneMode] = useState<ZoneMode>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [lastSavedRuleSet, setLastSavedRuleSet] = useState<RuleSet | null>(null);
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  const [showFlowEditor, setShowFlowEditor] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const { players: initialPlayers } = useLayout();
  const [players] = useState(
    initialPlayers.map((p) => ({ name: p.name, hand: [] as Card[] }))
  );
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile] = useState<Card[]>([]);
  const [shuffleOnStart, setShuffleOnStart] = useState(
    () => JSON.parse(localStorage.getItem('shuffleOnStart') || 'true')
  );

  const [gameFlow, setGameFlow] = useState<FlowStep[]>([
    { id: uuid(), label: 'start turn', next: null, x: 50, y: 60 },
    { id: uuid(), label: 'draw card', next: null, x: 200, y: 60 },
    { id: uuid(), label: 'play card', next: null, x: 350, y: 60 },
    { id: uuid(), label: 'check win/loss', next: null, x: 500, y: 60 },
    { id: uuid(), label: 'end turn', next: null, x: 650, y: 60 },
  ]);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    if (canvasWrapperRef.current) {
      observer.observe(canvasWrapperRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const addElement = (type: 'card' | 'text' | 'token') => {
    const newElement: BoardElement = {
      id: uuid(),
      name: `New ${type}`,
      type,
      x: 150,
      y: 100,
    };
    setElements([...elements, newElement]);
  };

  const handleElementMove = (id: string, x: number, y: number) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, x, y } : el)));
  };

  const handleElementDrop = (
    dropped: Omit<BoardElement, 'id'>,
    position: { x: number; y: number }
  ) => {
    const isZone =
      dropped.type === 'drawZone' ||
      dropped.type === 'discardZone' ||
      dropped.type === 'placementZone';

    if (isZone) {
      const filtered = elements.filter((el) => el.type !== dropped.type);
      const newElement: BoardElement = {
        id: uuid(),
        name: dropped.name,
        type: dropped.type,
        x: position.x,
        y: position.y,
        width: 160,
        height: 80,
      };
      setElements([...filtered, newElement]);
      return;
    }

    const newElement: BoardElement = {
      id: uuid(),
      name: dropped.name,
      type: dropped.type,
      x: position.x,
      y: position.y,
      imageUrl: dropped.imageUrl,
      width: dropped.width,
      height: dropped.height,
    };

    setElements([...elements, newElement]);
  };

  const updateElement = (id: string, updated: Partial<BoardElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updated } : el)));
  };

  const handleSaveGame = async () => {
    if (!lastSavedRuleSet) {
      alert('Please save the rule set first.');
      return;
    }

    const gameData = {
      ruleSet: lastSavedRuleSet,
      players,
      initialCardsPerPlayer: players.map((p) => p.hand.length),
      deck,
      discardPile,
      gameFlow,
      canvas: elements,
      shuffleOnStart,
    };

    try {
      const response = await fetch('/api/save-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });

      const result = await response.json();
      // console.log('Game saved:', result);
      alert('Game saved successfully!');

      const fileName = `${lastSavedRuleSet.name || 'boardgame'}-config.json`;
      download(JSON.stringify(gameData, null, 2), fileName, 'application/json');
    } catch (error) {
      console.error('Failed to save game:', error);
      alert('Failed to save game.');
    }
  };

  const handlePublish = async () => {
    const data = {
      ruleSet: lastSavedRuleSet ?? {
        id: crypto.randomUUID(),
        name: 'Untitled Rule Set',
        gameplayMode: 'cards',
        maxPlayers: players.length,
        teamCount: 1,
        playersPerTeam: players.length,
        winConditions: [],
        eliminationConditions: [],
        actions: [],
        tags: [],
        turnEffects: [],
        initialHand: [],
        initialHandCount: 0,
      },
      canvas: elements,
      gameFlow,
      deck,
      discardPile,
      players,
      maxPlayers: players.length,
      initialHandCount: players.map((p) => p.hand.length),
      shuffleOnStart, // ✅ included in publish
    };

    try {
      const res = await fetch(`${config.apiUrl}/api/published/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        alert('Game published to library!');
      } else {
        throw new Error(result.message || 'Failed to publish');
      }
    } catch (err) {
      console.error('Error publishing game:', err);
      alert('Failed to publish game.');
    }
  };

  const handleRuleSetSave = (ruleSet: RuleSet) => {
    setLastSavedRuleSet(ruleSet);
    alert('Rule set saved! Now you can use "Save Game" in the top bar.');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          undo();
        }
        if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
        }
      }

      if (e.key === 'Delete' && selectedId) {
        setElements(elements.filter((el) => el.id !== selectedId));
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, undo, redo, setElements]);

  return (
    <div className="flex flex-col h-screen">
      <EditorTopbar
        isRightPanelVisible={showRightPanel}
        onToggleRightPanel={() => setShowRightPanel((prev) => !prev)}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
        onSaveGame={handleSaveGame}
        onToggleDeckBuilder={() => setShowDeckBuilder((prev) => !prev)}
        onToggleFlowEditor={() => setShowFlowEditor((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          onAdd={addElement}
          onUploadSprite={(src) => {
            if (elements.length === 0) return;
            const last = elements[elements.length - 1];
            updateElement(last.id, { imageUrl: src });
          }}
          onSaveGame={handleRuleSetSave}
        />

        <main className="flex-1 flex flex-col overflow-auto bg-gray-50">
          <div className="p-6 flex flex-col min-h-full">
            <h1 className="text-2xl font-bold mb-4">Game Editor</h1>

            <div className="relative flex-1 min-h-0" ref={canvasWrapperRef}>
              {containerSize.width > 0 && containerSize.height > 0 && (
                <GameCanvas
                  elements={elements}
                  selectedId={selectedId}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setSelectedCard(null);
                  }}
                  onElementMove={handleElementMove}
                  onElementDrop={handleElementDrop}
                  updateElement={updateElement}
                  panelVisible={showRightPanel}
                  zoneMode={zoneMode}
                  setZoneMode={setZoneMode}
                  showGrid={showGrid}
                />
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={handlePublish}
                className="bg-orange-500 text-white px-3 py-2 rounded"
              >
                Publish Game
              </button>
            </div>
          </div>

          {showDeckBuilder && (
            <div className="w-full bg-white border-t shadow-md p-4">
              <DeckBuilder
                deck={deck}
                setDeck={setDeck}
                onSelectCard={(card) => {
                  setSelectedCard(card);
                  setSelectedId(null);
                }}
                shuffleOnStart={shuffleOnStart}
                setShuffleOnStart={setShuffleOnStart}
              />
            </div>
          )}

          {showFlowEditor && (
            <FlowEditor
              flow={gameFlow}
              setFlow={setGameFlow}
              onClose={() => setShowFlowEditor(false)}
            />
          )}
        </main>

        {showRightPanel && (
          <RightPanel
            selectedElement={selectedElement}
            selectedCard={selectedCard}
            onUpdate={(updated) => {
              if (selectedId) updateElement(selectedId, updated);
              if (selectedCard) {
                setDeck(deck.map((card) =>
                  card.id === selectedCard.id ? { ...card, ...updated } : card
                ));
              }
            }}
            onClose={() => setShowRightPanel(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EditorPage;

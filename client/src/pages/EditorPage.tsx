import React, { useEffect, useState } from 'react';
import GameCanvas from '../components/GameEditor/GameCanvas';
import RightPanel from '../components/Layout/RightPanel';
import EditorTopbar from '../components/Layout/EditorTopbar';
import EditorSidebar from '../components/Layout/EditorSidebar';
import { v4 as uuid } from 'uuid';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useLayout } from '../store/layoutStore';
import { RuleSet } from '../components/GameEditor/RuleSetEditor';
import DeckBuilder, { Card } from '../components/GameEditor/DeckBuilder';
import FlowEditor, { FlowStep } from '../components/GameEditor/FlowEditor';
import download from 'downloadjs';
import { publishGame } from '../components/ProjectManager/PublishGame';
import { BoardElement } from '../components/types/BoardElement';

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

  const { players: initialPlayers } = useLayout();
  const [players] = useState(
    initialPlayers.map((p) => ({ name: p.name, hand: [] as Card[] }))
  );
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile] = useState<Card[]>([]);

  const [gameFlow, setGameFlow] = useState<FlowStep[]>([
    { id: uuid(), label: 'start turn', next: null, x: 50, y: 60 },
    { id: uuid(), label: 'draw card', next: null, x: 200, y: 60 },
    { id: uuid(), label: 'play card', next: null, x: 350, y: 60 },
    { id: uuid(), label: 'check win/loss', next: null, x: 500, y: 60 },
    { id: uuid(), label: 'end turn', next: null, x: 650, y: 60 },
  ]);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

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
      // Remove any existing element of the same type
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

    // Otherwise add normally
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
      initialCardsPerPlayer: players.map(p => p.hand.length),
      deck,
      discardPile,
      gameFlow,
      canvas: elements,
    };

    try {
      const response = await fetch('/api/save-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });

      const result = await response.json();
      console.log('Game saved:', result);
      alert('Game saved successfully!');

      const fileName = `${lastSavedRuleSet.name || 'boardgame'}-config.json`;
      download(JSON.stringify(gameData, null, 2), fileName, 'application/json');
    } catch (error) {
      console.error('Failed to save game:', error);
      alert('Failed to save game.');
    }
  };

  const handlePublish = () => {
    publishGame({
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
      elements,
      gameFlow,
      deck,
      discardPile,
      players,
      maxPlayers: players.length,
      initialHandCount: players.map((p) => p.hand.length),
      fileName: 'boardgame-published.json',
    });
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

            <div className="relative w-full flex-1 border border-gray-300 bg-white rounded-md shadow-md overflow-auto">
              <div style={{ width: 1600, height: 800 }}>
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
              </div>
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

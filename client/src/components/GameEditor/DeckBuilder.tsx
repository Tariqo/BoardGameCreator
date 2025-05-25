import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import ConditionsEditor, { Condition } from './ConditionsEditor';

export type Card = {
  id: string;
  name: string;
  imageUrl?: string;
  tags?: string[];
  playConditions?: Condition[];
  effects?: any[];
};

interface DeckBuilderProps {
  deck: Card[];
  setDeck: (newDeck: Card[]) => void;
  onSelectCard: (card: Card | null) => void;
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({ deck, setDeck, onSelectCard }) => {
  const [newCardName, setNewCardName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [shuffleOnStart, setShuffleOnStart] = useState(
    () => JSON.parse(localStorage.getItem('shuffleOnStart') || 'true')
  );

  const addCardToDeck = () => {
    if (!newCardName) return;
    const newCard: Card = {
      id: uuid(),
      name: newCardName,
      imageUrl: imageUrl || undefined,
    };
    setDeck([...deck, newCard]);
    setNewCardName('');
    setImageUrl('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadedCards: Card[] = [];

    Array.from(files).forEach((file) => {
      const name = file.name.replace(/\.[^/.]+$/, '');
      const url = URL.createObjectURL(file);

      uploadedCards.push({
        id: uuid(),
        name,
        imageUrl: url,
      });
    });

    setDeck([...deck, ...uploadedCards]);
  };

  const toggleShuffle = () => {
    const newValue = !shuffleOnStart;
    setShuffleOnStart(newValue);
    localStorage.setItem('shuffleOnStart', JSON.stringify(newValue));
  };

  const handleCardSelect = (card: Card) => {
    const isSelected = selectedCardId === card.id;
    setSelectedCardId(isSelected ? null : card.id);
    onSelectCard(isSelected ? null : card);
  };

  const handleCardRemove = (cardId: string) => {
    setDeck(deck.filter(c => c.id !== cardId));
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
      onSelectCard(null);
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow-md space-y-4 w-full max-w-xl">
      <h3 className="font-bold text-lg">Deck Builder</h3>

      <input
        type="text"
        placeholder="Card Name"
        value={newCardName}
        onChange={(e) => setNewCardName(e.target.value)}
        className="w-full border px-2 py-1 rounded"
      />
      <input
        type="text"
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full border px-2 py-1 rounded"
      />
      <button
        onClick={addCardToDeck}
        className="bg-blue-600 text-white px-3 py-1 rounded w-full"
      >
        Add Card to Deck
      </button>

      <div className="pt-2">
        <label className="block text-sm font-medium mb-1">Mass Upload Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="w-full text-sm"
        />
      </div>

      <div className="pt-2">
        <label className="block text-sm font-medium mb-1">Shuffle Deck on Start</label>
        <button
          onClick={toggleShuffle}
          className={`w-full px-3 py-2 rounded text-sm font-medium ${
            shuffleOnStart ? 'bg-green-200 text-green-900' : 'bg-gray-200 text-gray-800'
          }`}
        >
          {shuffleOnStart ? 'Shuffling Enabled' : 'Shuffling Disabled'}
        </button>
      </div>

      <p className="text-sm text-gray-600">Deck has {deck.length} card(s).</p>

      <div className="grid grid-cols-3 gap-2 mt-4 max-h-80 overflow-y-auto">
        {deck.map((card) => (
          <div
            key={card.id}
            className={`relative border p-2 rounded text-center bg-gray-50 shadow-sm cursor-pointer ${
              selectedCardId === card.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleCardSelect(card)}
          >
            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering selection
                handleCardRemove(card.id);
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center hover:bg-red-600"
              title="Remove card"
            >
              ✕
            </button>

            {card.imageUrl ? (
              <div className="w-24 h-24 mx-auto border rounded overflow-hidden bg-white">
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto flex items-center justify-center bg-gray-200 text-sm rounded">
                No Image
              </div>
            )}
            <p className="mt-1 text-xs font-medium truncate">{card.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeckBuilder;

import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

export type Card = {
  id: string;
  name: string;
  imageUrl?: string;
};

interface DeckBuilderProps {
  deck: Card[];
  setDeck: (newDeck: Card[]) => void;
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({ deck, setDeck }) => {
  const [newCardName, setNewCardName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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

      <p className="text-sm text-gray-600">Deck has {deck.length} card(s).</p>

      <div className="grid grid-cols-3 gap-2 mt-4 max-h-80 overflow-y-auto">
        {deck.map((card) => (
          <div key={card.id} className="border p-2 rounded text-center bg-gray-50 shadow-sm">
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full h-24 object-cover rounded"
              />
            ) : (
              <div className="w-full h-24 flex items-center justify-center bg-gray-200 text-sm">
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

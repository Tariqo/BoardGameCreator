import React from 'react';
import { v4 as uuid } from 'uuid';
import { Card } from '../../types/Card';
import config from '../../config/config';

interface DeckBuilderProps {
  deck: Card[];
  setDeck: (newDeck: Card[]) => void;
  onSelectCard: (card: Card | null) => void;
  shuffleOnStart: boolean;
  setShuffleOnStart: (value: boolean) => void;
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({
  deck,
  setDeck,
  onSelectCard,
  shuffleOnStart,
  setShuffleOnStart,
}) => {
  const [newCardName, setNewCardName] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);

  const uploadSprite = async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('sprite', file);

    const response = await fetch(`${config.apiUrl}/api/assets/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const result = await response.json();

    if (!result.success || !result.url) {
      throw new Error(result.message || 'Upload failed');
    }

    return { url: result.url, publicId: result.public_id };
  };

  const deleteSprite = async (publicId: string) => {
    try {
      await fetch(`${config.apiUrl}/api/assets/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error);
    }
  };

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      const name = file.name.replace(/\.[^/.]+$/, '');
      try {
        const { url, publicId } = await uploadSprite(file);
        return {
          id: uuid(),
          name,
          imageUrl: url,
          publicId,
        } as Card;
      } catch (err) {
        console.error(`Upload failed for ${name}:`, err);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const uploadedCards = results.filter((card): card is Card => card !== null);

    if (uploadedCards.length > 0) {
      setDeck([...deck, ...uploadedCards]);
    }
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

  const handleCardRemove = async (cardId: string) => {
    const card = deck.find(c => c.id === cardId);
    if (!card) return;

    if (card.publicId) {
      await deleteSprite(card.publicId);
    }

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
            <button
              onClick={(e) => {
                e.stopPropagation();
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
                <small className="text-[10px] break-all text-gray-400">{card.imageUrl}</small>
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

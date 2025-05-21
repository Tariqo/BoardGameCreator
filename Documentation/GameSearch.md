
# Game Search & Discovery API Documentation

This document outlines the available endpoints for game search, filtering, activity tracking, and listing in the TableTop Studio backend. All routes are prefixed with `/api/games`.

---

## GET `/api/games/search`
**Purpose**: Search for games by name, filter by tags, and sort results.

### Query Parameters:
| Parameter | Type   | Description                                      |
|-----------|--------|--------------------------------------------------|
| `q`       | string | Partial name of the game (case-insensitive)     |
| `genre`   | string | Game genre (e.g., strategy, puzzle)              |
| `players` | number | Number of players the game supports (exact match)|
| `time`    | number | Maximum estimated play time in minutes           |
| `sort`    | string | Optional: `rating` or `date`                     |

### Response:
```json
[
  {
    "_id": "...",
    "name": "Catan",
    "genre": "strategy",
    "players": 4,
    "playTime": 45,
    "rating": 4.8,
    "createdAt": "..."
  },
  ...
]
```

---

## GET `/api/games/status`
**Purpose**: Return the number of players currently playing a game.

### Query Parameters:
| Parameter | Type   | Description               |
|-----------|--------|---------------------------|
| `id`      | string | Game ID (MongoDB ObjectId) |

### Response:
```json
{
  "playersOnline": 3
}
```

---

## GET `/api/games/popular`
**Purpose**: Get the top 10 most played games to display on the homepage.

### Response:
```json
[
  {
    "_id": "...",
    "name": "Chess",
    "plays": 1200,
    "rating": 4.9,
    "imageUrl": "..."
  },
  ...
]
```

---

## Required Game Schema Fields
Ensure the following fields exist in the `Game` model for full API support:

```js
{
  name: String,
  genre: String,
  players: Number,
  playTime: Number,
  rating: Number,
  createdAt: Date,
  plays: Number,
  imageUrl: String // optional for frontend display
}
```

---

## Notes
- All endpoints return JSON.
- Use proper error handling on frontend: check for 400 and 500 codes.
- The `/status` route requires a shared `activeGames` Map updated by your Socket.IO server logic.
- Consider adding pagination and caching for large result sets in `/search`.

---

**Maintained by**: Backend Team @ TableTop Studio  
**Last updated**: May 2025

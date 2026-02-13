// src/game/setup.ts

import type { GameState, Player, PlayerGrid, GridSlot } from './types';
import {
  NUM_PLAYERS,
  GRID_SIZE,
} from './types';
import type { Card } from './types';
import { createFullDeck, shuffleDeck } from './deck';

// Helper: create an empty 3x3 grid filled with nulls
function createEmptyGrid(): PlayerGrid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
}

// Helper: deal one 3x3 grid of face-down cards to a single player
function dealGridFromDeck(deck: Card[]): { grid: PlayerGrid; remainingDeck: Card[] } {
  let remainingDeck = [...deck];
  const grid = createEmptyGrid();

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const card = remainingDeck.shift();
      if (!card) {
        throw new Error('Not enough cards in deck to deal a full grid.');
      }

      const slot: GridSlot = {
        card,
        faceUp: false,
      };

      grid[row][col] = slot;
    }
  }

  return { grid, remainingDeck };
}

/**
 * Create the initial game state:
 * - Build and shuffle the full deck
 * - Deal a 3x3 grid (9 face-down cards) to each of the 4 players
 * - Remaining cards go into drawPile
 */
export function createInitialGameState(playerNames?: string[]): GameState {
  // 1. Build and shuffle deck
  let deck = shuffleDeck(createFullDeck());

  // 2. Create players and deal grids
  const players: Player[] = [];

  for (let i = 0; i < NUM_PLAYERS; i++) {
    const name =
      playerNames && playerNames[i] ? playerNames[i] : `Player ${i + 1}`;

    const { grid, remainingDeck } = dealGridFromDeck(deck);
    deck = remainingDeck;

    players.push({
      id: i,
      name,
      grid,
      initialFlipsRemaining: 3,
    });
  }

  // 3. Construct initial GameState
  const initialState: GameState = {
    players,
    drawPile: deck,
    discardPile: [],
    activeCard: null,
    activeCardSource: null,
    finalRoundStarterId: null,
    finalTurnsRemaining: 0,
    currentPlayerId: 0,
    turn: 1,
    phase: 'SETUP', 
    winnerId: null,
  };

  return initialState;
}

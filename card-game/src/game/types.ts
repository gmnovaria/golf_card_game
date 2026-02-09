// src/game/types.ts

// ---- Suits & Ranks ----

// Eight custom suits.
// Placeholder names for now; rename later to whatever you want.
export type Suit =
  | 'hearts'
  | 'diamonds'
  | 'clubs'
  | 'spades'
  | 'hearts2'
  | 'diamonds2'
  | 'clubs2'
  | 'spades2';

// Standard ranks A–K. Jokers exist separately.
export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

// Joker is treated as a special case.
export type SpecialRank = 'Joker';

// ---- Card ----

export interface Card {
  id: string;      // unique ID for React keys & logic
  rank: Rank | SpecialRank;
  suit?: Suit;     // Jokers have no suit
}

// ---- Player & Grid ----

export type PlayerId = number;

export interface GridSlot {
  card: Card;
  faceUp: boolean; // initially: all 9 are false
}

export type PlayerGrid = (GridSlot | null)[][]; // exactly 3x3

export interface Player {
  id: PlayerId;
  name: string;
  grid: PlayerGrid;
  initialFlipsRemaining: number;
}

// ---- Game State ----

export type Phase = 'SETUP' | 'PLAYING' | 'GAME_OVER';

export interface GameState {
  players: Player[];      // always 4
  drawPile: Card[];       // undealt cards
  discardPile: Card[];    // used cards
  currentPlayerId: PlayerId;
  turn: number;
  phase: Phase;
  winnerId: PlayerId | null;
}

// ---- Constants ----

export const NUM_PLAYERS = 4;
export const GRID_SIZE = 3;
export const CARDS_PER_PLAYER = GRID_SIZE * GRID_SIZE; // 9

// Deck math:
// 8 suits × 13 ranks = 104
// + 4 Jokers = 108 total
export const SUIT_COUNT = 8;
export const RANKS_PER_SUIT = 13;
export const TOTAL_JOKERS = 4;

export const SUITS: { id: Suit; symbol: string}[] = [
  { id: 'hearts', symbol: '♥' },
  { id: 'diamonds', symbol: '♦' },
  { id: 'clubs', symbol: '♣' },
  { id: 'spades', symbol: '♠' },
  { id: 'hearts2', symbol: '♥' },
  { id: 'diamonds2', symbol: '♦' },
  { id: 'clubs2', symbol: '♣' },
  { id: 'spades2', symbol: '♠' },
];

export const RANKS: Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

export const TOTAL_CARDS = SUIT_COUNT * RANKS_PER_SUIT + TOTAL_JOKERS;

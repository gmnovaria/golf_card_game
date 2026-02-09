// src/game/deck.ts
import type { Card, Rank, Suit } from './types'
import { RANKS, SUITS, TOTAL_JOKERS } from './types';

export function createFullDeck(): Card[] {
  const deck: Card[] = [];

  // Normal 8 × 13 = 104 cards
  SUITS.forEach((suit) => {
    RANKS.forEach((rank: Rank) => {
      deck.push({
      id : `card-${suit.id}-${rank}-${deck.length}`,
      rank,
      suit: suit.id as Suit,
      });
    });
  });

  // 4 Jokers
  for (let i = 0; i < TOTAL_JOKERS; i++) {
    deck.push({
      id: `joker-${i}`,
      rank: 'Joker',
      suit: undefined,
    });
  }

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// src/game/deck.ts
import type { Card } from './types'
import { RANKS, SUITS, TOTAL_JOKERS } from './types';

export function createFullDeck(): Card[] {
  const cards: Card[] = [];

  // Normal 8 × 13 = 104 cards
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      const id = `card-${suit}-${rank}`;
      cards.push({
        id,
        suit,
        rank,
      });
    });
  });

  // 4 Jokers
  for (let i = 0; i < TOTAL_JOKERS; i++) {
    cards.push({
      id: `joker-${i}`,
      rank: 'Joker',
      suit: undefined,
    });
  }

  return cards;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// src/game/score.ts

import type { Card, GameState, Player, PlayerGrid, PlayerId, Rank } from './types';

const RANK_POINTS: Record<Rank, number> = {
  A: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 10,
  Q: 10,
  K: 0,
};

const LINE_COORDS: Array<ReadonlyArray<readonly [number, number]>> = [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]],
];

function cardPoints(card: Card): number {
  if (card.rank === 'Joker') {
    return -2;
  }

  return RANK_POINTS[card.rank];
}

function keyForCoord(row: number, col: number): string {
  return `${row},${col}`;
}

function isNonJokerThreeOfAKind(cards: Card[]): boolean {
  if (cards.length !== 3) {
    return false;
  }

  const [first, second, third] = cards;
  if (first.rank === 'Joker' || second.rank === 'Joker' || third.rank === 'Joker') {
    return false;
  }

  return first.rank === second.rank && second.rank === third.rank;
}

export function scorePlayerGrid(grid: PlayerGrid): number {
  const zeroedCoords = new Set<string>();

  for (const line of LINE_COORDS) {
    const cards: Card[] = [];
    let validLine = true;

    for (const [row, col] of line) {
      const slot = grid[row]?.[col];
      if (!slot) {
        validLine = false;
        break;
      }
      cards.push(slot.card);
    }

    if (!validLine) {
      continue;
    }

    if (isNonJokerThreeOfAKind(cards)) {
      for (const [row, col] of line) {
        zeroedCoords.add(keyForCoord(row, col));
      }
    }
  }

  let total = 0;

  for (let row = 0; row < grid.length; row++) {
    const gridRow = grid[row];
    for (let col = 0; col < gridRow.length; col++) {
      const slot = gridRow[col];
      if (!slot) {
        continue;
      }

      if (zeroedCoords.has(keyForCoord(row, col))) {
        continue;
      }

      total += cardPoints(slot.card);
    }
  }

  return total;
}

export function scorePlayer(player: Player): number {
  return scorePlayerGrid(player.grid);
}

export function scorePlayers(players: Player[]): Record<PlayerId, number> {
  const scores: Record<PlayerId, number> = {};

  for (const player of players) {
    scores[player.id] = scorePlayer(player);
  }

  return scores;
}

export function scoreStatePlayers(state: GameState): Record<PlayerId, number> {
  return scorePlayers(state.players);
}

export function findLowestScorePlayerId(scores: Record<PlayerId, number>): PlayerId | null {
  let bestId: PlayerId | null = null;
  let bestScore = Infinity;

  for (const [rawId, score] of Object.entries(scores)) {
    const playerId = Number(rawId) as PlayerId;
    if (score < bestScore) {
      bestScore = score;
      bestId = playerId;
    }
  }

  return bestId;
}

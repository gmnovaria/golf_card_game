// src/game/actions.ts

import type { Card, GameState, GridSlot, PlayerGrid, PlayerId } from './types';
import { GRID_SIZE } from './types';
import { shuffleDeck } from './deck';
import { findLowestScorePlayerId, scoreStatePlayers } from './score';

function nextPlayerState(state: GameState): Pick<GameState, 'currentPlayerId' | 'turn'> {
  const nextPlayerId = (state.currentPlayerId + 1) % state.players.length;
  const nextTurn = nextPlayerId === 0 ? state.turn + 1 : state.turn;
  return {
    currentPlayerId: nextPlayerId,
    turn: nextTurn,
  };
}

function isPlayerFullyFaceUp(state: GameState, playerId: PlayerId): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return false;
  }

  return player.grid.every((row) =>
    row.every((slot) => !!slot && slot.faceUp),
  );
}

function revealAllCards(state: GameState): GameState {
  const revealedPlayers = state.players.map((player) => ({
    ...player,
    grid: player.grid.map((row) =>
      row.map((slot) => (slot ? { ...slot, faceUp: true } : slot)),
    ),
  }));

  return {
    ...state,
    players: revealedPlayers,
  };
}

function createEmptyGrid(): PlayerGrid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null),
  );
}

function dealGridFromDeck(deck: Card[]): { grid: PlayerGrid; remainingDeck: Card[] } {
  const grid = createEmptyGrid();
  const remainingDeck = [...deck];

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

function collectAllCards(state: GameState): Card[] {
  const gridCards = state.players.flatMap((player) =>
    player.grid.flatMap((row) => row.flatMap((slot) => (slot ? [slot.card] : []))),
  );

  return [
    ...gridCards,
    ...state.drawPile,
    ...state.discardPile,
    ...(state.activeCard ? [state.activeCard] : []),
  ];
}

function finalizeGameOverState(state: GameState): GameState {
  const revealedState = revealAllCards(state);
  const scores = scoreStatePlayers(revealedState);
  const winnerId = findLowestScorePlayerId(scores);
  const updatedScoreHistory = { ...revealedState.scoreHistory };

  for (const player of revealedState.players) {
    const playerHistory = updatedScoreHistory[player.id] ?? [];
    updatedScoreHistory[player.id] = [...playerHistory, scores[player.id]];
  }

  return {
    ...revealedState,
    phase: 'GAME_OVER',
    winnerId,
    scoreHistory: updatedScoreHistory,
  };
}

function resolveEndOfTurn(state: GameState, completedPlayerId: PlayerId): GameState {
  const next = nextPlayerState(state);

  if (state.finalRoundStarterId !== null && state.finalTurnsRemaining > 0) {
    const updatedFinalTurnsRemaining = state.finalTurnsRemaining - 1;

    if (updatedFinalTurnsRemaining <= 0) {
      return {
        ...finalizeGameOverState(state),
        finalTurnsRemaining: 0,
        currentPlayerId: next.currentPlayerId,
        turn: next.turn,
      };
    }

    return {
      ...state,
      finalTurnsRemaining: updatedFinalTurnsRemaining,
      currentPlayerId: next.currentPlayerId,
      turn: next.turn,
    };
  }

  if (isPlayerFullyFaceUp(state, completedPlayerId)) {
    const turnsForOtherPlayers = state.players.length - 1;

    if (turnsForOtherPlayers <= 0) {
      return {
        ...finalizeGameOverState(state),
        finalRoundStarterId: completedPlayerId,
        finalTurnsRemaining: 0,
      };
    }

    return {
      ...state,
      finalRoundStarterId: completedPlayerId,
      finalTurnsRemaining: turnsForOtherPlayers,
      currentPlayerId: next.currentPlayerId,
      turn: next.turn,
    };
  }

  return {
    ...state,
    currentPlayerId: next.currentPlayerId,
    turn: next.turn,
  };
}

export function flipGridCard(
  state: GameState,
  playerId: PlayerId,
  row: number,
  col: number,
): GameState {
  // Only allow flips in SETUP phase
  if (state.phase !== 'SETUP') {
    return state;
  }

  // Only current player can flip
  if (state.currentPlayerId !== playerId) {
    return state;
  }

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    return state;
  }

  const player = state.players[playerIndex];

  // If player has no flips remaining, do nothing
  if (player.initialFlipsRemaining <= 0) {
    return state;
  }

  const grid = player.grid;
  const slot = grid[row]?.[col];

  if (!slot || slot.faceUp) {
    // no slot or already face up
    return state;
  }

  // Flip the card
  const newSlot = { ...slot, faceUp: true };
  const newGrid = grid.map((r, rIndex) =>
    r.map((c, cIndex) =>
      rIndex === row && cIndex === col ? newSlot : c,
    ),
  );

  const updatedPlayer = {
    ...player,
    grid: newGrid,
    initialFlipsRemaining: player.initialFlipsRemaining - 1,
  };

  const newPlayers = state.players.map((p, idx) =>
    idx === playerIndex ? updatedPlayer : p,
  );

  let newState: GameState = {
    ...state,
    players: newPlayers,
  };

  // After flip, if this player is done with their 3 flips, move to next player
  if (updatedPlayer.initialFlipsRemaining === 0) {
    const allDone = newPlayers.every((p) => p.initialFlipsRemaining === 0);

    if (allDone) {
      // Everyone done with setup -> start main play
      let updatedDrawPile = newState.drawPile;
      let updatedDiscardPile = newState.discardPile;

      if (updatedDrawPile.length > 0) {
        const [topCard, ...rest] = updatedDrawPile;
        updatedDrawPile = rest;
        updatedDiscardPile = [topCard, ...updatedDiscardPile];
      }

      newState = {
        ...newState,
        drawPile: updatedDrawPile,
        discardPile: updatedDiscardPile,
        activeCard: null,
        activeCardSource: null,
        phase: 'PLAYING',
        currentPlayerId: 0, // back to Gage
        turn: 1,
      };
    } else {
      // Move to next player who still has flips remaining
      let nextId = state.currentPlayerId;
      const totalPlayers = newPlayers.length;

      for (let i = 1; i <= totalPlayers; i++) {
        const candidateId = (state.currentPlayerId + i) % totalPlayers;
        const candidate = newPlayers.find((p) => p.id === candidateId);
        if (candidate && candidate.initialFlipsRemaining > 0) {
          nextId = candidateId;
          break;
        }
      }

      newState = {
        ...newState,
        currentPlayerId: nextId,
      };
    }
  }

  return newState;
}

export function chooseTurnCard(
  state: GameState,
  playerId: PlayerId,
  source: 'Draw' | 'Discard',
): GameState {
  if (state.phase !== 'PLAYING') {
    return state;
  }

  if (state.currentPlayerId !== playerId) {
    return state;
  }

  // Current player must resolve the active card before choosing again.
  if (state.activeCard) {
    return state;
  }

  if (source === 'Draw') {
    let updatedDrawPile = state.drawPile;
    let updatedDiscardPile = state.discardPile;

    if (updatedDrawPile.length === 0) {
      if (updatedDiscardPile.length === 0) {
        return state;
      }

      updatedDrawPile = shuffleDeck(updatedDiscardPile);
      updatedDiscardPile = [];
    }

    const [topDrawCard, ...restDrawPile] = updatedDrawPile;
    if (!topDrawCard) {
      return state;
    }

    return {
      ...state,
      discardPile: updatedDiscardPile,
      drawPile: restDrawPile,
      activeCard: topDrawCard,
      activeCardSource: 'Draw',
    };
  }

  const [topDiscardCard, ...restDiscardPile] = state.discardPile;
  if (!topDiscardCard) {
    return state;
  }

  return {
    ...state,
    discardPile: restDiscardPile,
    activeCard: topDiscardCard,
    activeCardSource: 'Discard',
  };
}

export function placeActiveCardInGrid(
  state: GameState,
  playerId: PlayerId,
  row: number,
  col: number,
): GameState {
  if (state.phase !== 'PLAYING') {
    return state;
  }

  if (state.currentPlayerId !== playerId) {
    return state;
  }

  if (!state.activeCard || !state.activeCardSource) {
    return state;
  }

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    return state;
  }

  const player = state.players[playerIndex];
  const targetSlot = player.grid[row]?.[col];
  if (!targetSlot) {
    return state;
  }

  const replacedCard = targetSlot.card;
  const updatedSlot = {
    card: state.activeCard,
    faceUp: true,
  };

  const updatedGrid = player.grid.map((gridRow, rowIndex) =>
    gridRow.map((slot, colIndex) =>
      rowIndex === row && colIndex === col ? updatedSlot : slot,
    ),
  );

  const updatedPlayers = state.players.map((p, idx) =>
    idx === playerIndex ? { ...p, grid: updatedGrid } : p,
  );

  const updatedState: GameState = {
    ...state,
    players: updatedPlayers,
    discardPile: [replacedCard, ...state.discardPile],
    activeCard: null,
    activeCardSource: null,
  };

  return resolveEndOfTurn(updatedState, playerId);
}

export function discardActiveDrawCard(
  state: GameState,
  playerId: PlayerId,
): GameState {
  if (state.phase !== 'PLAYING') {
    return state;
  }

  if (state.currentPlayerId !== playerId) {
    return state;
  }

  if (!state.activeCard || state.activeCardSource !== 'Draw') {
    return state;
  }

  const updatedState: GameState = {
    ...state,
    discardPile: [state.activeCard, ...state.discardPile],
    activeCard: null,
    activeCardSource: null,
  };

  return resolveEndOfTurn(updatedState, playerId);
}

export function startNextHand(state: GameState, totalHands: number): GameState {
  if (state.phase !== 'GAME_OVER') {
    return state;
  }

  if (state.currentHand >= totalHands) {
    return state;
  }

  let deck = shuffleDeck(collectAllCards(state));
  const redealtPlayers = state.players.map((player) => {
    const { grid, remainingDeck } = dealGridFromDeck(deck);
    deck = remainingDeck;

    return {
      ...player,
      grid,
      initialFlipsRemaining: 3,
    };
  });

  return {
    ...state,
    players: redealtPlayers,
    drawPile: deck,
    discardPile: [],
    activeCard: null,
    activeCardSource: null,
    currentHand: state.currentHand + 1,
    finalRoundStarterId: null,
    finalTurnsRemaining: 0,
    currentPlayerId: 0,
    turn: 1,
    phase: 'SETUP',
    winnerId: null,
  };
}

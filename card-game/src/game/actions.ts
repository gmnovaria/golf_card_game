// src/game/actions.ts

import type { GameState, PlayerId } from './types';

function nextPlayerState(state: GameState): Pick<GameState, 'currentPlayerId' | 'turn'> {
  const nextPlayerId = (state.currentPlayerId + 1) % state.players.length;
  const nextTurn = nextPlayerId === 0 ? state.turn + 1 : state.turn;
  return {
    currentPlayerId: nextPlayerId,
    turn: nextTurn,
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
    const [topDrawCard, ...restDrawPile] = state.drawPile;
    if (!topDrawCard) {
      return state;
    }

    return {
      ...state,
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

  const next = nextPlayerState(state);

  return {
    ...state,
    players: updatedPlayers,
    discardPile: [replacedCard, ...state.discardPile],
    activeCard: null,
    activeCardSource: null,
    currentPlayerId: next.currentPlayerId,
    turn: next.turn,
  };
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

  const next = nextPlayerState(state);

  return {
    ...state,
    discardPile: [state.activeCard, ...state.discardPile],
    activeCard: null,
    activeCardSource: null,
    currentPlayerId: next.currentPlayerId,
    turn: next.turn,
  };
}

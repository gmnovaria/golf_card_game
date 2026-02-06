// src/game/actions.ts

import type { GameState, PlayerId } from './types';

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
      newState = {
        ...newState,
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

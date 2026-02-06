// src/App.tsx

import { useState } from 'react';
import type { GameState, GridSlot } from './game/types';
import { createInitialGameState } from './game/setup';

// Seating positions (indices into game.players)
const SOUTH_INDEX = 0; // Gage
const WEST_INDEX = 1;  // Player 2
const NORTH_INDEX = 2; // Player 3
const EAST_INDEX = 3;  // Player 4

const INITIAL_STATE: GameState = createInitialGameState([
  'Gage',      // South
  'Player 2',  // West
  'Player 3',  // North
  'Player 4',  // East
]);

function App() {
  const [game] = useState<GameState>(INITIAL_STATE);

  const southPlayer = game.players[SOUTH_INDEX];
  const westPlayer = game.players[WEST_INDEX];
  const northPlayer = game.players[NORTH_INDEX];
  const eastPlayer = game.players[EAST_INDEX];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a202c',
        color: 'white',
        padding: '1rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem' }}>Card Game Prototype</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Turn: {game.turn} — Current Player:{' '}
        <strong>{game.players[game.currentPlayerId].name}</strong>
      </p>

            {/* Round table layout using CSS grid for symmetric spacing */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto auto',
          gridTemplateColumns: 'auto auto auto',
          rowGap: '3rem',      // vertical spacing between rows
          columnGap: '3rem',   // horizontal spacing between columns
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* North player (top center, rotated 180°) */}
        <div style={{ gridRow: 1, gridColumn: 2, textAlign: 'center' }}>
          <PlayerPanel
            playerName={northPlayer.name}
            grid={northPlayer.grid}
            rotation={180}
          />
        </div>

        {/* West player (middle left, rotated 90°) */}
        <div style={{ gridRow: 2, gridColumn: 1, textAlign: 'center' }}>
          <PlayerPanel
            playerName={westPlayer.name}
            grid={westPlayer.grid}
            rotation={90}
          />
        </div>

        {/* Center piles (middle center) */}
        <div style={{ gridRow: 2, gridColumn: 2, textAlign: 'center' }}>
          <CenterPiles
            drawCount={game.drawPile.length}
            discardCount={game.discardPile.length}
          />
        </div>

        {/* East player (middle right, rotated 270°) */}
        <div style={{ gridRow: 2, gridColumn: 3, textAlign: 'center' }}>
          <PlayerPanel
            playerName={eastPlayer.name}
            grid={eastPlayer.grid}
            rotation={270}
          />
        </div>

        {/* South player (bottom center, upright) */}
        <div style={{ gridRow: 3, gridColumn: 2, textAlign: 'center' }}>
          <PlayerPanel
            playerName={southPlayer.name}
            grid={southPlayer.grid}
            rotation={0}
          />
        </div>
      </div>

    </div>
  );
}

interface PlayerPanelProps {
  playerName: string;
  grid: (GridSlot | null)[][];
  rotation: number; // degrees
}

function PlayerPanel({ playerName, grid, rotation }: PlayerPanelProps) {
  return (
    <div
      style={{
        display: 'inline-block',
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          border: '1px solid #4a5568',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          backgroundColor: '#2d3748',
        }}
      >
        <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
          {playerName}
        </div>
        <GridView grid={grid} />
      </div>
    </div>
  );
}

interface GridViewProps {
  grid: (GridSlot | null)[][];
}

function GridView({ grid }: GridViewProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 40px)',
        gridTemplateRows: 'repeat(3, 60px)',
        gap: '4px',
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((slot, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          if (!slot) {
            return (
              <div
                key={key}
                style={{
                  border: '1px solid #4a5568',
                  borderRadius: '4px',
                  backgroundColor: '#1a202c',
                }}
              />
            );
          }

          return (
            <div
              key={key}
              style={{
                border: '1px solid #4a5568',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2d3748',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {slot.faceUp ? slot.card.rank : 'Golf'}
            </div>
          );
        }),
      )}
    </div>
  );
}

interface CenterPilesProps {
  drawCount: number;
  discardCount: number;
}

function CenterPiles({ drawCount, discardCount }: CenterPilesProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Center</div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        {/* Draw pile */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 50,
              height: 70,
              borderRadius: 6,
              border: '2px solid #e2e8f0',
              backgroundColor: '#4a5568',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem',
            }}
          >
            {/* face-down back of the deck */}
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>DRAW</span>
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            Cards: <strong>{drawCount}</strong>
          </div>
        </div>

        {/* Discard pile */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 50,
              height: 70,
              borderRadius: 6,
              border: '2px dashed #e2e8f0',
              backgroundColor: discardCount > 0 ? '#742a2a' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>DISCARD</span>
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            Cards: <strong>{discardCount}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
